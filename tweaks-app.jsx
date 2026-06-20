// EVA Car Mats — Tweaks app
// Three expressive controls that reshape the feel of the home page:
//   1. PALETTE  — accent identity (warm gold, cool steel, oxblood, emerald)
//   2. DISPLAY  — typographic voice (expressive grotesque, industrial, editorial, sport)
//   3. MOOD     — surface atmosphere (studio / workshop / gallery)

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "heritage",
  "display": "bricolage",
  "mood": "studio"
}/*EDITMODE-END*/;

// --- PALETTES ---------------------------------------------------------------
const PALETTES = {
  heritage: { gold: '#c79849', gold2: '#e8c275', goldDeep: '#8a6526', cream: '#f4ede0', text: '#ece6d8' },
  midnight: { gold: '#7fb3d5', gold2: '#a9d4ed', goldDeep: '#3a6b8a', cream: '#e7eef4', text: '#d9e3ec' },
  oxblood:  { gold: '#a8474a', gold2: '#d27d80', goldDeep: '#5d1f22', cream: '#f1e7df', text: '#e7ddd0' },
  emerald:  { gold: '#6ea272', gold2: '#9bc99e', goldDeep: '#3d5e40', cream: '#ecf0e6', text: '#dbe3d3' },
};

// --- DISPLAY TYPEFACES ------------------------------------------------------
// Each entry has a Google Fonts CSS2 query string + the resulting font family stack.
const DISPLAYS = {
  bricolage:    { query: 'Bricolage+Grotesque:opsz,wght@12..96,300..800', family: "'Bricolage Grotesque', serif" },
  anton:        { query: 'Anton', family: "'Anton', 'Bricolage Grotesque', sans-serif" },
  fraunces:     { query: 'Fraunces:opsz,wght,SOFT,WONK@9..144,400..700,30,0..1', family: "'Fraunces', 'Bricolage Grotesque', serif" },
  bigshoulders: { query: 'Big+Shoulders+Display:wght@400;500;600;700;800', family: "'Big Shoulders Display', 'Bricolage Grotesque', sans-serif" },
};

function loadFont(query, id) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
  document.head.appendChild(link);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply palette as CSS variables on :root
  React.useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.heritage;
    const r = document.documentElement;
    r.style.setProperty('--gold', p.gold);
    r.style.setProperty('--gold-2', p.gold2);
    r.style.setProperty('--gold-deep', p.goldDeep);
    r.style.setProperty('--cream', p.cream);
    r.style.setProperty('--text', p.text);
  }, [t.palette]);

  // Load + apply display typeface
  React.useEffect(() => {
    const d = DISPLAYS[t.display] || DISPLAYS.bricolage;
    loadFont(d.query, `gf-${t.display}`);
    document.documentElement.style.setProperty('--display', d.family);
  }, [t.display]);

  // Toggle mood class on <body>
  React.useEffect(() => {
    const body = document.body;
    ['studio', 'workshop', 'gallery'].forEach(m => body.classList.remove(`mood-${m}`));
    body.classList.add(`mood-${t.mood}`);
  }, [t.mood]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette" />
      <TweakRadio
        label="Accent"
        value={t.palette}
        options={[
          { value: 'heritage', label: 'Heritage' },
          { value: 'midnight', label: 'Midnight' },
          { value: 'oxblood',  label: 'Oxblood' },
          { value: 'emerald',  label: 'Emerald' },
        ]}
        onChange={(v) => setTweak('palette', v)}
      />

      <TweakSection label="Typography" />
      <TweakRadio
        label="Display"
        value={t.display}
        options={[
          { value: 'bricolage',    label: 'Bricolage' },
          { value: 'anton',        label: 'Anton' },
          { value: 'fraunces',     label: 'Fraunces' },
          { value: 'bigshoulders', label: 'Big Shoulders' },
        ]}
        onChange={(v) => setTweak('display', v)}
      />

      <TweakSection label="Atmosphere" />
      <TweakRadio
        label="Mood"
        value={t.mood}
        options={[
          { value: 'studio',   label: 'Studio' },
          { value: 'workshop', label: 'Workshop' },
          { value: 'gallery',  label: 'Gallery' },
        ]}
        onChange={(v) => setTweak('mood', v)}
      />

      <div style={{
        marginTop: 6,
        padding: '8px 10px',
        borderRadius: 7,
        background: 'rgba(0,0,0,.04)',
        border: '.5px solid rgba(0,0,0,.06)',
        fontSize: 10.5,
        color: 'rgba(41,38,27,.62)',
        lineHeight: 1.45,
      }}>
        Three controls that reshape the feel of the page — colour identity, typographic voice, and surface atmosphere.
      </div>
    </TweaksPanel>
  );
}

const rootEl = document.getElementById('tweaks-root');
if (rootEl) ReactDOM.createRoot(rootEl).render(<App />);
