import React, { useState } from 'react';
import { ScreenType, UserProfile } from '../types';

interface TopNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  userProfile: UserProfile;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentScreen,
  onNavigate,
  searchQuery = '',
  onSearchChange,
  userProfile,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Lab Report Synced',
      desc: 'Complete Blood Count (CBC) was securely linked to your ABHA Vault.',
      time: '10m ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Prakriti Regimen Ready',
      desc: 'Your Vata-Pitta morning cooling routine has been updated in Wellness Hub.',
      time: '2h ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Upcoming Consultation',
      desc: 'Ayurvedic Pulse Assessment with Dr. Sharma tomorrow at 11:00 AM.',
      time: '1d ago',
      read: true,
    },
  ]);

  const navLinks: { screen: ScreenType; label: string }[] = [
  { screen: 'home', label: 'Dashboard' },
  { screen: 'records', label: 'Consultations' },
  { screen: 'schemes', label: 'Schemes' },
  //{ screen: 'wellness', label: 'Wellness Hub' },
];

  const markAllRead = () => {
    setUnreadNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = unreadNotifications.filter((n) => !n.read).length;

  return (
    <header className="w-full h-16 bg-[#fdf9f4] border-b border-[#c1c9c0]/20 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      {/* Brand logo & Top Nav Links */}
      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-bold text-[22px] tracking-tight text-[#144227] hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span></span>
          {userProfile.kioskMode && (
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#2d5a3d] text-[#9ed0ab] px-2 py-0.5 rounded-full">
              Kiosk Active
            </span>
          )}
        </button>

        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive =
              currentScreen === link.screen ||
              (link.screen === 'home' && (currentScreen === 'home' || currentScreen === 'vault'));
            return (
              <button
                key={link.screen}
                type="button"
                onClick={() => onNavigate(link.screen)}
                className={`font-semibold text-[15px] py-4 transition-colors relative ${
                  isActive
                    ? 'text-[#144227] font-bold'
                    : 'text-[#414942] hover:text-[#144227]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#144227] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Optional Search Bar */}
        {onSearchChange && (
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717971] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search records, vitals, herbs..."
              className="pl-10 pr-4 py-2 rounded-full border border-[#c1c9c0]/50 bg-[#f1ede8] text-[#1c1c19] placeholder:text-[#717971] focus:outline-none focus:ring-2 focus:ring-[#144227] focus:bg-white text-[14px] w-52 md:w-64 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717971] hover:text-[#1c1c19]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-[#414942] hover:bg-[#ebe8e3] hover:text-[#144227] transition-colors relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#a13f1f] rounded-full ring-2 ring-[#fdf9f4]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#c1c9c0]/30 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-[#f1ede8]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[15px] text-[#144227]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold bg-[#a13f1f]/15 text-[#a13f1f] px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[12px] font-medium text-[#144227] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#f7f3ee] max-h-80 overflow-y-auto">
                {unreadNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 hover:bg-[#f7f3ee] transition-colors flex items-start gap-3 ${
                      !notif.read ? 'bg-[#f7f3ee]/60' : ''
                    }`}
                  >
                    <div
                      className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                        !notif.read ? 'bg-[#a13f1f]' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-[#1c1c19] leading-snug">{notif.title}</p>
                      <p className="text-[12px] text-[#414942] mt-0.5">{notif.desc}</p>
                      <span className="text-[11px] text-[#717971] mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Button */}
        <button
          type="button"
          aria-label="Account Settings"
          onClick={() => onNavigate('settings')}
          className="p-1 rounded-full hover:ring-2 hover:ring-[#144227]/30 transition-all flex items-center"
        >
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.firstName}
            className="w-8 h-8 rounded-full object-cover border border-[#c1c9c0]"
          />
        </button>
      </div>
    </header>
  );
};
