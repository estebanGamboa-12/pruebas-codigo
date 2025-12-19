'use client';

import { useEffect, useMemo, useState } from 'react';
import { missingSupabaseConfigMessage, supabaseClient } from '../../lib/supabaseClient';
import QRCode from 'react-qr-code';

interface EventRow {
  id: string;
  title: string;
  starts_at: string | null;
}

interface TicketTypeRow {
  id: string;
  event_id: string;
  name: string;
  capacity: number | null;
}

interface IssuedToken {
  token: string;
  ticketTypeId: string;
  eventId: string;
  createdAt: string;
}

export default function AdminPage() {
  if (!supabaseClient) {
    return (
      <section>
        <h2>Admin</h2>
        <div className="alert error">{missingSupabaseConfigMessage}</div>
        <p>Configura las variables de Supabase y recarga para crear eventos, tipos de ticket y emitir QR.</p>
      </section>
    );
  }

  const client = supabaseClient!;
  const [role, setRole] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeRow[]>([]);
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [ticketEventId, setTicketEventId] = useState('');
  const [ticketName, setTicketName] = useState('');
  const [capacity, setCapacity] = useState<number>(0);
  const [issueEventId, setIssueEventId] = useState('');
  const [issueTicketTypeId, setIssueTicketTypeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [issuedTokens, setIssuedTokens] = useState<IssuedToken[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showQrGallery, setShowQrGallery] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;
      const { data: profile } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      setRole(profile?.role ?? null);
      await refreshData();
    };
    load();
  }, [client]);

  const refreshData = async () => {
    const { data: eventsData } = await client
      .from('events')
      .select('id, title, starts_at')
      .order('starts_at', { ascending: true });
    setEvents(eventsData ?? []);
    const { data: typesData } = await client
      .from('ticket_types')
      .select('id, event_id, name, capacity')
      .order('created_at', { ascending: false });
    setTicketTypes(typesData ?? []);
  };

  const isAdmin = useMemo(() => role === 'admin', [role]);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const { error } = await client.from('events').insert({
      title,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      status: 'draft',
    });
    if (error) setMessage(error.message);
    else {
      setTitle('');
      setStartsAt('');
      await refreshData();
      setMessage('Event created.');
    }
  };

  const createTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!ticketEventId) return setMessage('Select event');
    const { error } = await client.from('ticket_types').insert({
      event_id: ticketEventId,
      name: ticketName,
      capacity: capacity || null,
    });
    if (error) setMessage(error.message);
    else {
      setTicketName('');
      setCapacity(0);
      await refreshData();
      setMessage('Ticket type created.');
    }
  };

  const issueTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setMessage('Login required.');
      return;
    }
    const res = await fetch('/api/admin/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventId: issueEventId,
        ticketTypeId: issueTicketTypeId,
        quantity,
        buyerName,
        buyerEmail,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error || 'Failed to issue');
      return;
    }
    const now = new Date().toISOString();
    const tokens = (body.tokens as string[]).map((t) => ({
      token: t,
      ticketTypeId: issueTicketTypeId,
      eventId: issueEventId,
      createdAt: now,
    }));
    setIssuedTokens((prev) => [...tokens, ...prev].slice(0, 20));
    setMessage(`Issued ${tokens.length} tickets.`);
  };

  const ticketTypesForEvent = ticketTypes.filter((t) => t.event_id === issueEventId);

  return (
    <section>
      <h2>Admin</h2>
      {!isAdmin && <div className="alert error">Admin access required.</div>}

      <section>
        <h3>Create event</h3>
        <form onSubmit={createEvent}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>Starts at</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <button type="submit" disabled={!isAdmin}>
            Save
          </button>
        </form>
      </section>

      <section>
        <h3>Create ticket type</h3>
        <form onSubmit={createTicketType}>
          <label>Event</label>
          <select value={ticketEventId} onChange={(e) => setTicketEventId(e.target.value)} required>
            <option value="">Select</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
          <label>Name</label>
          <input value={ticketName} onChange={(e) => setTicketName(e.target.value)} required />
          <label>Capacity</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
          <button type="submit" disabled={!isAdmin}>
            Add
          </button>
        </form>
      </section>

      <section>
        <h3>Issue tickets (manual)</h3>
        <form onSubmit={issueTickets}>
          <label>Event</label>
          <select value={issueEventId} onChange={(e) => setIssueEventId(e.target.value)} required>
            <option value="">Select</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
          <label>Ticket type</label>
          <select
            value={issueTicketTypeId}
            onChange={(e) => setIssueTicketTypeId(e.target.value)}
            required
          >
            <option value="">Select</option>
            {ticketTypesForEvent.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name}
              </option>
            ))}
          </select>
          <label>Quantity</label>
          <input
            type="number"
            min={1}
            max={50}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <label>Buyer name (optional)</label>
          <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
          <label>Buyer email (optional)</label>
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
          />
          <button type="submit" disabled={!isAdmin}>
            Issue
          </button>
        </form>
        <p>Recently issued (only from this session):</p>
        <table className="table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Ticket type</th>
              <th>Event</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {issuedTokens.map((it) => (
              <tr key={`${it.token}-${it.createdAt}`}>
                <td>
                  <a href={`/t/${it.token}`} target="_blank" rel="noreferrer">
                    {it.token}
                  </a>
                </td>
                <td>{it.ticketTypeId}</td>
                <td>{it.eventId}</td>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {issuedTokens.length === 0 && (
              <tr>
                <td colSpan={4}>No tokens yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section id="qr-gallery">
        <h3>QR de esta sesión</h3>
        <p>Visualiza todos los códigos emitidos recientemente para poder probarlos.</p>
        <button
          type="button"
          onClick={() => setShowQrGallery((prev) => !prev)}
          disabled={issuedTokens.length === 0}
        >
          {showQrGallery ? 'Ocultar QR' : 'Mostrar QR'}
        </button>
        {issuedTokens.length === 0 && <p>No hay tokens emitidos en esta sesión.</p>}
        {showQrGallery && issuedTokens.length > 0 && (
          <div className="qr-grid">
            {issuedTokens.map((it) => (
              <div className="qr-card" key={`${it.token}-${it.createdAt}-qr`}>
                <QRCode value={it.token} size={150} bgColor="#ffffff" fgColor="#000000" />
                <p>{it.token}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {message && <div className="alert success">{message}</div>}
    </section>
  );
}
