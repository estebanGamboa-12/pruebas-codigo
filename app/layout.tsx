import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Oasis Tickets',
  description: 'Minimal ticketing MVP for Oasis',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Oasis Tickets</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
