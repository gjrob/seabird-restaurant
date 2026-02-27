'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReservationModal from './components/ReservationModal';
import LiveStatusBadge from './components/LiveStatusBadge';
import SpecialsBanner from './components/SpecialsBanner';
import PageViewTracker from './components/PageViewTracker';
import OysterStreamWindow from './components/OysterStreamWindow';
import LanguageToggle, { useLang } from './components/LanguageToggle';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const HOURS = [
  { day: 'Mon',     time: '5–9pm' },
  { day: 'Tue',     time: 'Closed', closed: true },
  { day: 'Wed–Thu', time: '5–9pm' },
  { day: 'Fri',     time: '5–10pm' },
  { day: 'Sat',     time: '10am–1pm\n5–10pm' },
  { day: 'Sun',     time: '10am–1pm\n5–9pm' },
];

const CATEGORY_COLOR: Record<string, string> = {
  spice: 'badge-amber',
  salt:  'badge-blue',
  acid:  'badge-lime',
  fat:   'badge-orange',
  other: 'badge-teal',
};

function SeabirdInner() {
  const { lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'recipes' | 'pantry'>('menu');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [pantry, setPantry] = useState<any[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (activeTab === 'menu' && !menuItems.length) {
      supabase.from('menu_items').select('*').eq('client_slug', 'seabird').eq('available', true).order('sort_order').then(({ data }) => { if (data) setMenuItems(data); });
    }
    if (activeTab === 'recipes' && !recipes.length) {
      supabase.from('recipes').select('*').eq('client_slug', 'seabird').order('sort_order').then(({ data }) => { if (data) setRecipes(data); });
    }
    if (activeTab === 'pantry' && !pantry.length) {
      supabase.from('pantry_items').select('*').eq('client_slug', 'seabird').order('sort_order').then(({ data }) => { if (data) setPantry(data); });
    }
  }, [activeTab]);

  const t = {
    navMenu:        lang === 'en' ? 'Menu'            : 'Menú',
    navRecipes:     lang === 'en' ? 'Recipes'         : 'Recetas',
    navPantry:      lang === 'en' ? 'The Pantry'      : 'La Despensa',
    navReserve:     lang === 'en' ? 'Reservations'    : 'Reservaciones',
    tagline:        lang === 'en' ? 'Celebrating the coast of North Carolina' : 'Celebrando la costa de Carolina del Norte',
    ctaReserve:     lang === 'en' ? 'Reserve a Table' : 'Reservar una Mesa',
    ctaMenu:        lang === 'en' ? 'View Menu'       : 'Ver Menú',
    ctaLive:        lang === 'en' ? 'Watch Live'      : 'Ver En Vivo',
    streamHeading:  lang === 'en' ? 'Live from Seabird' : 'En Vivo desde Seabird',
    tabMenu:        lang === 'en' ? 'Menu'            : 'Menú',
    tabRecipes:     lang === 'en' ? 'Recipes'         : 'Recetas',
    tabPantry:      lang === 'en' ? 'The Pantry'      : 'La Despensa',
    recipesHeading: lang === 'en' ? "From Dean's Kitchen" : 'De la Cocina de Dean',
    pantryHeading:  lang === 'en' ? 'The Pantry'      : 'La Despensa',
    menuEmpty:      lang === 'en' ? "Menu changes with the season. Ask Pearl about tonight's catch." : 'El menú cambia con la temporada. Pregúntale a Pearl sobre la captura de esta noche.',
  };

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <PageViewTracker clientSlug="seabird" />

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-brand">Seabird <span>·</span></a>
        <ul className="nav-links">
          <li><a href="#content">{t.navMenu}</a></li>
          <li><a href="#content" onClick={() => setActiveTab('recipes')}>{t.navRecipes}</a></li>
          <li><a href="#content" onClick={() => setActiveTab('pantry')}>{t.navPantry}</a></li>
          <li>
            <button onClick={() => setShowReservation(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', letterSpacing: 'inherit', padding: 0 }}>
              {t.navReserve}
            </button>
          </li>
          <li><LanguageToggle /></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glyph" aria-hidden>S</div>
        <div className="hero-content">
          <h1>
            Seabird
            <span className="subtitle">Restaurant</span>
          </h1>
          <p className="hero-tagline">{t.tagline}</p>
          <p className="hero-address">1 S. Front St · Downtown Wilmington</p>

          <div className="hours-grid">
            {HOURS.map(h => (
              <div key={h.day} className="hours-row">
                <span className="hours-day">{h.day}</span>
                <span className={`hours-time${(h as any).closed ? ' closed' : ''}`}>
                  {h.time.split('\n').map((t, i) => <span key={i} style={{ display: 'block' }}>{t}</span>)}
                </span>
              </div>
            ))}
          </div>

          <div className="hero-badges">
            <LiveStatusBadge clientSlug="seabird" />
          </div>
          <div className="hero-specials">
            <SpecialsBanner clientSlug="seabird" accentColor="#7dd3d4" />
          </div>
          <div className="hero-ctas">
            <button onClick={() => setShowReservation(true)} className="btn-primary" style={{ cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', border: 'none' }}>
              {t.ctaReserve}
            </button>
            <a href="#content" className="btn-secondary">{t.ctaMenu}</a>
            <a href="#stream" className="btn-secondary">{t.ctaLive}</a>
          </div>
        </div>
      </section>

      {/* OYSTER STREAM */}
      <section id="stream" className="stream-section">
        <p className="stream-heading">{t.streamHeading}</p>
        <OysterStreamWindow clientSlug="seabird" />
      </section>

      {/* TABS: MENU · RECIPES · PANTRY */}
      <div id="content" className="tabs-section">
        <div className="tab-bar">
          {(['menu', 'recipes', 'pantry'] as const).map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'menu' ? t.tabMenu : tab === 'recipes' ? t.tabRecipes : t.tabPantry}
            </button>
          ))}
        </div>

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <>
            {menuItems.length === 0 ? (
              <div className="card-grid"><div className="placeholder-msg">{t.menuEmpty}</div></div>
            ) : (
              (Object.entries(menuByCategory) as [string, any[]][]).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ color: 'var(--teal)', fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{cat}</h3>
                  <div className="card-grid">
                    {items.map((item: any) => (
                      <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{item.name}</div>
                          {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.description}</div>}
                        </div>
                        {item.price_cents && (
                          <div style={{ color: 'var(--teal)', fontFamily: 'Playfair Display, serif', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                            ${(item.price_cents / 100).toFixed(0)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--text)', marginBottom: '1.5rem' }}>
              {t.recipesHeading}
            </h2>
            {recipes.length === 0 ? (
              <div className="card-grid"><div className="placeholder-msg">Seasonal recipes coming soon.</div></div>
            ) : (
              <div className="card-grid">
                {recipes.map((r: any) => (
                  <div key={r.id} className="recipe-card">
                    <div className="recipe-header" onClick={() => setExpandedRecipe(expandedRecipe === r.id ? null : r.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="recipe-title">{r.title}</div>
                        <span style={{ color: 'var(--teal)', fontSize: '0.8rem', marginLeft: '0.75rem', flexShrink: 0 }}>
                          {expandedRecipe === r.id ? '▲' : '▼'}
                        </span>
                      </div>
                      <div className="recipe-badges">
                        {r.season && <span className="badge badge-teal">{r.season}</span>}
                        {r.difficulty && <span className="badge badge-sand">{r.difficulty}</span>}
                      </div>
                      {r.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.6rem', lineHeight: 1.5 }}>{r.description}</p>}
                    </div>
                    {expandedRecipe === r.id && (
                      <div className="recipe-body">
                        {r.ingredients?.length > 0 && (
                          <>
                            <p style={{ color: 'var(--teal)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.6rem', marginTop: '1rem' }}>Ingredients</p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {r.ingredients.map((ing: string, i: number) => (
                                <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', paddingLeft: '1rem', position: 'relative' }}>
                                  <span style={{ position: 'absolute', left: 0, color: 'var(--teal)', opacity: 0.5 }}>·</span>
                                  {ing}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {r.instructions && (
                          <>
                            <p style={{ color: 'var(--teal)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.6rem', marginTop: '1.2rem' }}>Method</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.7 }}>{r.instructions}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* PANTRY TAB */}
        {activeTab === 'pantry' && (
          <>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--text)', marginBottom: '1.5rem' }}>
              {t.pantryHeading}
            </h2>
            {pantry.length === 0 ? (
              <div className="card-grid"><div className="placeholder-msg">Pantry items loading...</div></div>
            ) : (
              <div className="card-grid">
                {pantry.map((item: any) => (
                  <div key={item.id} className="pantry-card">
                    <div className="pantry-name">
                      {item.name}
                      {item.featured && <span className="badge badge-star">✦</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${CATEGORY_COLOR[item.category] || 'badge-teal'}`}>{item.category}</span>
                    </div>
                    {item.origin && <div className="pantry-origin">From: {item.origin}</div>}
                    {item.description && <div className="pantry-desc">{item.description}</div>}
                    {item.usage_notes && <div className="pantry-usage">{item.usage_notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* INFO BAR */}
      <section className="info-bar">
        <div className="info-grid">
          <div>
            <div className="info-label">Location</div>
            <div className="info-value">
              <a href="https://maps.google.com/?q=1+S+Front+St+Wilmington+NC" target="_blank" rel="noopener">
                1 S. Front St<br/>Wilmington, NC 28401
              </a>
            </div>
          </div>
          <div>
            <div className="info-label">Phone</div>
            <div className="info-value"><a href="tel:+19107695996">(910) 769-5996</a></div>
          </div>
          <div>
            <div className="info-label">Reservations</div>
            <div className="info-value"><a href="https://www.opentable.com" target="_blank" rel="noopener">OpenTable</a></div>
          </div>
          <div>
            <div className="info-label">Closed</div>
            <div className="info-value">Tuesday</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2026 Seabird Restaurant — 1 S. Front St, Wilmington, NC 28401 — <a href="tel:+19107695996">(910) 769-5996</a></p>
      </footer>

      <ReservationModal isOpen={showReservation} onClose={() => setShowReservation(false)} />
    </>
  );
}

export default function SeabirdPage() {
  return <SeabirdInner />;
}
