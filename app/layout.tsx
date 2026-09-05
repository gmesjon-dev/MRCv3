import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Grupo MRC Digital',
  description: 'Organização, produção e gestão completa do Grupo MRC Digital.',
  icons: {
    icon: '/mrc-logo.png',
    apple: '/mrc-logo.png',
  },
  openGraph: {
    title: 'Grupo MRC Digital',
    description: 'Organização, produção e gestão em um só lugar.',
    type: 'website',
    images: [{ url: '/og.png', width: 1792, height: 924, alt: 'Núcleo — A agência inteira em movimento' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grupo MRC Digital',
    description: 'Organização, produção e gestão em um só lugar.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
