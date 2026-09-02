import React, { useState } from 'react';
import { HealthRecordItem, VaultCategory } from '../types';

interface ABHAVaultViewProps {
  onLinkNewRecord: () => void;
  onViewRecord: (record: HealthRecordItem) => void;
  onNavigateToCategory: (category: string) => void;
  records: HealthRecordItem[];
}

export const ABHAVaultView: React.FC<ABHAVaultViewProps> = ({
  onLinkNewRecord,
  onViewRecord,
  onNavigateToCategory,
  records,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('10 mins ago');
  const [syncToast, setSyncToast] = useState(false);

  const categories: VaultCategory[] = [
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      count: records.filter((r) => r.category === 'prescription').length || 5,
      icon: 'description',
      bgColor: 'bg-[#9ed0ab]/40',
      iconColor: 'text-[#144227]',
    },
    {
      id: 'lab-reports',
      title: 'Lab Reports',
      count: records.filter((r) => r.category === 'lab').length || 7,
      icon: 'science',
      bgColor: 'bg-[#9bd1a8]/40',
      iconColor: 'text-[#144227]',
    },
    {
      id: 'vaccinations',
      title: 'Vaccinations',
      count: 2,
      icon: 'vaccines',
      bgColor: 'bg-[#bceec8]/60',
      iconColor: 'text-[#144227]',
    },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncText('Just now');
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 3500);
    }, 1200);
  };

  const totalRecordsCount = records.length + 8; // realistic total including historical ABHA entries

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Sync success toast */}
      {syncToast && (
        <div className="mb-4 p-4 rounded-xl bg-[#2d5a3d] text-white flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#9ed0ab]">check_circle</span>
            <span className="text-[14px] font-medium">
              ABHA Health Locker synced with National Health Authority network. 14 records verified.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSyncToast(false)}
            className="text-white/80 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header Banner Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(45,90,61,0.05)] border-l-4 border-[#144227] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#f7f3ee] text-[#144227] flex items-center justify-center shrink-0 border border-[#c1c9c0]/40">
            <span className="material-symbols-outlined text-[28px]">lock_person</span>
          </div>
          <div>
            <h1 className="font-bold text-[28px] md:text-[32px] text-[#144227] tracking-tight leading-tight">
              ABHA Vault
            </h1>
            <p className="text-[15px] text-[#414942] mt-1 font-normal">
              Secure digital locker for government-linked health records.
            </p>
          </div>
        </div>

        {/* Stats on the right */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#f1ede8] px-5 py-3 rounded-xl text-center min-w-[110px]">
            <span className="text-[11px] font-bold text-[#717971] uppercase tracking-wider block">
              TOTAL RECORDS
            </span>
            <span className="text-[26px] font-bold text-[#144227] leading-none mt-1 block">
              {totalRecordsCount}
            </span>
          </div>

          <div className="bg-[#f1ede8] px-5 py-3 rounded-xl text-center min-w-[130px]">
            <span className="text-[11px] font-bold text-[#717971] uppercase tracking-wider block">
              LAST SYNC TIME
            </span>
            <span className="text-[16px] font-bold text-[#1c1c19] leading-none mt-2 block">
              {lastSyncText}
            </span>
          </div>
        </div>
      </div>

      {/* Categories Header & Actions */}
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[22px] font-bold text-[#1c1c19] tracking-tight">Categories</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLinkNewRecord}
            className="px-6 py-2.5 rounded-full border-2 border-[#144227] text-[#144227] hover:bg-[#144227]/5 font-bold text-[14px] flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add_link</span>
            Link New Record
          </button>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="px-6 py-2.5 rounded-full bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}
            >
              sync
            </span>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* 3 Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onNavigateToCategory(cat.id)}
            className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] hover:shadow-[0px_10px_25px_rgba(45,90,61,0.08)] border border-[#c1c9c0]/30 flex items-center justify-between text-left transition-all duration-200 group hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl ${cat.bgColor} ${cat.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
              >
                <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-[#1c1c19] group-hover:text-[#144227] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[14px] text-[#717971] mt-0.5">{cat.count} Documents</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#717971] group-hover:text-[#144227] group-hover:translate-x-1 transition-all">
              chevron_right
            </span>
          </button>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-12">
        <h2 className="text-[22px] font-bold text-[#1c1c19] tracking-tight mb-5">Recent Activity</h2>

        <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30 divide-y divide-[#f1ede8] overflow-hidden">
          {records.slice(0, 4).map((rec) => {
            const isPrescription = rec.category === 'prescription';
            return (
              <div
                key={rec.id}
                onClick={() => onViewRecord(rec)}
                className="p-5 md:p-6 hover:bg-[#f7f3ee]/50 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isPrescription
                        ? 'bg-[#ffdbd0] text-[#a13f1f]'
                        : 'bg-[#ffdbd0]/70 text-[#a13f1f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {isPrescription ? 'medical_services' : 'description'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-[#1c1c19] group-hover:text-[#144227] transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-[13px] text-[#717971] mt-0.5">
                      Added to {rec.categoryLabel}s • {rec.facility}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-[#717971] font-medium whitespace-nowrap">
                    {rec.date}
                  </span>
                  <span className="material-symbols-outlined text-[#c1c9c0] group-hover:text-[#144227] transition-colors text-[20px]">
                    arrow_forward
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
