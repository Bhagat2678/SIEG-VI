import React, { useState } from 'react';

interface BookConsultationModalProps {
  onClose: () => void;
}

export const BookConsultationModal: React.FC<BookConsultationModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedDoctor, setSelectedDoctor] = useState('vaidya-sharma');
  const [consultType, setConsultType] = useState<'kiosk' | 'video' | 'in-clinic'>('kiosk');
  const [date, setDate] = useState('Tomorrow, 11:00 AM');
  const [chiefConcern, setChiefConcern] = useState('Digestive sluggishness & sleep imbalance');

  const doctors = [
    {
      id: 'vaidya-sharma',
      name: 'Dr. Aarav Sharma, BAMS, MD (Ayurveda)',
      specialty: 'Senior Ayurvedic Physician • Nadi Pariksha Specialist',
      experience: '16+ yrs exp',
      fee: '₹500',
    },
    {
      id: 'dr-anil-kumar',
      name: 'Dr. Anil Kumar, BAMS',
      specialty: 'Prakriti Balance & Panchakarma Consultant',
      experience: '12+ yrs exp',
      fee: '₹450',
    },
    {
      id: 'dr-sarah-jenkins',
      name: 'Dr. Sarah Jenkins, MD (Integrative Medicine)',
      specialty: 'Holistic Internal Medicine & Clinical Diagnostics',
      experience: '14+ yrs exp',
      fee: '₹700',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">
        {step === 'form' ? (
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-[22px] font-bold text-[#144227] tracking-tight">
                  Book Vaidya Consultation
                </h2>
                <p className="text-[13px] text-[#717971]">
                  Schedule appointment with verified Ayurvedic specialist.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-[#717971] hover:text-[#1c1c19] hover:bg-[#f1ede8]"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#414942] mb-1.5">
                  Select Specialist
                </label>
                <div className="space-y-2">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id)}
                      className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                        selectedDoctor === doc.id
                          ? 'border-[#144227] bg-[#f7f3ee] ring-1 ring-[#144227]'
                          : 'border-[#c1c9c0]/40 hover:bg-[#f7f3ee]/40 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[22px] text-[#144227] mt-0.5">
                          medical_services
                        </span>
                        <div>
                          <h4 className="font-bold text-[14px] text-[#1c1c19] leading-tight">
                            {doc.name}
                          </h4>
                          <p className="text-[12px] text-[#717971]">{doc.specialty}</p>
                          <span className="text-[11px] font-bold text-[#a13f1f] block mt-0.5">
                            {doc.experience} • Fee: {doc.fee}
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="doctor"
                        checked={selectedDoctor === doc.id}
                        onChange={() => {}}
                        className="text-[#144227] focus:ring-[#144227] mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#414942] mb-1.5">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kiosk', label: 'Kiosk Booth', icon: 'touch_app' },
                    { id: 'video', label: 'Telehealth', icon: 'videocam' },
                    { id: 'in-clinic', label: 'In-Clinic', icon: 'apartment' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setConsultType(mode.id as any)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        consultType === mode.id
                          ? 'border-[#144227] bg-[#144227] text-white shadow-xs'
                          : 'border-[#c1c9c0]/40 bg-[#f7f3ee] text-[#414942] hover:bg-[#ebe8e3]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{mode.icon}</span>
                      <span className="text-[12px] font-bold">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#414942] mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[14px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
                >
                  <option value="Tomorrow, 11:00 AM">Tomorrow, 11:00 AM (Recommended)</option>
                  <option value="Tomorrow, 03:30 PM">Tomorrow, 03:30 PM</option>
                  <option value="Oct 28, 10:00 AM">Wednesday, Oct 28 - 10:00 AM</option>
                  <option value="Oct 29, 05:00 PM">Thursday, Oct 29 - 05:00 PM</option>
                </select>
              </div>

              {/* Chief Concern */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#414942] mb-1">
                  Primary Symptoms / Health Concern
                </label>
                <input
                  type="text"
                  value={chiefConcern}
                  onChange={(e) => setChiefConcern(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] text-[14px] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227]"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f1ede8]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-[14px] font-bold text-[#414942] hover:text-[#1c1c19]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#a13f1f] hover:bg-[#812809] text-white font-bold text-[14px] rounded-xl shadow-sm transition-all"
                >
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#144227] text-[#9ed0ab] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[36px]">event_available</span>
            </div>
            <h3 className="text-[22px] font-bold text-[#144227]">Consultation Reserved</h3>
            <p className="text-[14px] text-[#414942] mt-1 max-w-sm mx-auto">
              Your appointment with Dr. Sharma has been confirmed for <strong>{date}</strong>. An OTP and calendar invite have been dispatched.
            </p>

            <div className="mt-6 bg-[#f7f3ee] p-4 rounded-xl text-left border border-[#c1c9c0]/30 text-[13px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#717971]">Mode:</span>
                <span className="font-bold text-[#1c1c19] capitalize">{consultType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717971]">Facility:</span>
                <span className="font-bold text-[#1c1c19]">AyurLife Wellness Kiosk Terminal #4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717971]">ABHA Passcode:</span>
                <span className="font-mono font-bold text-[#144227]">AYUR-8890</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-3 bg-[#144227] text-white font-bold text-[14px] rounded-xl hover:bg-[#2d5a3d] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
