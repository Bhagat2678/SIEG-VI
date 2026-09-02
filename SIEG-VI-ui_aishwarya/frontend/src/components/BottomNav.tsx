import React from 'react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const items: { screen: ScreenType; label: string; icon: string }[] = [
    { screen: 'home', label: 'Home', icon: 'home' },
    { screen: 'prakriti', label: 'Prakriti', icon: 'spa' },
    { screen: 'vault', label: 'Vault', icon: 'lock_person' },
    { screen: 'records', label: 'Records', icon: 'folder_shared' },
    { screen: 'chat', label: 'AyurAI', icon: 'forum' },
    //{ screen: 'wellness', label: 'Wellness', icon: 'spa' },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 w-full z-50 flex md:hidden justify-around items-center px-2 py-2 bg-[#fdf9f4] border-t border-[#c1c9c0]/30 shadow-lg rounded-t-2xl backdrop-blur-md"
    >
      {items.map((item) => {
        const isActive = currentScreen === item.screen;
        return (
          <button
            key={item.screen}
            type="button"
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-[#2d5a3d] text-white font-bold scale-105 shadow-sm'
                : 'text-[#414942] hover:text-[#144227]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
