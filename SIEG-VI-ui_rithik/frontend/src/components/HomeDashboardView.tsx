import React from 'react';
import { ScreenType, MedicalRecordItem, UserProfile, DoshaType } from '../types';

interface HomeDashboardViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenQuiz: () => void;
  onOpenBookConsult: () => void;
  onViewRecord: (record: MedicalRecordItem) => void;
  userProfile: UserProfile;
  records: MedicalRecordItem[];
  userDosha: DoshaType;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigate,
  onOpenQuiz,
  onOpenBookConsult,
  onViewRecord,
  userProfile,
  records,
  userDosha,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
      {/* Welcome & Kiosk Check-In Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0px_4px_25px_rgba(45,90,61,0.06)] border border-[#c1c9c0]/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#144227] text-[#9ed0ab] flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">spa</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#144227] uppercase tracking-wider bg-[#bceec8]/70 px-2.5 py-0.5 rounded-full">
                ABHA Active
              </span>
              <span className="text-[13px] text-[#717971]">Kiosk Terminal Ready</span>
            </div>
            <h1 className="text-[26px] md:text-[32px] font-bold text-[#1c1c19] tracking-tight leading-tight mt-1">
              Namaste, {userProfile.firstName}
            </h1>
            <p className="text-[15px] text-[#414942] mt-1">
              Your Ayurvedic constitution is harmonized. 2 health markers updated today.
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenQuiz}
            className="px-5 py-3 rounded-full border-2 border-[#144227] text-[#144227] hover:bg-[#144227]/5 font-bold text-[14px] flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            Retake Prakriti Quiz
          </button>
        </div>
      </div>

      {/* 3 Overview Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prakriti Summary Card */}
        <div
          onClick={() => onNavigate('prakriti')}
          className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#717971]">
                CURRENT CONSTITUTION
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#bceec8] text-[#144227] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">spa</span>
              </div>
            </div>
            <h3 className="text-[22px] font-bold text-[#144227] group-hover:text-[#2d5a3d]">
              {userDosha} Dominant
            </h3>
            <p className="text-[13px] text-[#414942] mt-1">
              Balanced Agni. Pacify Vata with warm spiced broths and steady routine.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#f1ede8] flex items-center justify-between text-[13px] font-bold text-[#144227]">
            <span>Explore Prakriti Profile</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>

        {/* ABHA Vault Summary Card */}
        <div
          onClick={() => onNavigate('vault')}
          className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#717971]">
                ABHA HEALTH LOCKER
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#ffdbd0] text-[#a13f1f] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">lock_person</span>
              </div>
            </div>
            <h3 className="text-[22px] font-bold text-[#1c1c19] group-hover:text-[#144227]">
              14 Verified Records
            </h3>
            <p className="text-[13px] text-[#414942] mt-1">
              Encrypted government health locker linked to ID: {userProfile.abhaId.slice(0, 10)}...
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#f1ede8] flex items-center justify-between text-[13px] font-bold text-[#144227]">
            <span>Open ABHA Vault</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>

        {/* AyurAI Assistant Quick Card */}
        <div
          onClick={() => onNavigate('chat')}
          className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#717971]">
                AYURAI INTELLIGENCE
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#144227] text-[#9ed0ab] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">forum</span>
              </div>
            </div>
            <h3 className="text-[22px] font-bold text-[#1c1c19] group-hover:text-[#144227]">
              Ask AyurAI
            </h3>
            <p className="text-[13px] text-[#414942] mt-1">
              Instant herbal tea formulas, digestive Agni balance, and sleep remedies.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#f1ede8] flex items-center justify-between text-[13px] font-bold text-[#144227]">
            <span>Start Consultation</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};