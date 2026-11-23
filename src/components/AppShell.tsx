'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import MobileHeader from '@/components/MobileHeader';
import AICoachButton from '@/components/ai/AICoachButton';
import NewsProgressBanner from '@/components/news/NewsProgressBanner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAcademics = pathname.startsWith('/academics');

  return (
    <>
      {/* Desktop Sidebar (Renders Personal or Academic menu, null on Home) */}
      {!isHome && <Sidebar />}

      {/* Mobile Header (null on Home) */}
      {!isHome && <MobileHeader />}

      {/* Main Content Area (Full width on Home, indented on portal pages) */}
      <div
        className={`relative z-10 flex flex-col min-h-screen transition-all duration-300 ${
          isHome ? 'w-full' : 'md:pl-64'
        }`}
      >
        <main
          className={`flex-1 w-full ${
            isHome ? 'p-0 max-w-full' : 'p-4 sm:p-7 md:p-10 max-w-6xl mx-auto pb-36 md:pb-16'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Background News Analysis Progress Banner (only when in personal/news) */}
      {!isAcademics && !isHome && <NewsProgressBanner />}

      {/* Floating AI Coach Button (only in Personal Growth OS) */}
      {!isAcademics && !isHome && <AICoachButton />}

      {/* Mobile Bottom Navigation (null on Home) */}
      {!isHome && <BottomNav />}
    </>
  );
}
