import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Oasis Tickets',
  description: 'Minimal ticketing MVP for Oasis',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <header className="site-header">
            <h1>Oasis Tickets</h1>
            <nav className="nav">
              <Link href="/">Inicio</Link>
              <Link href="/login">Login</Link>
              <Link href="/admin#qr-gallery">Admin</Link>
              <Link href="/scan">Escanear</Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
