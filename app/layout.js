import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'BucketsAI — Use Case Generator',
  description: 'Genera casos de uso personalizados para BucketsAI en segundos.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="bg-brand-page-bg min-h-screen font-[family-name:var(--font-jakarta)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
