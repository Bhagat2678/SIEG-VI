import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [form, setForm] = useState<UserProfile>(userProfile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    onUpdateProfile(form);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">

      {/* Save Success Toast */}
      {isSaved && (
        <div className="mb-6 p-4 rounded-xl bg-[#2d5a3d] text-white flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#9ed0ab]">
              check_circle
            </span>

            <span className="text-[14px] font-semibold">
              Settings & Privacy preferences updated successfully.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSaved(false)}
            className="text-white/80 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              close
            </span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c1c9c0]/30">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#144227] tracking-tight leading-tight">
            Settings
          </h1>

          <p className="text-[15px] text-[#414942] mt-1 font-normal">
            Manage your health profile, device connections, and privacy preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          className="px-6 py-2.5 rounded-full bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            save
          </span>

          Save Changes
        </button>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-8">

        {/* Section 1: Account Information */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30">

          <h2 className="text-[20px] font-bold text-[#1c1c19] tracking-tight mb-6 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px] text-[#144227]">
              badge
            </span>

            Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-[13px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                First Name
              </label>

              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    firstName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#f1ede8] text-[#1c1c19] font-medium border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[15px]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                Last Name
              </label>

              <input
                type="text"
                value={form.lastName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lastName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#f1ede8] text-[#1c1c19] font-medium border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[15px]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#f1ede8] text-[#1c1c19] font-medium border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[15px]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#f1ede8] text-[#1c1c19] font-medium border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[15px]"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                ABHA Health ID (Ayushman Bharat Digital Mission)
              </label>

              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={form.abhaId}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#f7f3ee] text-[#144227] font-bold border border-[#c1c9c0]/40 text-[15px] cursor-not-allowed select-all"
                />

                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#2E7D32] text-[22px]">
                  verified
                </span>
              </div>

              <p className="text-[12px] text-[#717971] mt-1.5">
                Verified with National Health Authority. Linked to your government ABHA account.
              </p>
            </div>

          </div>
        </div>


        {/*
        ============================================================
        SECTION 2: PRIVACY & KIOSK MODE
        ============================================================

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30">

          <h2 className="text-[20px] font-bold text-[#1c1c19] tracking-tight mb-6 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px] text-[#144227]">
              security
            </span>

            Privacy & Kiosk Settings
          </h2>

          <div className="space-y-5">

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#f7f3ee]/60 border border-[#c1c9c0]/30">

              <div className="flex items-start gap-3">

                <span className="material-symbols-outlined text-[24px] text-[#144227] mt-0.5">
                  tablet_mac
                </span>

                <div>
                  <h3 className="font-bold text-[15px] text-[#1c1c19]">
                    Kiosk Touch Terminal Mode
                  </h3>

                  <p className="text-[13px] text-[#414942] mt-0.5">
                    Optimizes UI sizing for wall-mounted kiosks and enables automatic privacy screen timeout after 60 seconds of inactivity.
                  </p>
                </div>

              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">

                <input
                  type="checkbox"
                  checked={form.kioskMode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      kioskMode: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />

                <div className="w-12 h-6 bg-[#c1c9c0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#144227]" />

              </label>

            </div>


            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#f7f3ee]/60 border border-[#c1c9c0]/30">

              <div className="flex items-start gap-3">

                <span className="material-symbols-outlined text-[24px] text-[#144227] mt-0.5">
                  science
                </span>

                <div>
                  <h3 className="font-bold text-[15px] text-[#1c1c19]">
                    Contribute to Ayurvedic Health Studies
                  </h3>

                  <p className="text-[13px] text-[#414942] mt-0.5">
                    Allow anonymized Prakriti and vitals insights to help Ayurvedic researchers advance natural medicine trials.
                  </p>
                </div>

              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">

                <input
                  type="checkbox"
                  checked={form.privacy.shareDataForResearch}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      privacy: {
                        ...form.privacy,
                        shareDataForResearch: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />

                <div className="w-12 h-6 bg-[#c1c9c0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#144227]" />

              </label>

            </div>


            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#f7f3ee]/60 border border-[#c1c9c0]/30">

              <div className="flex items-start gap-3">

                <span className="material-symbols-outlined text-[24px] text-[#144227] mt-0.5">
                  phonelink_lock
                </span>

                <div>
                  <h3 className="font-bold text-[15px] text-[#1c1c19]">
                    Two-Factor Authentication (OTP on Access)
                  </h3>

                  <p className="text-[13px] text-[#414942] mt-0.5">
                    Require Aadhaar OTP before unlocking confidential lab reports and prescription history.
                  </p>
                </div>

              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">

                <input
                  type="checkbox"
                  checked={form.privacy.twoFactorAuth}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      privacy: {
                        ...form.privacy,
                        twoFactorAuth: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />

                <div className="w-12 h-6 bg-[#c1c9c0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#144227]" />

              </label>

            </div>

          </div>

        </div>
        */}


        {/*
        ============================================================
        SECTION 3: CONNECTED DEVICES
        ============================================================

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(45,90,61,0.04)] border border-[#c1c9c0]/30">

          <div className="flex items-center justify-between gap-4 mb-6">

            <h2 className="text-[20px] font-bold text-[#1c1c19] tracking-tight flex items-center gap-2.5">

              <span className="material-symbols-outlined text-[24px] text-[#144227]">
                sensors
              </span>

              Connected Diagnostic Devices

            </h2>

            <button
              type="button"
              onClick={() => setShowPairModal(true)}
              className="px-4 py-2 rounded-full border-2 border-[#144227] text-[#144227] hover:bg-[#144227]/5 font-bold text-[13px] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                add
              </span>

              Pair Device
            </button>

          </div>


          <div className="space-y-3">

            {form.connectedDevices.map((dev) => (

              <div
                key={dev.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[#c1c9c0]/30 bg-[#fdf9f4]"
              >

                <div className="flex items-center gap-3.5">

                  <div className="w-10 h-10 rounded-xl bg-[#144227] text-[#9ed0ab] flex items-center justify-center">

                    <span className="material-symbols-outlined text-[20px]">
                      devices
                    </span>

                  </div>

                  <div>

                    <h3 className="font-bold text-[15px] text-[#1c1c19]">
                      {dev.name}
                    </h3>

                    <p className="text-[12px] text-[#717971]">
                      {dev.type} • Synced: {dev.lastSync}
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#bceec8]/70 text-[#144227] flex items-center gap-1">

                    <span className="w-1.5 h-1.5 rounded-full bg-[#144227]" />

                    {dev.status}

                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveDevice(dev.id)}
                    className="text-[#717971] hover:text-[#a13f1f] p-1 transition-colors"
                    title="Disconnect device"
                  >

                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>

                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>
        */}

      </form>


      {/*
      ============================================================
      PAIR DEVICE MODAL
      ============================================================

      {showPairModal && (

        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">

            <div className="flex justify-between items-center mb-4">

              <h3 className="font-bold text-[18px] text-[#144227]">
                Pair Diagnostic Sensor
              </h3>

              <button
                type="button"
                onClick={() => setShowPairModal(false)}
                className="text-[#717971] hover:text-[#1c1c19]"
              >

                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>

              </button>

            </div>


            <div className="space-y-4">

              <div>

                <label className="block text-[13px] font-bold text-[#414942] mb-1">
                  Device Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Omron Blood Glucose Meter"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[14px]"
                />

              </div>


              <div>

                <label className="block text-[13px] font-bold text-[#414942] mb-1">
                  Sensor Type
                </label>

                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f1ede8] text-[#1c1c19] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[14px]"
                >

                  <option value="Pulse Oximeter">
                    Pulse Oximeter (SpO2)
                  </option>

                  <option value="Nadi Pulse Terminal">
                    Nadi Pulse Terminal
                  </option>

                  <option value="Smart ECG Patch">
                    Smart ECG Patch
                  </option>

                  <option value="Blood Glucose Monitor">
                    Blood Glucose Monitor
                  </option>

                  <option value="Smart Thermometer">
                    Smart Thermometer
                  </option>

                </select>

              </div>


              <p className="text-[12px] text-[#717971] bg-[#f7f3ee] p-3 rounded-lg flex items-start gap-2">

                <span className="material-symbols-outlined text-[16px] text-[#144227] shrink-0 mt-0.5">
                  bluetooth_searching
                </span>

                Make sure your diagnostic hardware is powered on and Bluetooth broadcasting is enabled.

              </p>

            </div>


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowPairModal(false)}
                className="px-4 py-2 text-[14px] font-bold text-[#414942] hover:text-[#1c1c19]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddDevice}
                disabled={!newDeviceName.trim()}
                className="px-5 py-2 bg-[#144227] text-white font-bold text-[14px] rounded-xl hover:bg-[#2d5a3d] transition-colors disabled:opacity-50"
              >
                Connect & Pair
              </button>

            </div>

          </div>

        </div>

      )}
      */}

    </div>
  );
};
