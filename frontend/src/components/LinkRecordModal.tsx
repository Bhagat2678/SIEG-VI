import React, { useState } from 'react';
import { HealthRecordItem } from '../types';

interface LinkRecordModalProps {
  onClose: () => void;
  onAddRecord: (newRec: HealthRecordItem) => void;
}

export const LinkRecordModal: React.FC<LinkRecordModalProps> = ({ onClose, onAddRecord }) => {
  const [method, setMethod] = useState<'abha' | 'upload'>('abha');
  const [abhaNumber, setAbhaNumber] = useState('91-4589-2234-8890');
  const [docCategory, setDocCategory] = useState<'prescription' | 'lab' | 'report'>('lab');
  const [docTitle, setDocTitle] = useState('Lipid Profile & Liver Function');
  const [facility, setFacility] = useState('City General Hospital');
  const [doctor, setDoctor] = useState('Dr. Sarah Jenkins');
  const [isLinking, setIsLinking] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);

    setTimeout(() => {
      setIsLinking(false);
      const newRec: HealthRecordItem = {
        id: `rec-${Date.now()}`,
        category: docCategory,
        categoryLabel:
          docCategory === 'lab'
            ? 'Lab Result'
            : docCategory === 'prescription'
            ? 'Prescription'
            : 'Clinical Report',
        title: docTitle,
        date: 'Today',
        doctor,
        facility,
        statusType: 'normal',
        statusLabel: 'Normal',
        borderAccentColor: docCategory === 'prescription' ? 'bg-[#a13f1f]' : 'bg-[#144227]',
        badgeBgColor: 'bg-[#f7f3ee]',
        badgeTextColor: 'text-[#414942]',
        iconName: docCategory === 'lab' ? 'science' : docCategory === 'prescription' ? 'prescriptions' : 'description',
        fileSize: '1.4 MB',
        summaryText: 'Verified and cryptographically signed via National Health Authority ABDM gateway.',
      };

      onAddRecord(newRec);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[20px] font-bold text-[#144227]">Link Record to ABHA Vault</h3>
            <p className="text-[13px] text-[#717971]">Ayushman Bharat Digital Health Locker</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#717971] hover:text-[#1c1c19]"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#144227] text-[#9ed0ab] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h4 className="font-bold text-[18px] text-[#144227]">Record Linked Successfully!</h4>
            <p className="text-[13px] text-[#414942] mt-1">
              Encrypted record added to your government ABHA Vault.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#f1ede8] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMethod('abha')}
                className={`py-2 text-[13px] font-bold rounded-lg transition-all ${
                  method === 'abha' ? 'bg-white text-[#144227] shadow-xs' : 'text-[#717971]'
                }`}
              >
                Via ABHA Network
              </button>
              <button
                type="button"
                onClick={() => setMethod('upload')}
                className={`py-2 text-[13px] font-bold rounded-lg transition-all ${
                  method === 'upload' ? 'bg-white text-[#144227] shadow-xs' : 'text-[#717971]'
                }`}
              >
                Scan / Upload Doc
              </button>
            </div>

            {method === 'abha' ? (
              <div>
                <label className="block text-[12px] font-bold text-[#414942] uppercase mb-1">
                  ABHA Health Address
                </label>
                <input
                  type="text"
                  value={abhaNumber}
                  onChange={(e) => setAbhaNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[14px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
                  required
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#c1c9c0] p-4 rounded-xl text-center bg-[#fdf9f4]">
                <span className="material-symbols-outlined text-[32px] text-[#144227]">
                  cloud_upload
                </span>
                <p className="text-[13px] font-bold text-[#1c1c19] mt-1">
                  Drag & Drop PDF or Photos
                </p>
                <p className="text-[11px] text-[#717971]">Supports scanned lab tests and prescriptions</p>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-bold text-[#414942] uppercase mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[14px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-[#414942] uppercase mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[13px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
                >
                  <option value="lab">Lab Result</option>
                  <option value="prescription">Prescription</option>
                  <option value="report">Clinical Report</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#414942] uppercase mb-1">
                  Facility
                </label>
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[13px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[#f1ede8]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[14px] font-bold text-[#414942] hover:text-[#1c1c19]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLinking}
                className="px-6 py-2.5 bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[14px] rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center gap-1.5"
              >
                {isLinking ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    Linking...
                  </>
                ) : (
                  'Link Record'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
