import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { NewsJobProvider } from '@/context/NewsJobContext';

export const metadata: Metadata = {
  title: 'NexDev — Personal Growth & Habit Engine',
  description: 'Personal habit tracking, milestones, daily tech digests, and AI growth coaching.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NexDev',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#05070e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#05070e] text-slate-100 relative selection:bg-purple-500/30 selection:text-purple-200">
        <NewsJobProvider>
          {/* Ambient Lighting Gradient Orbs */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-8%] left-[-6%] w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent blur-[120px] sm:blur-[160px]" />
            <div className="absolute top-[25%] right-[-10%] w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] rounded-full bg-gradient-to-bl from-blue-600/12 via-cyan-500/8 to-transparent blur-[110px] sm:blur-[150px]" />
            <div className="absolute bottom-[-10%] left-[25%] w-[450px] sm:w-[620px] h-[450px] sm:h-[620px] rounded-full bg-gradient-to-tr from-indigo-700/10 via-purple-600/8 to-transparent blur-[120px] sm:blur-[160px]" />
          </div>

          {/* Dynamic AppShell managing Portal Navigation & Layout */}
          <AppShell>{children}</AppShell>
        </NewsJobProvider>
      </body>
    </html>
  );
}
