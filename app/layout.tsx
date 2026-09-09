import './globals.css';

export const metadata = {
  title: 'CVForge AI — AI CV Builder',
  description: 'Build professional, ATS-friendly CVs with AI and custom templates.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
