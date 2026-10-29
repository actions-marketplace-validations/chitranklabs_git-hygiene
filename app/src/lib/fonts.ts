import { Geist, Geist_Mono, JetBrains_Mono, Newsreader } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-code',
});

const displaySerif = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-display-serif',
});

export const monolineFontClassName = [
  geistSans.variable,
  geistMono.variable,
  jetbrainsMono.variable,
  displaySerif.variable,
].join(' ');
