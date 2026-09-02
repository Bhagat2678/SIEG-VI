import React, { useState } from 'react';

interface VaultVerifyModalProps {
  onVerified: () => void;
  onCancel: () => void;
}

export const VaultVerifyModal: React.FC<VaultVerifyModalProps> = ({ onVerified, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setError('');
    if (otp.trim().length < 4) {
      setError('Enter the 4-6 digit OTP sent to your registered mobile.');
      return;
    }
    setLoading(true);
    // Replace with your real ABDM/OTP verification call
    setTimeout(() => {
      setLoading(false);
      onVerified();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl border border-[#c1c9c0]/30">
        <div className="w-12 h-12 rounded-xl bg-[#ffdbd0] text-[#a13f1f] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[24px]">lock_person</span>
        </div>
        <h2 className="text-[20px] font-bold text-[#1c1c19]">Verify to open ABHA Vault</h2>
        <p className="text-[14px] text-[#414942] mt-1.5 mb-5">
          Enter the OTP sent to your registered mobile to access your health records.
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          placeholder="Enter OTP"
          className="w-full border border-[#c1c9c0]/50 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#144227]"
        />
        {error && <p className="text-red-600 text-[13px] mt-2">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-2 border-[#c1c9c0] text-[#414942] rounded-full py-2.5 font-bold text-[14px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 bg-[#144227] hover:bg-[#2d5a3d] text-white rounded-full py-2.5 font-bold text-[14px] disabled:opacity-70"
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};