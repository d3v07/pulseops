import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { PulseBar } from './PulseBar';
import { LeftDock } from './LeftDock';
import { InsightRail } from './InsightRail';
import { NotificationStack } from './NotificationStack';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { focusMode, insightRailOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-base text-ink">
      {/* Left Dock */}
      <LeftDock />

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <PulseBar />

        {/* Main Canvas */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full px-6 py-10 sm:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-[1280px]">
              {children}
            </div>
          </div>
        </main>
      </div>

      <NotificationStack />

      {/* Insight Rail - Right */}
      <AnimatePresence>
        {insightRailOpen && !focusMode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="hidden border-l border-subtle bg-surface md:block"
          >
            <InsightRail />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
