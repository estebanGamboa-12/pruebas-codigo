'use client';

import { useEffect, useState } from 'react';
import { missingSupabaseConfigMessage, supabaseClient } from '../../lib/supabaseClient';

export default function LoginPage() {
  const client = supabaseClient;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  if (!client) {
    return (
      <section>
        <h2>Login</h2>
        <div className="alert error">{missingSupabaseConfigMessage}</div>
        <p>Configura las variables de entorno y recarga la página para iniciar sesión.</p>
      </section>
    );
  }

  useEffect(() => {
    client.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });
    const { data: listener } = client.auth.onAuthStateChange((_, session) => {
      setSessionEmail(session?.user.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [client]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Logged in.');
    }
  };

  const signOut = async () => {
    await client.auth.signOut();
  };

  return (
    <section>
      <h2>Login</h2>
      <form onSubmit={signIn}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <button type="submit">Sign in</button>
        {message && <div className="alert error">{message}</div>}
      </form>
      <p>Session: {sessionEmail ?? 'none'}</p>
      {sessionEmail && <button onClick={signOut}>Sign out</button>}
    </section>
  );
}
