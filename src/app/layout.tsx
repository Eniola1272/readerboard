import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Readerboard — Turn Reading Into a Competition',
  description: 'Track your reading progress, compete with friends, and climb the leaderboard. Every page counts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
