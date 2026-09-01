

import React, { useEffect, useState } from 'react';


export interface SchemeItem {
  id: string;
  title: string;
  provider: string;
  description: string;
  eligibility: string;
  benefits: string;
  targetBeneficiaries: string;
  applicationInfo: string;
  lastUpdated: string;
  sourceName: string;
  sourceUrl: string;
  category?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedDate: string;
  sourceName: string;
  sourceUrl: string;
  relatedScheme?: string;
}

export interface SchemesNewsResponse {
  schemes: SchemeItem[];
  news: NewsItem[];
  isLive: boolean;
  lastSynced: string;
}

const API_ENDPOINT = process.env.REACT_APP_SCRAPER_API_URL || '/api/schemes-news';

/**
 * Service boundary to fetch live scraped medical schemes and news.
 */
async function fetchSchemesAndNews(): Promise<SchemesNewsResponse> {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: SchemesNewsResponse = await response.json();
    return data;
  } catch (error) {
    // Structure-ready fallback data used when the backend API/scraper is disconnected
    return getFallbackData();
  }
}

function getFallbackData(): SchemesNewsResponse {
  return {
    isLive: false,
    lastSynced: '01 Sep 2026',
    schemes: [
      {
        id: 'scheme-1',
        title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
        provider: 'National Health Authority / Government of India',
        description: 'Provides health coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
        eligibility: 'Low-income families identified by socio-economic census criteria.',
        benefits: 'Cashless treatment across empanelled public and private hospitals nationwide.',
        targetBeneficiaries: 'Economically vulnerable families',
        applicationInfo: 'Verify eligibility at empanelled centers or via official health portal.',
        lastUpdated: '01 Sep 2026',
        sourceName: 'National Health Authority',
        sourceUrl: 'https://pmjay.gov.in',
        category: 'National'
      },
      {
        id: 'scheme-2',
        title: 'Central Government Health Scheme (CGHS)',
        provider: 'Ministry of Health and Family Welfare',
        description: 'Comprehensive healthcare facilities for central government employees and pensioners.',
        eligibility: 'Central government employees, pensioners, and eligible dependents.',
        benefits: 'OPD, consultations, hospital care, and subsidized medicines.',
        targetBeneficiaries: 'Government employees & retirees',
        applicationInfo: 'Apply via CGHS portal with government identification.',
        lastUpdated: '28 Aug 2026',
        sourceName: 'CGHS Official Portal',
        sourceUrl: 'https://cghs.nic.in',
        category: 'Central Govt'
      }
    ],
    news: [
      {
        id: 'news-1',
        title: 'Expanded Digital Infrastructure Guidelines Introduced for Kiosks',
        summary: 'Updated frameworks allow seamless integration of health records and public medical benefits at regional clinics.',
        publishedDate: '01 Sep 2026',
        sourceName: 'Press Information Bureau',
        sourceUrl: 'https://pib.gov.in',
        relatedScheme: 'ABDM'
      },
      {
        id: 'news-2',
        title: 'Empanelled Hospital Network Updated for Emergency Care',
        summary: 'New digitized claim processes deployed for emergency admissions across participating medical institutions.',
        publishedDate: '30 Aug 2026',
        sourceName: 'Ministry of Health Update',
        sourceUrl: 'https://mohfw.gov.in'
      }
    ]
  };
}


interface LiveSchemesNewsViewProps {
  onBack?: () => void;
}

