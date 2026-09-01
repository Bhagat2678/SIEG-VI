import React, { useState } from 'react';
import { PRAKRITI_QUESTIONS } from '../data/mockData';
import { DoshaType } from '../types';

interface PrakritiQuizViewProps {
  onClose: () => void;
  onSaveToRecords?: (dosha: DoshaType, summary: string) => void;
  onNavigateToChat?: () => void;
}

export const PrakritiQuizView: React.FC<PrakritiQuizViewProps> = ({
  onClose,
  onSaveToRecords,
  onNavigateToChat,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQ = PRAKRITI_QUESTIONS[currentIdx];
  const selectedOptionId = answers[currentIdx];

  const handleSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionId }));
  };

  const handleNext = () => {
    if (currentIdx < PRAKRITI_QUESTIONS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIdx((prev) => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  // Calculate Dosha outcome
  const calculateResult = () => {
    let vata = 0;
    let pitta = 0;
    let kapha = 0;

    Object.entries(answers).forEach(([qIdxStr, optId]) => {
      const q = PRAKRITI_QUESTIONS[parseInt(qIdxStr)];
      const opt = q?.options.find((o) => o.id === optId);
      if (opt?.dosha === 'Vata') vata++;
      if (opt?.dosha === 'Pitta') pitta++;
      if (opt?.dosha === 'Kapha') kapha++;
    });

    const total = vata + pitta + kapha || 1;
    const vataPct = Math.round((vata / total) * 100) || 48;
    const pittaPct = Math.round((pitta / total) * 100) || 34;
    const kaphaPct = 100 - (vataPct + pittaPct);

    let dominant: DoshaType = 'Vata-Pitta';
    if (vataPct > 55) dominant = 'Vata';
    else if (pittaPct > 55) dominant = 'Pitta';
    else if (kaphaPct > 55) dominant = 'Kapha';

    return { vataPct, pittaPct, kaphaPct, dominant };
  };

  const result = calculateResult();

  return (
    <div className="min-h-screen bg-[#fdf9f4] flex flex-col font-sans">
      {/* Top Navigation for focused intent */}
      <header className="w-full h-16 flex justify-between items-center px-4 md:px-10 bg-[#fdf9f4] border-b border-[#e6e2dd] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={onClose}
            className="p-2 text-[#414942] hover:text-[#144227] transition-colors rounded-full hover:bg-[#f1ede8]"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="font-bold text-[20px] text-[#144227]">AyurLife</h1>
        </div>
        <button
          type="button"
          aria-label="Close Quiz"
          onClick={onClose}
          className="p-2 text-[#414942] hover:text-[#144227] transition-colors rounded-full hover:bg-[#f1ede8]"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
      </header>

      <main className="max-w-[860px] w-full mx-auto px-4 md:px-8 py-10 md:py-14 flex-1 flex flex-col justify-center">
        {!isCompleted ? (
          <>
            {/* Progress Stepper */}
            <div className="mb-10 flex flex-col items-center">
              <h2 className="text-[24px] md:text-[28px] font-bold mb-6 text-center text-[#144227] tracking-tight">
                Discover Your Prakriti
              </h2>

              <div className="flex items-center justify-center w-full max-w-md">
                {/* Step 1: Physical */}
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      currentQ.phase >= 1
                        ? 'bg-[#144227] text-white shadow-sm'
                        : 'bg-[#ebe8e3] text-[#717971]'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[12px] font-bold tracking-wider uppercase text-[#144227] mt-2 absolute -bottom-6">
                    Physical
                  </span>
                </div>

                {/* Bar 1 */}
                <div className="flex-1 h-1.5 mx-2 bg-[#ebe8e3] rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#144227] transition-all duration-300"
                    style={{
                      width: currentQ.phase === 1 ? `${((currentIdx + 1) / 5) * 100}%` : currentQ.phase > 1 ? '100%' : '0%',
                    }}
                  />
                </div>

                {/* Step 2: Mental */}
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      currentQ.phase >= 2
                        ? 'bg-[#144227] text-white shadow-sm'
                        : 'bg-[#ebe8e3] text-[#717971]'
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-[12px] font-bold tracking-wider uppercase mt-2 absolute -bottom-6 ${
                      currentQ.phase >= 2 ? 'text-[#144227]' : 'text-[#717971]'
                    }`}
                  >
                    Mental
                  </span>
                </div>

                {/* Bar 2 */}
                <div className="flex-1 h-1.5 mx-2 bg-[#ebe8e3] rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#144227] transition-all duration-300"
                    style={{
                      width:
                        currentQ.phase === 2
                          ? `${(((currentIdx - 5) + 1) / 5) * 100}%`
                          : currentQ.phase > 2
                          ? '100%'
                          : '0%',
                    }}
                  />
                </div>

                {/* Step 3: Lifestyle */}
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      currentQ.phase === 3
                        ? 'bg-[#144227] text-white shadow-sm'
                        : 'bg-[#ebe8e3] text-[#717971]'
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`text-[12px] font-bold tracking-wider uppercase mt-2 absolute -bottom-6 ${
                      currentQ.phase === 3 ? 'text-[#144227]' : 'text-[#717971]'
                    }`}
                  >
                    Lifestyle
                  </span>
                </div>
              </div>

              <p className="text-[14px] text-[#717971] mt-10 font-medium">
                Question {currentIdx + 1} of {PRAKRITI_QUESTIONS.length}
              </p>
            </div>

            {/* Question Container Card */}
            <div className="bg-white rounded-2xl shadow-[0px_4px_25px_rgba(45,90,61,0.06)] p-6 md:p-10 border border-[#c1c9c0]/30 transition-all">
              <div
                className={`transition-all duration-200 ${
                  isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                }`}
              >
                <h3 className="text-[26px] md:text-[34px] font-bold text-center mb-8 text-[#144227] leading-snug tracking-tight">
                  {currentQ.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelect(opt.id)}
                        className={`rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-200 cursor-pointer text-left border ${
                          isSelected
                            ? 'border-[#144227] bg-[#f7f3ee] shadow-sm ring-2 ring-[#144227] -translate-y-1'
                            : 'bg-[#f7f3ee]/60 border-[#c1c9c0]/40 hover:bg-[#f7f3ee] hover:-translate-y-1 hover:shadow-md'
                        }`}
                      >
                        <div
                          className={`w-16 h-16 rounded-full ${opt.iconColorBg} ${opt.iconColorText} flex items-center justify-center mb-4 transition-transform ${
                            isSelected ? 'scale-110' : ''
                          }`}
                        >
                          <span className="material-symbols-outlined text-[32px]">{opt.icon}</span>
                        </div>
                        <h4 className="font-bold text-[18px] mb-2 text-[#1c1c19]">{opt.title}</h4>
                        <p className="text-[13px] text-[#414942] leading-relaxed">
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-10 flex justify-between items-center border-t border-[#e6e2dd] pt-6">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIdx === 0}
                  className="px-5 py-3 text-[16px] font-medium text-[#414942] hover:text-[#144227] transition-colors flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedOptionId}
                  className="px-8 py-3.5 bg-[#a13f1f] text-white font-bold text-[16px] rounded-full hover:bg-[#812809] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-[0.98]"
                >
                  {currentIdx === PRAKRITI_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next'}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Assessment Results View */
          <div className="bg-white rounded-2xl shadow-[0px_4px_30px_rgba(45,90,61,0.08)] p-6 md:p-10 border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#144227] text-[#9ed0ab] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[36px]">auto_awesome</span>
              </div>
              <span className="text-[12px] font-bold text-[#144227] uppercase tracking-widest bg-[#9ed0ab]/30 px-3 py-1 rounded-full">
                Constitution Identified
              </span>
              <h3 className="text-[30px] md:text-[36px] font-bold text-[#144227] mt-3 tracking-tight">
                {result.dominant} Constitution
              </h3>
              <p className="text-[15px] text-[#414942] mt-2">
                Your biological blueprint reflects dynamic Vata creativity and Prana movement, coupled with sharp Pitta digestive fire and intellect.
              </p>
            </div>

            {/* Dosha Breakdown Bars */}
            <div className="mt-8 bg-[#f7f3ee] p-6 rounded-2xl border border-[#c1c9c0]/30 max-w-xl mx-auto space-y-4">
              <h4 className="font-bold text-[16px] text-[#144227] mb-2">Tridosha Composition</h4>

              <div>
                <div className="flex justify-between text-[14px] font-bold mb-1">
                  <span className="text-[#2E7D32] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" /> Vata (Air & Space)
                  </span>
                  <span>{result.vataPct}%</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#2E7D32] rounded-full" style={{ width: `${result.vataPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[14px] font-bold mb-1">
                  <span className="text-[#E65100] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]" /> Pitta (Fire & Water)
                  </span>
                  <span>{result.pittaPct}%</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#E65100] rounded-full" style={{ width: `${result.pittaPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[14px] font-bold mb-1">
                  <span className="text-[#1565C0] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0]" /> Kapha (Earth & Water)
                  </span>
                  <span>{result.kaphaPct}%</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#1565C0] rounded-full" style={{ width: `${result.kaphaPct}%` }} />
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-xl mx-auto">
              <div className="p-4 rounded-xl bg-white border border-[#c1c9c0]/30 shadow-xs">
                <h5 className="font-bold text-[15px] text-[#144227] flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[20px] text-[#2E7D32]">restaurant</span>
                  Ahara (Nutrition)
                </h5>
                <p className="text-[13px] text-[#414942]">
                  Favor warm, grounding meals cooked with ghee. Enjoy sweet root vegetables and soothing CCF tea.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#c1c9c0]/30 shadow-xs">
                <h5 className="font-bold text-[15px] text-[#144227] flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[20px] text-[#E65100]">bedtime</span>
                  Dinacharya (Routine)
                </h5>
                <p className="text-[13px] text-[#414942]">
                  Maintain steady sleep by 10:30 PM. Warm sesame oil foot massage before bedtime.
                </p>
              </div>
            </div>

            {/* Results CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => {
                  if (onSaveToRecords) {
                    onSaveToRecords(
                      result.dominant,
                      `Prakriti Score: Vata ${result.vataPct}%, Pitta ${result.pittaPct}%, Kapha ${result.kaphaPct}%`
                    );
                  }
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[15px] rounded-xl shadow-sm transition-all"
              >
                Save to ABHA Health Records
              </button>

              {onNavigateToChat && (
                <button
                  type="button"
                  onClick={onNavigateToChat}
                  className="w-full sm:w-auto px-6 py-3 border-2 border-[#144227] text-[#144227] hover:bg-[#144227]/5 font-bold text-[15px] rounded-xl transition-all"
                >
                  Ask AyurAI Assistant
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setCurrentIdx(0);
                  setAnswers({});
                  setIsCompleted(false);
                }}
                className="text-[14px] text-[#717971] hover:text-[#144227] font-medium py-2"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};