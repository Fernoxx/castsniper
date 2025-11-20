import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sniprrr',
  description: 'Sniprrr • Monitor Farcaster casts and auto-buy Zora Creator Coins',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
