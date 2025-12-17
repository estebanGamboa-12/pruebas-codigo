'use client';

import { useEffect, useRef, useState } from 'react';
import { missingSupabaseConfigMessage, supabaseClient } from '../../lib/supabaseClient';

interface EventRow {
  id: string;
  title: string;
}

type ScanStatus = 'idle' | 'valid' | 'already_used' | 'not_found' | 'error';

export default function ScanPage() {
  const client = supabaseClient;
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventId, setEventId] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [detail, setDetail] = useState('');
  const scannerRef = useRef<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  if (!client) {
    return (
      <section>
        <h2>Scan tickets</h2>
        <div className="alert error">{missingSupabaseConfigMessage}</div>
        <p>Agrega las variables de entorno de Supabase y recarga para poder escanear entradas.</p>
      </section>
    );
  }

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
      const { data } = await client.from('events').select('id, title').order('starts_at');
      setEvents(data ?? []);
    };
    load();
  }, [client]);

  useEffect(() => {
    if (status === 'idle') {
      setShowToast(false);
      return;
    }

    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 2800);
    return () => clearTimeout(timer);
  }, [status, detail]);

  useEffect(() => {
    let isMounted = true;
    const startScanner = async () => {
      if (!eventId) return;
      if (typeof window === 'undefined') return;

      const ensureCameraAccess = async () => {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not supported in this browser');
        }

        const permissionStatus = await navigator.permissions
          ?.query({ name: 'camera' as PermissionName })
          .catch(() => null);

        if (permissionStatus?.state === 'denied') {
          throw new Error('Camera permission denied in browser settings');
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          stream.getTracks().forEach((track) => track.stop());
        } catch (err) {
          const isInsecure = typeof window !== 'undefined' && window.location.protocol === 'http:';
          const needsSecureContext =
            err instanceof Error && err.message.toLowerCase().includes('only secure origins');

          if (isInsecure || needsSecureContext) {
            const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
            throw new Error(
              `Camera requires HTTPS or localhost. Abre la app usando https://${host} o expón un túnel seguro.`
            );
          }

          throw err instanceof Error
            ? err
            : new Error('Camera permission needed (revisa los permisos del navegador)');
        }
      };

      const { Html5Qrcode } = await import('html5-qrcode');
      const config = { fps: 10, qrbox: 250 } as any;
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      try {
        await ensureCameraAccess();
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          async (decodedText: string) => {
            if (!isMounted) return;
            await handleToken(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.error(err);
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Camera permission needed';
        setDetail(message);
      }
    };
    startScanner();
    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, [eventId]);

  const handleToken = async (token: string) => {
    const { data: sessionData } = await client.auth.getSession();
    const access = sessionData.session?.access_token;
    if (!access) {
      setStatus('error');
      setDetail('Login required');
      return;
    }
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ token, eventId }),
    });
    const body = await res.json();
    if (!res.ok) {
      setStatus('error');
      setDetail(body.error || 'Failed');
      return;
    }
    setStatus(body.status as ScanStatus);
    setDetail(statusMessages[body.status as ScanStatus] || '');
  };

  const statusColor: Record<ScanStatus, string> = {
    idle: '#1a1f2b',
    valid: '#0f5132',
    already_used: '#5c2c1a',
    not_found: '#5c1a1a',
    error: '#5c1a1a',
  };

  const statusMessages: Record<ScanStatus, string> = {
    idle: 'Listo para escanear',
    valid: 'Entrada válida',
    already_used: 'Entrada ya fue utilizada',
    not_found: 'Entrada no encontrada',
    error: detail || 'Error al escanear',
  };

  const toastColor: Record<Exclude<ScanStatus, 'idle'>, string> = {
    valid: '#16a34a',
    already_used: '#b91c1c',
    not_found: '#b91c1c',
    error: '#b91c1c',
  };

  const statusMessage = statusMessages[status];

  return (
    <section>
      <h2>Scan tickets</h2>
      {!['staff', 'admin'].includes(role ?? '') && (
        <div className="alert error">Staff/admin login required.</div>
      )}
      <label>Select event</label>
      <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
        <option value="">Choose event</option>
        {events.map((evt) => (
          <option key={evt.id} value={evt.id}>
            {evt.title}
          </option>
        ))}
      </select>
      <div id="qr-reader" style={{ width: '100%', maxWidth: 480, marginTop: 16 }} />
      <div
        className="alert"
        style={{
          marginTop: 16,
          background: statusColor[status],
          color: '#fff',
          textAlign: 'center',
          fontSize: '1.2rem',
        }}
      >
        Status: {status.toUpperCase()} {statusMessage && `- ${statusMessage}`}
      </div>
      {showToast && status !== 'idle' && (
        <div
          className="scan-toast"
          role="status"
          aria-live="assertive"
          style={{ background: toastColor[status as Exclude<ScanStatus, 'idle'>] }}
        >
          <div className="scan-toast__title">
            {status === 'valid' ? 'Escaneo correcto' : 'Aviso de escaneo'}
          </div>
          <div className="scan-toast__text">{statusMessage}</div>
        </div>
      )}
    </section>
  );
}
