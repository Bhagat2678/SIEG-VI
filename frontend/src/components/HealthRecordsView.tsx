import React, { useState } from 'react';
import { HealthRecordItem } from '../types';

interface HealthRecordsViewProps {
  records: HealthRecordItem[];
  onViewRecord: (record: HealthRecordItem) => void;
  onShareRecords: () => void;
  onDownloadAll: () => void;
  searchQuery: string;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  records,
  onViewRecord,
  onShareRecords,
  onDownloadAll,
  searchQuery,
}) => {
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const filteredRecords = records.filter((rec) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        rec.title.toLowerCase().includes(q) ||
        rec.doctor.toLowerCase().includes(q) ||
        rec.facility.toLowerCase().includes(q) ||
        rec.categoryLabel.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Doc type filter
    if (docTypeFilter !== 'all') {
      if (docTypeFilter === 'lab' && rec.category !== 'lab') return false;
      if (docTypeFilter === 'prescription' && rec.category !== 'prescription') return false;
      if (docTypeFilter === 'ai-insight' && rec.category !== 'ai-insight') return false;
      if (docTypeFilter === 'report' && rec.category !== 'report') return false;
    }

    // Facility filter
    if (facilityFilter !== 'all' && rec.facility !== facilityFilter) {
      return false;
    }

    return true;
  });

  const facilities = Array.from(new Set(records.map((r) => r.facility)));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#c1c9c0]/30">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#144227] tracking-tight leading-tight">
            Health Records
          </h1>
          <p className="text-[15px] text-[#414942] mt-1 font-normal">
            Access your clinical history, prescriptions, and lab reports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onShareRecords}
            className="px-5 py-2.5 rounded-full border-2 border-[#144227] text-[#144227] hover:bg-[#144227]/5 font-bold text-[14px] flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share Records
          </button>

          <button
            type="button"
            onClick={onDownloadAll}
            className="px-5 py-2.5 rounded-full bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download All
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 py-6">
        {/* Document Type Dropdown */}
        <div className="relative">
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="appearance-none bg-white border border-[#c1c9c0]/50 rounded-xl px-4 py-2.5 pr-9 text-[14px] font-medium text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#144227] cursor-pointer shadow-xs"
          >
            <option value="all">Document Type: All</option>
            <option value="lab">Lab Results</option>
            <option value="ai-insight">AI Insights</option>
            <option value="prescription">Prescriptions</option>
            <option value="report">Clinical Reports</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717971] text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Date Range Dropdown */}
        <div className="relative">
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="appearance-none bg-white border border-[#c1c9c0]/50 rounded-xl px-4 py-2.5 pr-9 text-[14px] font-medium text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#144227] cursor-pointer shadow-xs"
          >
            <option value="all">Date Range: All Time</option>
            <option value="6m">Last 6 Months</option>
            <option value="30d">Last 30 Days</option>
            <option value="2023">Year 2023</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717971] text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Facility Dropdown */}
        <div className="relative">
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="appearance-none bg-white border border-[#c1c9c0]/50 rounded-xl px-4 py-2.5 pr-9 text-[14px] font-medium text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#144227] cursor-pointer shadow-xs"
          >
            <option value="all">Facility: All Facilities</option>
            {facilities.map((fac) => (
              <option key={fac} value={fac}>
                {fac}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717971] text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {(docTypeFilter !== 'all' || dateRangeFilter !== 'all' || facilityFilter !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setDocTypeFilter('all');
              setDateRangeFilter('all');
              setFacilityFilter('all');
            }}
            className="text-[13px] font-semibold text-[#a13f1f] hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Health Records Cards Grid (Exact 2-column format from Screenshot 9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecords.map((rec) => {
          const isAIInsight = rec.category === 'ai-insight';
          const isPrescription = rec.category === 'prescription';
          const isLab = rec.category === 'lab';

          return (
            <div
              key={rec.id}
              onClick={() => onViewRecord(rec)}
              className="bg-white rounded-2xl p-6 md:p-7 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] hover:shadow-[0px_10px_25px_rgba(45,90,61,0.08)] border border-[#c1c9c0]/30 relative overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              {/* Left Colored Accent Stripe */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                  isPrescription
                    ? 'bg-[#a13f1f]'
                    : isAIInsight
                    ? 'bg-[#0f4325]'
                    : 'bg-[#144227]'
                }`}
              />

              <div className="pl-3">
                {/* Top Badges and Date */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category pill */}
                    <span
                      className={`px-3 py-1 rounded-md text-[12px] font-bold ${
                        isPrescription
                          ? 'bg-[#a13f1f] text-white'
                          : isAIInsight
                          ? 'bg-[#144227] text-white'
                          : 'bg-[#144227] text-white'
                      }`}
                    >
                      {rec.categoryLabel}
                    </span>

                    {/* Status Pill or Dosha Badges */}
                    {rec.doshaTags ? (
                      rec.doshaTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-md text-[12px] font-bold bg-[#bceec8]/60 text-[#144227]"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 rounded-md text-[12px] font-semibold bg-[#f1ede8] text-[#414942]">
                        {rec.statusLabel}
                      </span>
                    )}
                  </div>

                  <span className="text-[13px] text-[#717971] font-medium whitespace-nowrap">
                    {rec.date}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="text-[20px] font-bold text-[#1c1c19] group-hover:text-[#144227] transition-colors leading-tight mb-4">
                  {rec.title}
                </h3>

                {/* Metadata Row */}
                <div className="space-y-2 text-[14px] text-[#414942]">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#717971]">
                      medical_information
                    </span>
                    <span className="font-medium text-[#1c1c19]">{rec.doctor}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#717971]">
                      apartment
                    </span>
                    <span className="text-[#414942]">{rec.facility}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action hint */}
              <div className="pl-3 mt-5 pt-4 border-t border-[#f1ede8] flex items-center justify-between text-[13px] text-[#144227] font-semibold">
                <span>View Full Document</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#c1c9c0]/30 mt-6">
          <span className="material-symbols-outlined text-[48px] text-[#717971]">search_off</span>
          <h3 className="text-[18px] font-bold text-[#144227] mt-3">No Health Records Found</h3>
          <p className="text-[14px] text-[#414942] mt-1">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      )}
    </div>
  );
};
