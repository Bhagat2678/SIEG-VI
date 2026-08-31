import React, { useState } from 'react';
import { WellnessArticle } from '../types';
import { WELLNESS_ARTICLES } from '../data/mockData';

export const WellnessHubView: React.FC = () => {
  const [articles, setArticles] = useState<WellnessArticle[]>(WELLNESS_ARTICLES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<WellnessArticle | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [heroBookmarked, setHeroBookmarked] = useState(false);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Ahara (Diet)', label: 'Ahara (Diet)' },
    { id: 'Yoga', label: 'Yoga' },
    { id: 'Mindfulness', label: 'Mindfulness' },
    { id: 'Herbology', label: 'Herbology' },
  ];

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter((a) => a.tagCategory === activeCategory);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, bookmarked: !a.bookmarked } : a))
    );
  };

  const handleHeroGuideClick = () => {
    setSelectedArticle({
      id: 'hero-guide',
      tag: 'Dinacharya',
      tagCategory: 'Dinacharya',
      readTime: '6 min read',
      title: 'Cooling Morning Routine for Late Summer (Pitta Season)',
      description: 'Soothe excess heat with hibiscus infusion, gentle sheetali pranayama, and cooling coconut oil abhyanga before the sun reaches its peak.',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
      contentHtml: `
        <h3>Sarad Ritu: The Season of Pitta Pacification</h3>
        <p>In classical Ayurveda, late summer transitions into Sarad Ritu. The accumulated heat from the sun can lead to acidic flare-ups, skin sensitivities, or irritable moods. Establishing a cooling Dinacharya calms the Pitta dosha at its root.</p>
        <br/>
        <h4>Three Essential Morning Rituals:</h4>
        <ol>
          <li><strong>Sheetali Pranayama:</strong> 10 rounds of cooling curled-tongue breathing in the fresh morning air to cool core body temperature.</li>
          <li><strong>Coconut Oil Abhyanga:</strong> Unlike warming sesame oil used in winter, virgin organic coconut oil offers natural cooling energetics to soothe inflamed dermal layers.</li>
          <li><strong>Hibiscus & Rose Water Infusion:</strong> Hydrate with gentle room-temperature water steeped with dried organic hibiscus petals and organic rose water.</li>
        </ol>
      `,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#c1c9c0]/30">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#144227] tracking-tight leading-tight">
          Wellness Hub
        </h1>
        <p className="text-[15px] text-[#414942] mt-1 font-normal">
          Explore Ayurvedic recipes, yoga practices, and seasonal lifestyle wisdom.
        </p>
      </div>

      {/* Hero Featured Card (Matching Screenshot 13) */}
      <div className="mt-8 relative rounded-3xl overflow-hidden shadow-lg border border-[#c1c9c0]/20 min-h-[360px] flex flex-col justify-end p-6 md:p-10 group">
        {/* Background Image with Gradient Overlays */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1400&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#bceec8] text-[#144227] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#144227]" />
              Pitta Season (Sarad)
            </span>
            <span className="text-[13px] text-white/80 font-medium">Daily Recommendation</span>
          </div>

          <h2 className="text-[26px] md:text-[36px] font-bold leading-tight tracking-tight mb-3">
            Cooling Morning Routine for Late Summer
          </h2>

          <p className="text-[15px] text-white/90 leading-relaxed mb-6 font-normal">
            Soothe excess heat with hibiscus infusion, gentle sheetali pranayama, and cooling coconut oil abhyanga before the sun reaches its peak.
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleHeroGuideClick}
              className="px-6 py-3 rounded-full bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[14px] flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
              Read Guide
            </button>

            <button
              type="button"
              onClick={() => setHeroBookmarked(!heroBookmarked)}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
              title="Bookmark guide"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: heroBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="mt-10 flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-[14px] font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#144227] text-white shadow-sm'
                  : 'bg-white text-[#414942] hover:bg-[#f1ede8] border border-[#c1c9c0]/30'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Wellness Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => {
              if (art.hasVideo) setShowVideoModal(true);
              else setSelectedArticle(art);
            }}
            className="bg-white rounded-2xl overflow-hidden shadow-[0px_4px_20px_rgba(45,90,61,0.04)] hover:shadow-[0px_10px_25px_rgba(45,90,61,0.08)] border border-[#c1c9c0]/30 flex flex-col cursor-pointer transition-all duration-200 group hover:-translate-y-0.5"
          >
            {/* Image Thumbnail */}
            <div className="relative h-48 sm:h-56 bg-[#f7f3ee] overflow-hidden">
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Tag & Read Time */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#144227] text-white shadow-sm">
                  {art.tag}
                </span>
              </div>

              {/* Bookmark button */}
              <button
                type="button"
                onClick={(e) => toggleBookmark(art.id, e)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-[#144227] flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: art.bookmarked ? "'FILL' 1" : "'FILL' 0" }}
                >
                  bookmark
                </span>
              </button>

              {/* Video Play badge */}
              {art.hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#144227]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px] pl-0.5">play_arrow</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-4 text-[12px] font-medium text-white/95 drop-shadow-sm">
                {art.readTime}
              </div>
            </div>

            {/* Body Info */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-[20px] font-bold text-[#1c1c19] group-hover:text-[#144227] transition-colors leading-snug mb-2">
                  {art.title}
                </h3>
                <p className="text-[14px] text-[#414942] line-clamp-3 leading-relaxed">
                  {art.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#f1ede8] flex items-center justify-between text-[13px] font-bold text-[#144227]">
                <span>{art.hasVideo ? 'Watch Guided Session' : 'Read Article'}</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-md text-[12px] font-bold bg-[#144227] text-white">
                {selectedArticle.tag} • {selectedArticle.readTime}
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-full text-[#717971] hover:text-[#1c1c19] hover:bg-[#f1ede8]"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <h2 className="text-[26px] md:text-[30px] font-bold text-[#144227] leading-tight mb-4">
              {selectedArticle.title}
            </h2>

            {selectedArticle.imageUrl && (
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-56 object-cover rounded-2xl mb-6"
              />
            )}

            <div className="text-[15px] leading-relaxed text-[#1c1c19] space-y-3">
              {selectedArticle.contentHtml ? (
                <div
                  className="prose prose-emerald max-w-none text-[#1c1c19]"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.contentHtml }}
                />
              ) : (
                <p>{selectedArticle.description}</p>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-[#f1ede8] flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => toggleBookmark(selectedArticle.id, e)}
                className="flex items-center gap-2 text-[14px] font-bold text-[#144227] hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {selectedArticle.bookmarked ? 'bookmark_added' : 'bookmark_border'}
                </span>
                {selectedArticle.bookmarked ? 'Saved to Bookmarks' : 'Bookmark this'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-[#144227] text-white font-bold text-[14px] rounded-xl hover:bg-[#2d5a3d]"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Surya Namaskar Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#c1c9c0]/30 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-[20px] text-[#144227]">
                  Surya Namaskar: 12 Sacred Asanas
                </h3>
                <p className="text-[13px] text-[#717971]">
                  Guided flow with breath coordination (Pranayama)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-full text-[#717971] hover:text-[#1c1c19]"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Video Player Mockup Container */}
            <div className="relative aspect-video bg-[#144227] rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white p-6 shadow-inner">
              <span className="material-symbols-outlined text-[64px] text-[#9ed0ab] animate-pulse">
                self_improvement
              </span>
              <p className="font-bold text-[18px] mt-2">Active Session: Sequence 1 of 12</p>
              <p className="text-[13px] text-white/80 mt-1 text-center max-w-md">
                Inhale deeply into Pranamasana (Prayer Pose) &rarr; Exhale slowly into Hastauttanasana.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => alert("Asana sequence started. Follow breath pace.")}
                  className="px-5 py-2 rounded-full bg-white text-[#144227] font-bold text-[14px] flex items-center gap-1.5 shadow-sm hover:bg-[#f7f3ee]"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  Start Guided Pace
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-5 py-2 bg-[#144227] text-white font-bold text-[14px] rounded-xl hover:bg-[#2d5a3d]"
              >
                Close Guided Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
