import './globals.css';
import { Patrick_Hand } from 'next/font/google';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export const metadata = {
  title: 'Whiteboard PDF App',
  description: 'Upload PDFs and perform actions with a whiteboard-style UI'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={hand.className}>{children}</body>
    </html>
  );
}


