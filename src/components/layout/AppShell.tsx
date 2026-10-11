import React, { useState, useEffect } from 'react';
import {
  Compass,
  Home,
  Users,
  Map,
  Calendar,
  Clock,
  Search,
  Plus,
  Settings,
  RefreshCw,
  BookOpen,
  Sprout,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { SettingsSheet } from './SettingsSheet';

interface AppShellProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenSearch: () => void;
  onOpenAddPerson: () => void;
  onOpenRecordVisit: () => void;
  userName?: string;
  onSaveName?: (name: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  onOpenAddPerson,
  onOpenRecordVisit,
  userName = '',
  onSaveName = () => {},
  children,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Global shortcut: Cmd/Ctrl + K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Mobile Bottom Navigation: Primary Destinations
  const mobileNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'people', label: 'People', icon: Users },
    { id: 'territories', label: 'Map', icon: Map },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'growth', label: 'Growth', icon: Sprout },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#17201E] flex flex-col md:flex-row font-sans">
      {/* DESKTOP REFINED SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#DCDDD5] bg-[#FCFBF8] shrink-0 sticky top-0 h-screen select-none z-30">
        <div className="p-6 border-b border-[#DCDDD5]/80">
          <div className="flex items-center gap-2.5">
            <img src="/pwa-192x192.png" alt="Ministry Journal Logo" className="w-8 h-8 rounded-lg shadow-xs object-cover" />
            <div>
              <div className="font-display font-bold text-base tracking-tight text-[#17201E] leading-none">
                Ministry Organizer
              </div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#B87545] font-semibold mt-1">
                Field Journal
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#68716D] bg-[#F5F3ED] hover:bg-[#DCDDD5]/40 border border-[#DCDDD5] rounded-xl transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35]" />
              <span>Search records...</span>
            </span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-[#DCDDD5] rounded text-[#68716D]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Destinations */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-[#183A35] text-white shadow-2xs'
                    : 'text-[#68716D] hover:text-[#17201E] hover:bg-[#F5F3ED]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#B99A62]' : 'text-[#68716D]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Secondary Activity Destination */}
          <button
            onClick={() => onTabChange('activity')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all text-left ${
              currentTab === 'activity'
                ? 'bg-[#183A35] text-white shadow-2xs'
                : 'text-[#68716D] hover:text-[#17201E] hover:bg-[#F5F3ED]'
            }`}
          >
            <Clock className={`w-5 h-5 shrink-0 ${currentTab === 'activity' ? 'text-[#B99A62]' : 'text-[#68716D]'}`} />
            <span>Activity</span>
          </button>
        </nav>

        {/* Desktop Quick Actions */}
        <div className="p-4 border-t border-[#DCDDD5]/80 space-y-2 bg-[#FCFBF8]">
          <button
            onClick={onOpenRecordVisit}
            className="w-full h-11 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] rounded-xl transition-colors shadow-2xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Record Visit</span>
          </button>

          <button
            onClick={onOpenAddPerson}
            className="w-full h-11 flex items-center justify-center gap-2 text-xs font-semibold text-[#183A35] bg-white border border-[#DCDDD5] hover:border-[#183A35] rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#B87545]" />
            <span>Add Person</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* MOBILE HEADER (Clean Top Bar: Ministry wordmark, Search, Settings action) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FCFBF8] border-b border-[#DCDDD5] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <img src="/pwa-192x192.png" alt="Ministry Journal Logo" className="w-7 h-7 rounded-lg shadow-2xs object-cover" />
            <span className="font-display font-bold text-base tracking-tight text-[#17201E]">
              Ministry
            </span>
            <span className="text-[10px] font-mono text-[#B87545] font-semibold uppercase tracking-wider bg-[#F5F3ED] px-1.5 py-0.5 rounded">
              Journal
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSearch}
              className="w-11 h-11 flex items-center justify-center text-[#68716D] hover:text-[#17201E] active:bg-[#F5F3ED] rounded-xl transition-colors"
              aria-label="Search records"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-11 h-11 flex items-center justify-center text-[#68716D] hover:text-[#17201E] active:bg-[#F5F3ED] rounded-xl transition-colors"
              aria-label="Settings and options"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 px-4 py-5 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR: 4 Primary Destinations (Home, People, Map, Schedule) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-[#FCFBF8]/95 backdrop-blur-md border-t border-[#DCDDD5] z-40 flex items-center justify-around px-2 h-16 shadow-lg"
        role="navigation"
        aria-label="Mobile Bottom Navigation"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                isActive ? 'text-[#183A35]' : 'text-[#68716D] hover:text-[#17201E]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#183A35]/10 text-[#183A35]' : 'text-[#68716D]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`tracking-tight ${isActive ? 'font-bold text-[#183A35]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Settings Bottom Sheet */}
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userName}
        onSaveName={onSaveName}
      />
    </div>
  );
};
