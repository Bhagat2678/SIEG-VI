import React from 'react';
import { ScreenType, UserProfile } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  userProfile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  userProfile,
}) => {
  const navItems: { screen: ScreenType; label: string; icon: string; matchScreens?: ScreenType[] }[] = [
    { screen: 'home', label: 'Home', icon: 'home' },
    { screen: 'prakriti', label: 'My Prakriti', icon: 'spa' },
    { screen: 'vault', label: 'ABHA Vault', icon: 'lock_person' },
    { screen: 'chat', label: 'AyurAI Chat', icon: 'forum' },
    { screen: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="hidden md:flex fixed left-0 top-0 h-screen flex-col border-r border-[#c1c9c0]/30 bg-[#f7f3ee] w-64 z-40 transition-all duration-300 ease-in-out shadow-sm select-none"
    >
      {/* Brand Header */}
      <div className="px-6 py-7 border-b border-[#c1c9c0]/20 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#144227] text-[#9ed0ab] flex items-center justify-center shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[24px]">eco</span>
        </div>
        <div>
          <h1 className="font-bold text-[20px] leading-tight text-[#144227] tracking-tight">AyurLife</h1>
          <p className="text-[13px] text-[#414942] font-medium tracking-wide">Harmonious Vitality</p>
        </div>
      </div>

      {/* Nav links */}
      <ul className="flex flex-col gap-1.5 px-3 py-6 flex-grow">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <li key={item.screen}>
              <button
                type="button"
                onClick={() => onNavigate(item.screen)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-[15px] ${
                  isActive
                    ? 'bg-[#2d5a3d] text-white font-semibold shadow-sm'
                    : 'text-[#414942] hover:bg-[#ebe8e3] hover:text-[#144227]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-colors ${
                    isActive ? 'text-[#9ed0ab]' : 'text-[#717971]'
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer Area with Book Consultation CTA & User Profile */}
      <div className="p-4 mt-auto border-t border-[#c1c9c0]/20 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#ebe8e3] transition-colors text-left"
        >
          <img
            src={userProfile.avatarUrl}
            alt={`${userProfile.firstName} ${userProfile.lastName}`}
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#1c1c19] truncate leading-tight">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="text-[12px] text-[#717971] truncate">ABHA: {userProfile.abhaId.slice(0, 10)}...</p>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#717971]">chevron_right</span>
        </button>
      </div>
    </nav>
  );
};
