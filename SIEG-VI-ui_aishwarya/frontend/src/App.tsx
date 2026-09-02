import React, { useState } from 'react';
import { ScreenType, HealthRecordItem, MedicalRecordItem, UserProfile, DoshaType } from './types';
import { MEDICAL_RECORDS_DATA, INITIAL_USER_PROFILE } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { HomeDashboardView } from './components/HomeDashboardView';
import { ABHAVaultView } from './components/ABHAVaultView';
import { PrakritiQuizView } from './components/PrakritiQuizView';
import { AyurAIChatView } from './components/AyurAIChatView';
import { HealthRecordsView } from './components/HealthRecordsView';
import { SettingsView } from './components/SettingsView';
// import { WellnessHubView } from './components/WellnessHubView'; // not built yet — 'wellness' screen disabled below
import { BookConsultationModal } from './components/BookConsultationModal';
import { LinkRecordModal } from './components/LinkRecordModal';
import { DocPreviewModal } from './components/DocPreviewModal';
import { ShareRecordsModal } from './components/ShareRecordsModal';
import { VoiceMicFAB } from './components/VoiceMicFAB';
import { VaultVerifyModal } from './components/VaultVerifyModal';
import { LiveSchemesNewsView } from './components/LiveSchemesNewsView';
import { RegistrationView } from './components/RegistrationView';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [records, setRecords] = useState<MedicalRecordItem[]>(MEDICAL_RECORDS_DATA);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [userDosha, setUserDosha] = useState<DoshaType>('Vata-Pitta');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showBookConsult, setShowBookConsult] = useState(false);
  const [showLinkRecord, setShowLinkRecord] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [vaultVerified, setVaultVerified] = useState(false);
  const [showVaultVerify, setShowVaultVerify] = useState(false);
  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState<HealthRecordItem | null>(null);
  const [selectedRecordForShare, setSelectedRecordForShare] = useState<HealthRecordItem | null>(null);

  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'consultations') {
      setShowBookConsult(true);
      return;
    }

    // Leaving the vault always kills the verified session
    if (currentScreen === 'vault' && screen !== 'vault') {
      setVaultVerified(false);
    }

    // Entering an unverified vault triggers step-up auth
    if (screen === 'vault' && !vaultVerified) {
      setShowVaultVerify(true);
    }

    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddRecord = (newRec: HealthRecordItem) => {
    setRecords((prev) => [newRec, ...prev]);
  };

  const handleSaveQuizOutcome = (dosha: DoshaType, summary: string) => {
    setUserDosha(dosha);
    const newRecord: HealthRecordItem = {
      id: `rec-quiz-${Date.now()}`,
      category: 'ai-insight',
      categoryLabel: 'AI Insight',
      title: `Prakriti Assessment (${dosha})`,
      date: 'Today',
      doctor: 'AyurAI Engine & Kiosk Sensor',
      facility: 'AyurLife Wellness Center',
      statusType: 'dosha',
      doshaTags: dosha.split('-'),
      borderAccentColor: 'bg-[#0f4325]',
      badgeBgColor: 'bg-[#E8F5E9]',
      badgeTextColor: 'text-[#2E7D32]',
      iconName: 'psychiatry',
      fileSize: '1.2 MB',
      summaryText: summary,
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleDownloadAll = () => {
    alert(`Packaging and exporting ${records.length} ABHA verified health documents into encrypted ZIP archive.`);
  };

  const handleLogout = () => {
    setUserProfile(INITIAL_USER_PROFILE);
    setRecords(MEDICAL_RECORDS_DATA);
    setCurrentScreen('registration');
    setVaultVerified(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#fdf9f4] text-[#1c1c19] flex flex-col font-sans">
      {/* Registration/Login Screen */}
      {currentScreen === 'registration' ? (
        <RegistrationView onLoginSuccess={() => setCurrentScreen('home')} />
      ) : currentScreen === 'prakriti' ? (
        <PrakritiQuizView
          onClose={() => setCurrentScreen('home')}
          onSaveToRecords={handleSaveQuizOutcome}
          onNavigateToChat={() => setCurrentScreen('chat')}
        />
      ) : (
        <div className="flex flex-1">
          {/* Left Sidebar on Desktop */}
          <Sidebar
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            onOpenBookConsult={() => setShowBookConsult(true)}
            userProfile={userProfile}
          />

          {/* Main Content Area */}
          <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-8">
            {/* Top Bar Header */}
            <TopNav
              currentScreen={currentScreen}
              onNavigate={handleNavigate}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              userProfile={userProfile}
              onLogout={handleLogout}
            />

            {/* View Switching */}
            <main className="flex-1">
              {currentScreen === 'home' && (
                <HomeDashboardView
                  onNavigate={handleNavigate}
                  onOpenQuiz={() => setCurrentScreen('prakriti')}
                  onOpenBookConsult={() => setShowBookConsult(true)}
                  onViewRecord={setSelectedRecordForPreview}
                  userProfile={userProfile}
                  records={records}
                  userDosha={userDosha}
                />
              )}

              {currentScreen === 'vault' && (
                <div className={!vaultVerified ? 'blur-md pointer-events-none select-none' : ''}>
                  <ABHAVaultView
                    onLinkNewRecord={() => setShowLinkRecord(true)}
                    onViewRecord={setSelectedRecordForPreview}
                    records={vaultVerified ? records : []}
                  />
                </div>
              )}

              {currentScreen === 'records' && (
                <HealthRecordsView
                  records={records}
                  onViewRecord={setSelectedRecordForPreview}
                  onShareRecords={() => {
                    setSelectedRecordForShare(null);
                    setShowShareModal(true);
                  }}
                  onDownloadAll={handleDownloadAll}
                  searchQuery={searchQuery}
                />
              )}

              {currentScreen === 'chat' && (
                <AyurAIChatView userProfile={userProfile} />
              )}

              {currentScreen === 'schemes' && (
                  <LiveSchemesNewsView onBack={() => setCurrentScreen('home')} />
              )}

              {/* 'wellness' screen disabled until WellnessHubView is built */}

              {currentScreen === 'settings' && (
                <SettingsView
                  userProfile={userProfile}
                  onUpdateProfile={setUserProfile}
                  onLogout={handleLogout}
                />
              )}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {/* Global Voice Assistant — persists across every screen */}
      <VoiceMicFAB onActivate={() => console.log('open voice assistant')} />

      {/* Global Modals */}
      {showBookConsult && (
        <BookConsultationModal onClose={() => setShowBookConsult(false)} />
      )}

      {showVaultVerify && (
        <VaultVerifyModal
          onVerified={() => {
            setVaultVerified(true);
            setShowVaultVerify(false);
          }}
          onCancel={() => {
            setShowVaultVerify(false);
            setVaultVerified(false);
            setCurrentScreen('home'); // "back" behavior
          }}
        />
      )}

      {showLinkRecord && (
        <LinkRecordModal
          onClose={() => setShowLinkRecord(false)}
          onAddRecord={handleAddRecord}
        />
      )}

      {selectedRecordForPreview && (
        <DocPreviewModal
          record={selectedRecordForPreview}
          onClose={() => setSelectedRecordForPreview(null)}
          onShare={(rec) => {
            setSelectedRecordForShare(rec);
            setShowShareModal(true);
          }}
        />
      )}

      {showShareModal && (
        <ShareRecordsModal
          record={selectedRecordForShare}
          onClose={() => {
            setShowShareModal(false);
            setSelectedRecordForShare(null);
          }}
        />
      )}
    </div>
  );
};

export default App;