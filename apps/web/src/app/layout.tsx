import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI English Immersion — Aprende a pensar en inglés',
    template: '%s · AI English Immersion',
  },
  description:
    'Tu profesor personal de inglés con inteligencia artificial: conversación real, pronunciación, comprensión auditiva y un plan que se adapta a ti.',
  applicationName: 'AI English Immersion',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e1a' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-MX" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
