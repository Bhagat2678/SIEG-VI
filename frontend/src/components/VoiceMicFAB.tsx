import React, { useState } from 'react';

interface VoiceMicFABProps {
  onActivate?: () => void; // hook for teammate's voice backend
}

export const VoiceMicFAB: React.FC<VoiceMicFABProps> = ({ onActivate }) => {
  const [isListening, setIsListening] = useState(false);

  const handleClick = () => {
    setIsListening((prev) => !prev);
    onActivate?.();
  };

  return (
    <button
      type="button"
      aria-label="Voice Assistant"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 ${
        isListening
          ? 'bg-[#2d5a3d] scale-110 shadow-[0_0_0_8px_rgba(45,90,61,0.15)]'
          : 'bg-[#4a7c59] hover:bg-[#2d5a3d] animate-[breathe_2.5s_ease-in-out_infinite]'
      }`}
    >
      <span className="material-symbols-outlined text-white text-[28px]">
        {isListening ? 'graphic_eq' : 'mic'}
      </span>
    </button>
  );
};