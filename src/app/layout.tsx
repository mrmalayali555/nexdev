import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import MobileHeader from '@/components/MobileHeader';
import AICoachButton from '@/components/ai/AICoachButton';

export const metadata: Metadata = {
  title: 'NexDev — Personal Development & Habit Tracker',
  description: 'Track your daily habits, goals, streaks, and personal journal with AI growth coaching.',
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
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#090d16] text-gray-100 relative selection:bg-purple-500/30 selection:text-purple-200">
        {/* Background ambient gradient orbs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-purple-600/10 blur-[90px] sm:blur-[120px]" />
          <div className="absolute top-[30%] right-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-blue-600/10 blur-[100px] sm:blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[380px] sm:w-[550px] h-[380px] sm:h-[550px] rounded-full bg-indigo-600/10 blur-[90px] sm:blur-[130px]" />
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

        {/* Floating AI Coach Button & Sheet */}
        <AICoachButton />

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
