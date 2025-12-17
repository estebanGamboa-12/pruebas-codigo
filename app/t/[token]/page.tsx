'use client';

import QRCode from 'react-qr-code';

interface Props {
  params: { token: string };
}

export default function TicketDisplay({ params }: Props) {
  const { token } = params;
  return (
    <section>
      <h2>Ticket for Oasis</h2>
      <p>Present this QR at the entrance.</p>
      <QRCode value={token} size={220} bgColor="#0e1118" fgColor="#ffffffff" />
      <p style={{ wordBreak: 'break-all' }}>Token: {token}</p>
    </section>
  );
}
