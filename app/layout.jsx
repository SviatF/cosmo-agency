import './globals.css';

export const metadata = {
  title: 'COSMO Agency',
  description: 'COSMO Agency — команда, которая помогает зарабатывать на стриминговых платформах.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
