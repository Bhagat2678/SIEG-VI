import React, { useState } from 'react';
import { HealthRecordItem } from '../types';

interface ShareRecordsModalProps {
  record?: HealthRecordItem | null;
  onClose: () => void;
}

export const ShareRecordsModal: React.FC<ShareRecordsModalProps> = ({ record, onClose }) => {
  const [recipient, setRecipient] = useState('Dr. Anil Kumar (AyurLife Wellness)');
  const [consentDuration, setConsentDuration] = useState('24 hours');
  const [shared, setShared] = useState(false);

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    setShared(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-[20px] text-[#144227]">Share Health Records</h3>
            <p className="text-[12px] text-[#717971]">ABDM Consent Management Gateway</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#717971] hover:text-[#1c1c19]"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {shared ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#144227] text-[#9ed0ab] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[32px]">verified_user</span>
            </div>
            <h4 className="font-bold text-[18px] text-[#144227]">Consent Granted</h4>
            <p className="text-[13px] text-[#414942] mt-1">
              Encrypted access token dispatched to <strong>{recipient}</strong> for {consentDuration}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-2.5 bg-[#144227] text-white font-bold text-[14px] rounded-xl hover:bg-[#2d5a3d]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleShare} className="space-y-4">
            <div className="p-3 bg-[#f7f3ee] rounded-xl border border-[#c1c9c0]/30 text-[13px]">
              <span className="text-[#717971] block">Document:</span>
              <span className="font-bold text-[#144227]">
                {record ? record.title : 'All Verified Clinical Records (14 Documents)'}
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#414942] mb-1">
                Recipient Doctor or Hospital
              </label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[14px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
              >
                <option value="Dr. Anil Kumar (AyurLife Wellness)">Dr. Anil Kumar (AyurLife Wellness)</option>
                <option value="Dr. Sarah Jenkins (City General Hospital)">Dr. Sarah Jenkins (City General)</option>
                <option value="Dr. Aarav Sharma (Vaidya)">Dr. Aarav Sharma (Vaidya)</option>
                <option value="External ABDM Health Facility">Enter External ABHA ID / HFR Code...</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#414942] mb-1">
                Consent Time Window
              </label>
              <select
                value={consentDuration}
                onChange={(e) => setConsentDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[14px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
              >
                <option value="1 hour">1 Hour (Single Consultation)</option>
                <option value="24 hours">24 Hours (Standard)</option>
                <option value="7 days">7 Days (Follow-up)</option>
                <option value="30 days">30 Days (Ongoing Treatment)</option>
              </select>
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
                className="px-6 py-2.5 bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[14px] rounded-xl shadow-sm transition-all"
              >
                Authorize Share
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
