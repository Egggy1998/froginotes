import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GreetingHeader } from './GreetingHeader';
import { NoteGrid } from './NoteGrid';
import { DiaryView } from './diary/DiaryView';
import { useNotesStore } from '../stores/useNotesStore';

export const MainWindow: React.FC<{ isMockup?: boolean }> = ({ isMockup = false }) => {
  const { activeNav } = useNotesStore();

  return (
    <div
      className={`relative bg-[#FFFFFF] overflow-hidden flex flex-col ${
        isMockup
          ? 'w-[1050px] h-[745px] rounded-[24px] shadow-[0_20px_50px_rgba(0,30,10,0.14)] border border-black/[0.07]'
          : 'w-full h-full rounded-[20px] border border-[#D0DCD0] shadow-[0_10px_35px_rgba(0,30,10,0.12)]'
      }`}
    >
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Main Body */}
        <div className="flex-1 flex flex-col h-full bg-[#FCFDFB] overflow-hidden">
          {/* Top Bar */}
          <TopBar />

          {/* Content Container (comfortable padding and breathable gutters) */}
          <main className="flex-1 overflow-y-auto px-7 pt-5 pb-6 xl:px-8 xl:pt-6 xl:pb-8">
            {activeNav === 'diary' ? (
              <DiaryView />
            ) : (
              <>
                <GreetingHeader />
                <NoteGrid />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
