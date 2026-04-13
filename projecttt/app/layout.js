import './globals.css';

export const metadata = {
  title: 'Login App',
  description: 'Simple login and register application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 