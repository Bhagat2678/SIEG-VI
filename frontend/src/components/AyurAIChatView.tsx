import React, { useState, useRef, useEffect } from 'react';
import { ConsultThread, ChatMessage, UserProfile } from '../types';
import { INITIAL_CONSULT_THREADS } from '../data/mockData';

interface AyurAIChatViewProps {
  userProfile: UserProfile;
}

export const AyurAIChatView: React.FC<AyurAIChatViewProps> = ({ userProfile }) => {
  const [threads, setThreads] = useState<ConsultThread[]>(INITIAL_CONSULT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update thread with user message
    const updatedMessages = [...activeThread.messages, userMsg];
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              messages: updatedMessages,
              preview: textToSend.trim(),
              time: 'Just now',
            }
          : t
      )
    );
    setInputVal('');
    setIsLoading(true);

    try {
      // Call server backend /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          query: textToSend.trim(),
          userDosha: 'Vata-Pitta',
        }),
      });

      const data = await response.json();
      const botContent =
        data.reply ||
        'According to Ayurvedic principles, maintaining daily balance through mindful diet and herbal support nurtures optimal Agni and Prana.';

      let insightCard: ChatMessage['insightCard'] = undefined;
      const lower = textToSend.toLowerCase();
      if (lower.includes('ccf') || lower.includes('tea') || lower.includes('digest')) {
        insightCard = {
          tag: 'AYURVEDIC INSIGHT',
          title: 'CCF Tea (Cumin, Coriander, Fennel)',
          description:
            'This classic blend gently kindles Agni without aggravating your Pitta. It aids absorption and reduces bloating.',
          recipeActionText: 'View Steeping Instructions',
        };
      } else if (lower.includes('sleep') || lower.includes('ashwagandha')) {
        insightCard = {
          tag: 'AYURVEDIC INSIGHT',
          title: 'Nidra Rasayana (Sleep Restorative)',
          description:
            'Ashwagandha paired with warm milk and nutmeg soothes Prana Vayu and pacifies mental restlessness.',
        };
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        insightCard,
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...updatedMessages, botMsg] }
            : t
        )
      );
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          'Warm herbal infusions like ginger-coriander or CCF tea kindle digestive fire (Agni) and dispel heaviness after meals. Maintain balanced portions and chew unhurriedly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...updatedMessages, fallbackMsg] }
            : t
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConsult = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: ConsultThread = {
      id: newId,
      title: 'New Consultation',
      preview: 'Started new Ayurvedic consult...',
      time: 'Just now',
      doshaTag: 'Vata-Pitta',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: `Namaste ${userProfile.firstName}. I am your AyurAI Assistant. How are your digestion, sleep, and vitality feeling today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setThreads([newThread, ...threads]);
    setActiveThreadId(newId);
  };

  const toggleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputVal("What herbs would you recommend for soothing Pitta acid reflux and burning sensation?");
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 h-[calc(100vh-5rem)] flex gap-6">
      {/* Middle Column: Recent Consults */}
      <aside className="w-80 shrink-0 hidden md:flex flex-col bg-white rounded-2xl shadow-[0px_4px_20px_rgba(45,90,61,0.05)] border border-[#c1c9c0]/30 p-5 overflow-hidden">
        <h2 className="text-[20px] font-bold text-[#1c1c19] tracking-tight mb-4">Recent Consults</h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717971] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f1ede8] text-[#1c1c19] placeholder:text-[#717971] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#144227]"
          />
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-4 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-[#f7f3ee] border-l-4 border-[#144227] shadow-xs'
                    : 'hover:bg-[#f7f3ee]/60 border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-[15px] text-[#1c1c19] truncate">{thread.title}</h3>
                  <span className="text-[12px] text-[#717971] shrink-0">{thread.time}</span>
                </div>
                <p className="text-[13px] text-[#414942] line-clamp-1">{thread.preview}</p>
              </button>
            );
          })}
        </div>

        {/* New Consultation button */}
        <div className="pt-4 border-t border-[#f1ede8] mt-2">
          <button
            type="button"
            onClick={handleNewConsult}
            className="w-full py-3 rounded-full border-2 border-[#144227] text-[#144227] hover:bg-[#144227]/5 font-bold text-[14px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Consultation
          </button>
        </div>
      </aside>

      {/* Main Chat Box */}
      <section className="flex-1 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(45,90,61,0.05)] border border-[#c1c9c0]/30 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:px-6 md:py-4 border-b border-[#f1ede8] flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-[#144227] text-[#9ed0ab] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[24px]">psychiatry</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ade80] rounded-full ring-2 ring-white" />
            </div>
            <div>
              <h2 className="font-bold text-[17px] text-[#1c1c19] leading-tight">AyurAI Assistant</h2>
              <p className="text-[12px] text-[#2d5a3d] font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2d5a3d]" />
                Conscious & Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewConsult}
              className="md:hidden p-2 text-[#144227] hover:bg-[#f7f3ee] rounded-lg"
              title="New Chat"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
            <button
              type="button"
              className="p-2 text-[#717971] hover:text-[#1c1c19] hover:bg-[#f7f3ee] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#fdf9f4]/50">
          {/* Quick Context / Evening routines badge at top */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleSendMessage("Tell me about balancing evening routines for restful sleep")}
              className="px-4 py-1.5 rounded-full bg-[#f1ede8] text-[#414942] hover:text-[#144227] hover:bg-[#ebe8e3] text-[12px] font-semibold transition-colors border border-[#c1c9c0]/30 flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px] text-[#144227]">wb_twilight</span>
              Evening routines
            </button>
          </div>

          {activeThread.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`p-4 md:p-5 rounded-2xl text-[15px] leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#144227] text-white rounded-br-xs'
                      : 'bg-[#f7f3ee] text-[#1c1c19] border border-[#c1c9c0]/20 rounded-bl-xs w-full'
                  }`}
                >
                  {/* Ayurvedic Insight Card if attached */}
                  {msg.insightCard && (
                    <div className="mb-3 p-4 rounded-xl bg-white border-l-4 border-[#144227] shadow-xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#144227] uppercase tracking-wider mb-2">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        {msg.insightCard.tag}
                      </div>
                      
                      <div className="p-3 bg-[#f7f3ee] rounded-lg border border-[#c1c9c0]/30 my-2 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#a13f1f] text-[20px] shrink-0 mt-0.5">
                          local_fire_department
                        </span>
                        <div>
                          <h4 className="font-bold text-[14px] text-[#1c1c19]">
                            {msg.insightCard.title}
                          </h4>
                          <p className="text-[13px] text-[#414942] mt-0.5">
                            {msg.insightCard.description}
                          </p>
                          {msg.insightCard.recipeActionText && (
                            <button
                              type="button"
                              onClick={() => setShowRecipeModal(true)}
                              className="mt-2 text-[12px] font-bold text-[#144227] hover:underline flex items-center gap-1"
                            >
                              <span>{msg.insightCard.recipeActionText}</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>

                <div className="flex items-center gap-1 mt-1 text-[11px] text-[#717971] px-1">
                  {!isUser && (
                    <span className="material-symbols-outlined text-[12px] text-[#144227]">spa</span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f7f3ee] max-w-md mr-auto border border-[#c1c9c0]/20">
              <div className="w-7 h-7 rounded-full bg-[#144227] text-[#9ed0ab] flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-[16px]">psychiatry</span>
              </div>
              <div className="flex items-center gap-1 text-[13px] text-[#414942]">
                <span>AyurAI is contemplating herbal formulation</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-[#f1ede8] flex items-center gap-2 overflow-x-auto">
          {[
            'How to brew CCF Tea?',
            'What foods pacify Vata?',
            'Ashwagandha timing for sleep',
            'Signs of high Pitta',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="text-[12px] whitespace-nowrap px-3 py-1 rounded-full bg-[#f1ede8] hover:bg-[#ebe8e3] text-[#414942] hover:text-[#144227] font-medium transition-colors border border-[#c1c9c0]/30 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Bottom Input Field */}
        <div className="p-4 bg-white border-t border-[#f1ede8]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#f1ede8] rounded-full p-1.5 pl-4 border border-[#c1c9c0]/40 focus-within:ring-2 focus-within:ring-[#144227] focus-within:bg-white transition-all shadow-xs"
          >
            {/* Attachment icon */}
            <button
              type="button"
              title="Attach Lab Report or Image"
              onClick={() => alert("Document attachment: Select ABHA record or photo to evaluate with AyurAI.")}
              className="text-[#717971] hover:text-[#144227] p-1.5 rounded-full hover:bg-black/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Describe how you're feeling..."
              className="flex-1 bg-transparent text-[#1c1c19] placeholder:text-[#717971] text-[15px] focus:outline-none px-2"
            />

            {/* Voice mic toggle */}
            <button
              type="button"
              title={isRecording ? "Listening..." : "Speak query"}
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-full transition-all ${
                isRecording
                  ? 'bg-[#a13f1f] text-white animate-pulse'
                  : 'text-[#717971] hover:text-[#144227] hover:bg-black/5'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isRecording ? 'mic' : 'mic_none'}
              </span>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() && !isRecording}
              className="w-10 h-10 rounded-full bg-[#144227] hover:bg-[#2d5a3d] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>

          <p className="text-[11px] text-center text-[#717971] mt-2 font-medium">
            AyurAI can make mistakes. Consult a physician for medical advice.
          </p>
        </div>
      </section>

      {/* Recipe Modal if requested */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#144227] text-[#9ed0ab]">
                  <span className="material-symbols-outlined text-[22px]">local_cafe</span>
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-[#144227]">Traditional CCF Tea Recipe</h3>
                  <p className="text-[12px] text-[#717971]">Tridoshic Agni Kindler</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecipeModal(false)}
                className="text-[#717971] hover:text-[#1c1c19]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[14px] text-[#414942]">
              <div className="p-3 bg-[#f7f3ee] rounded-xl">
                <h4 className="font-bold text-[#144227] text-[13px] uppercase mb-1">Ingredients:</h4>
                <ul className="list-disc pl-5 space-y-1 text-[13px]">
                  <li>1/2 tsp Organic Whole Cumin Seeds (Jeera)</li>
                  <li>1/2 tsp Organic Whole Coriander Seeds (Dhania)</li>
                  <li>1/2 tsp Organic Whole Fennel Seeds (Saunf)</li>
                  <li>3 to 4 cups of filtered spring water</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#144227] text-[13px] uppercase mb-1">Instructions:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-[13px]">
                  <li>Lightly crush the seeds in a mortar to release volatile aromatic oils.</li>
                  <li>Bring water and seeds to a gentle boil in a stainless steel pot.</li>
                  <li>Reduce flame and simmer covered for 5-8 minutes until golden and fragrant.</li>
                  <li>Strain into a thermos and sip warm throughout the day, especially 20 minutes after meals.</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRecipeModal(false)}
                className="px-5 py-2.5 bg-[#144227] text-white font-bold text-[14px] rounded-xl hover:bg-[#2d5a3d] transition-colors"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
