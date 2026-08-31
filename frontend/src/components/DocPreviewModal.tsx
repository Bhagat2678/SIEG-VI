import React, { useState } from 'react';
import { HealthRecordItem } from '../types';

interface DocPreviewModalProps {
  record: HealthRecordItem | null;
  onClose: () => void;
  onShare: (record: HealthRecordItem) => void;
}

export const DocPreviewModal: React.FC<DocPreviewModalProps> = ({ record, onClose, onShare }) => {
  const [downloading, setDownloading] = useState(false);

  if (!record) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Downloaded "${record.title}.pdf" (${record.fileSize || '1.8 MB'}) to your device.`);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#f1ede8]">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                record.category === 'prescription'
                  ? 'bg-[#ffdbd0] text-[#a13f1f]'
                  : 'bg-[#bceec8] text-[#144227]'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">{record.iconName}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#144227] text-white">
                  {record.categoryLabel}
                </span>
                {record.statusLabel && (
                  <span className="text-[12px] font-semibold text-[#717971]">
                    Status: {record.statusLabel}
                  </span>
                )}
              </div>
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#1c1c19] mt-0.5">
                {record.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#717971] hover:text-[#1c1c19] rounded-full hover:bg-[#f1ede8]"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Document Body */}
        <div className="py-6 space-y-6">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#f7f3ee] border border-[#c1c9c0]/30 text-[13px]">
            <div>
              <span className="text-[#717971] block font-medium">Attending Clinician</span>
              <span className="font-bold text-[#1c1c19]">{record.doctor}</span>
            </div>
            <div>
              <span className="text-[#717971] block font-medium">Facility / Hospital</span>
              <span className="font-bold text-[#1c1c19]">{record.facility}</span>
            </div>
            <div>
              <span className="text-[#717971] block font-medium">Date Verified</span>
              <span className="font-bold text-[#1c1c19]">{record.date}</span>
            </div>
          </div>

          {/* Summary */}
          {record.summaryText && (
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#144227] mb-1">
                Clinical Overview
              </h4>
              <p className="text-[14px] text-[#414942] leading-relaxed p-4 rounded-xl bg-white border border-[#c1c9c0]/30 shadow-xs">
                {record.summaryText}
              </p>
            </div>
          )}

          {/* Vitals Grid if available */}
          {record.details?.vitals && (
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#144227] mb-2">
                Biomarkers & Test Indicators
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {record.details.vitals.map((v, i) => (
                  <div key={i} className="p-3 bg-[#fdf9f4] border border-[#c1c9c0]/30 rounded-xl">
                    <span className="text-[11px] text-[#717971] block">{v.label}</span>
                    <span className="text-[16px] font-bold text-[#144227] block mt-0.5">
                      {v.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescribed Medications if available */}
          {record.details?.medications && (
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#144227] mb-2">
                Prescribed Herbal / Allopathic Formulations
              </h4>
              <div className="space-y-2">
                {record.details.medications.map((med, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-[#c1c9c0]/30 bg-[#fdf9f4] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-[15px] text-[#1c1c19]">{med.name}</span>
                      <span className="text-[13px] text-[#414942] block">
                        {med.dosage} • {med.timing}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-[#a13f1f] bg-[#ffdbd0] px-3 py-1 rounded-full self-start sm:self-center">
                      {med.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Findings */}
          {record.details?.findings && (
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#144227] mb-1">
                Diagnostic Findings
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-[13px] text-[#414942]">
                {record.details.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#f1ede8] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-[13px] font-bold text-[#414942] hover:text-[#1c1c19] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Record
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onShare(record)}
              className="px-4 py-2 rounded-xl border border-[#144227] text-[#144227] hover:bg-[#144227]/5 font-bold text-[13px] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Share via ABHA
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-5 py-2.5 rounded-xl bg-[#144227] text-white font-bold text-[13px] hover:bg-[#2d5a3d] flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