export const LiveSchemesNewsView: React.FC<LiveSchemesNewsViewProps> = ({ onBack }) => {
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSchemesAndNews();
      setSchemes(data.schemes);
      setNews(data.news);
      setIsLive(data.isLive);
      setLastSynced(data.lastSynced);
    } catch (e) {
      setError('Unable to fetch the latest schemes right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchemes = schemes.filter((scheme) =>
    scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Top Header & Live Status */}
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          {onBack && (
            <button onClick={onBack} style={styles.backButton}>
              ← Back
            </button>
          )}
          <div>
            <h1 style={styles.pageTitle}>Live Schemes & News</h1>
            <p style={styles.pageSubtitle}>
              Government medical schemes and public healthcare policy updates.
            </p>
          </div>
        </div>

        <div style={styles.statusBadge}>
          <span style={isLive ? styles.liveDot : styles.offlineDot}>●</span>
          <span style={styles.statusText}>
            {isLive ? 'Live Scraped Data' : 'Cached Source'}
          </span>
          {lastSynced && <span style={styles.syncTime}>• {lastSynced}</span>}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={styles.controlBar}>
        <input
          type="text"
          placeholder="Search schemes by title, keyword, or provider..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={loadData} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {/* State Handlers */}
      {isLoading ? (
        <div style={styles.stateContainer}>
          <p style={styles.stateText}>Loading schemes and news updates...</p>
        </div>
      ) : error ? (
        <div style={styles.stateContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={loadData} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      ) : (
        <div style={styles.contentGrid}>
          {/* Section A: Live Medical Schemes */}
          <section style={styles.section}>
            <h2 style={styles.sectionHeading}>Live Medical Schemes</h2>

            {filteredSchemes.length === 0 ? (
              <div style={styles.card}>
                <p style={styles.stateText}>No schemes found.</p>
              </div>
            ) : (
              filteredSchemes.map((scheme) => (
                <div key={scheme.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{scheme.title}</h3>
                    {scheme.category && (
                      <span style={styles.categoryBadge}>{scheme.category}</span>
                    )}
                  </div>

                  <p style={styles.providerText}>{scheme.provider}</p>
                  <p style={styles.cardDescription}>{scheme.description}</p>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailBlock}>
                      <span style={styles.detailLabel}>Eligibility:</span>
                      <span style={styles.detailValue}>{scheme.eligibility}</span>
                    </div>
                    <div style={styles.detailBlock}>
                      <span style={styles.detailLabel}>Benefits:</span>
                      <span style={styles.detailValue}>{scheme.benefits}</span>
                    </div>
                    {scheme.targetBeneficiaries && (
                      <div style={styles.detailBlock}>
                        <span style={styles.detailLabel}>Target Group:</span>
                        <span style={styles.detailValue}>{scheme.targetBeneficiaries}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.sourceMeta}>
                      <span>Source: {scheme.sourceName}</span>
                      <span style={styles.metaDivider}>|</span>
                      <span>Updated: {scheme.lastUpdated}</span>
                    </div>
                    <a
                      href={scheme.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.ctaButton}
                    >
                      View Official Source →
                    </a>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Section B: Healthcare News */}
          <section style={styles.section}>
            <h2 style={styles.sectionHeading}>Latest Healthcare News</h2>

            {news.length === 0 ? (
              <div style={styles.card}>
                <p style={styles.stateText}>No news updates found.</p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} style={styles.newsCard}>
                  <h3 style={styles.newsTitle}>{item.title}</h3>
                  <p style={styles.cardDescription}>{item.summary}</p>

                  {item.relatedScheme && (
                    <span style={styles.tag}>Related: {item.relatedScheme}</span>
                  )}

                  <div style={styles.cardFooter}>
                    <div style={styles.sourceMeta}>
                      <span>{item.sourceName}</span>
                      <span style={styles.metaDivider}>|</span>
                      <span>{item.publishedDate}</span>
                    </div>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.linkText}
                    >
                      Read Article →
                    </a>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. DESIGN SYSTEM & STYLES
// ==========================================

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#F7F3EE',
    minHeight: '100vh',
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#1A1A1A'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  backButton: {
    backgroundColor: 'transparent',
    border: '1px solid #2D5A3D',
    color: '#2D5A3D',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#2D5A3D',
    margin: 0
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6B6B6B',
    margin: '4px 0 0 0'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2DCD5',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  liveDot: {
    color: '#4A7C59',
    fontSize: '12px'
  },
  offlineDot: {
    color: '#6B6B6B',
    fontSize: '12px'
  },
  statusText: {
    fontWeight: 600,
    color: '#1A1A1A'
  },
  syncTime: {
    color: '#6B6B6B'
  },
  controlBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #E2DCD5',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    color: '#1A1A1A'
  },
  refreshButton: {
    backgroundColor: '#2D5A3D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '0 18px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionHeading: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: '0 0 8px 0'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #E2DCD5',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '18px',
    border: '1px solid #E2DCD5',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0
  },
  newsTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: '0 0 8px 0'
  },
  providerText: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#2D5A3D',
    margin: '4px 0 12px 0'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6B6B6B',
    lineHeight: '1.5',
    margin: '0 0 16px 0'
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    backgroundColor: '#F7F3EE',
    padding: '12px',
    borderRadius: '6px'
  },
  detailBlock: {
    fontSize: '13px',
    lineHeight: '1.4'
  },
  detailLabel: {
    fontWeight: 600,
    color: '#1A1A1A',
    marginRight: '6px'
  },
  detailValue: {
    color: '#6B6B6B'
  },
  tag: {
    display: 'inline-block',
    fontSize: '12px',
    backgroundColor: '#F7F3EE',
    color: '#2D5A3D',
    padding: '3px 8px',
    borderRadius: '4px',
    marginBottom: '12px',
    fontWeight: 500
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #F0ECE7',
    fontSize: '12px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  sourceMeta: {
    color: '#6B6B6B',
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },
  metaDivider: {
    color: '#E2DCD5'
  },
  ctaButton: {
    backgroundColor: '#C75B39',
    color: '#FFFFFF',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600
  },
  linkText: {
    color: '#C75B39',
    textDecoration: 'none',
    fontWeight: 600
  },
  categoryBadge: {
    backgroundColor: '#2D5A3D',
    color: '#FFFFFF',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  stateContainer: {
    padding: '48px',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2DCD5'
  },
  stateText: {
    fontSize: '15px',
    color: '#6B6B6B',
    margin: 0
  },
  errorText: {
    fontSize: '15px',
    color: '#C75B39',
    marginBottom: '12px'
  },
  retryButton: {
    backgroundColor: '#2D5A3D',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default LiveSchemesNewsView;