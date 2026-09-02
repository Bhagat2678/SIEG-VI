import React, { useState } from 'react';
import { HealthRecordItem } from '../types';

interface HealthRecordsViewProps {
  records: HealthRecordItem[];
  onViewRecord: (record: HealthRecordItem) => void;
  searchQuery: string;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  records,
  onViewRecord,
  searchQuery,
}) => {
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

  const filteredRecords = records.filter((rec) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        rec.title.toLowerCase().includes(q) ||
        rec.doctor.toLowerCase().includes(q) ||
        rec.facility.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (doctorFilter !== 'all' && rec.doctor !== doctorFilter) {
      return false;
    }

    return true;
  });

  const doctors = Array.from(new Set(records.map((r) => r.doctor)));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#c1c9c0]/30">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#144227] tracking-tight leading-tight">
            Doctor's Consultations
          </h1>
          <p className="text-[15px] text-[#414942] mt-1 font-normal">
            Your past consultations with doctors and Vaidyas.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 py-6">
        <div className="relative">
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="appearance-none bg-white border border-[#c1c9c0]/50 rounded-xl px-4 py-2.5 pr-9 text-[14px] font-medium text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#144227] cursor-pointer shadow-xs"
          >
            <option value="all">Doctor: All</option>
            {doctors.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717971] text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        <div className="relative">
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="appearance-none bg-white border border-[#c1c9c0]/50 rounded-xl px-4 py-2.5 pr-9 text-[14px] font-medium text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#144227] cursor-pointer shadow-xs"
          >
            <option value="all">Date Range: All Time</option>
            <option value="6m">Last 6 Months</option>
            <option value="30d">Last 30 Days</option>
            <option value="2023">Year 2026</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717971] text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {(doctorFilter !== 'all' || dateRangeFilter !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setDoctorFilter('all');
              setDateRangeFilter('all');
            }}
            className="text-[13px] font-semibold text-[#a13f1f] hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Consultations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl p-4 md:p-5 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30 relative overflow-hidden transition-all duration-200"
          >
            {/* Left Colored Accent Stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#144227]" />

            <div className="pl-3">
              {/* Doctor Name + Date on same line */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-[22px] font-bold text-[#1c1c19] leading-tight">
                  {rec.doctor}
                </h3>
                <span className="text-[13px] text-[#717971] font-medium whitespace-nowrap shrink-0">
                  {rec.date}
                </span>
              </div>

              {/* Metadata Row: Hospital + Time */}
              <div className="space-y-1.5 text-[14px] text-[#414942]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-[#717971]">
                    apartment
                  </span>
                  <span className="text-[#414942]">{rec.facility}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-[#717971]">
                    schedule
                  </span>
                  <span className="text-[#414942]">{rec.time ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#c1c9c0]/30 mt-6">
          <span className="material-symbols-outlined text-[48px] text-[#717971]">search_off</span>
          <h3 className="text-[18px] font-bold text-[#144227] mt-3">No Consultations Found</h3>
          <p className="text-[14px] text-[#414942] mt-1">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      )}
    </div>
  );
};