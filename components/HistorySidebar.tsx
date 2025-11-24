import React from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon, MusicIcon } from './icons';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (id: string) => void;
  currentId: string | null;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, currentId }) => {
  return (
    <aside className="w-64 bg-black/50 h-screen p-4 flex flex-col border-r border-brand-surface">
      <h2 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
        <HistoryIcon className="w-6 h-6 text-brand-primary" />
        Analysis History
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {history.length === 0 ? (
          <p className="text-brand-subtext text-sm mt-2">Your analyzed tracks will appear here.</p>
        ) : (
          <ul className="space-y-2">
            {history.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex items-start gap-3 ${
                    currentId === item.id 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-brand-surface hover:bg-brand-primary/20 text-brand-subtext'
                  }`}
                >
                    <MusicIcon className={`w-5 h-5 mt-1 flex-shrink-0 ${currentId === item.id ? 'text-white' : 'text-brand-primary'}`} />
                    <div>
                        <p className={`font-bold ${currentId === item.id ? 'text-white' : 'text-brand-text'}`}>{item.trackInfo.title}</p>
                        <p className="text-sm">{item.trackInfo.artist}</p>
                    </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;
