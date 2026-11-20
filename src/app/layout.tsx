import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import MobileHeader from '@/components/MobileHeader';
import AICoachButton from '@/components/ai/AICoachButton';
import { NewsJobProvider } from '@/context/NewsJobContext';
import NewsProgressBanner from '@/components/news/NewsProgressBanner';

export const metadata: Metadata = {
  title: 'NexDev — Personal Growth & Habit Engine',
  description: 'Ultra-modern habit tracking, milestones, daily tech digests, and AI growth coaching.',
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

          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Mobile Header */}
          <MobileHeader />

          {/* Main Content Area */}
          <div className="relative z-10 md:pl-64 flex flex-col min-h-screen">
            <main className="flex-1 p-4 sm:p-7 md:p-10 max-w-6xl w-full mx-auto pb-36 md:pb-16">
              {children}
            </main>
          </div>

          {/* Persistent Background News Analysis Progress Banner */}
          <NewsProgressBanner />

          {/* Floating AI Coach Button & Link */}
          <AICoachButton />

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </NewsJobProvider>
      </body>
    </html>
  );
}
