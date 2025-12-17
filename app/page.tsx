import Link from 'next/link';

export default function HomePage() {
  return (
    <section>
      <p>Welcome to the Oasis nightclub ticketing test console.</p>
      <ul>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/admin">Admin dashboard</Link></li>
        <li><Link href="/scan">Scan tickets</Link></li>
      </ul>
    </section>
  );
}
