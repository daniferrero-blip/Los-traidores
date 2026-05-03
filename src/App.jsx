import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const countVotes = (votes) => {
  const c = {};
  Object.values(votes).forEach((v) => { c[v] = (c[v] || 0) + 1; });
  return c;
};

const topCandidates = (counts) => {
  if (!Object.keys(counts).length) return [];
  const max = Math.max(...Object.values(counts));
  return Object.keys(counts).filter((k) => counts[k] === max);
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold:      #C8A84B;
  --gold-l:    #E8D08A;
  --gold-d:    #7A5F1A;
  --blood:     #8B1C1C;
  --blood-l:   #C0392B;
  --ink:       #080608;
  --surface:   #120E10;
  --panel:     #1A141A;
  --panel2:    #221822;
  --text:      #E8DCC8;
  --muted:     #7A6858;
  --loyal:     #1A3A5C;
  --loyal-l:   #2980B9;
}

html, body { height: 100%; background: var(--ink); }

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 16px 40px;
  position: relative;
  overflow-x: hidden;
  font-family: 'EB Garamond', Georgia, serif;
  color: var(--text);
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, #1A0A14 0%, transparent 70%),
    var(--ink);
}

/* ── Particles ── */
.embers { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.ember {
  position: absolute;
  border-radius: 50%;
  background: var(--gold);
  opacity: 0;
  animation: float linear infinite;
}
@keyframes float {
  0%   { transform: translateY(0)   scale(1);   opacity: 0; }
  15%  { opacity: 0.7; }
  85%  { opacity: 0.3; }
  100% { transform: translateY(-100vh) scale(0); opacity: 0; }
}

/* ── Screen wrapper ── */
.screen {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  animation: fadeUp 0.5s ease-out both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Typography ── */
.title {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(2rem, 9vw, 3.2rem);
  font-weight: 900;
  color: var(--gold);
  text-align: center;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-shadow: 0 0 60px rgba(200,168,75,0.35), 0 2px 4px rgba(0,0,0,0.8);
}
.title-sm {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.1rem, 4.5vw, 1.6rem);
  font-weight: 600;
  color: var(--gold-l);
  text-align: center;
  letter-spacing: 0.05em;
}
.label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold-d);
}
.subtitle {
  font-style: italic;
  color: var(--muted);
  text-align: center;
  font-size: 1rem;
  line-height: 1.5;
}
p { line-height: 1.6; font-size: 1.05rem; text-align: center; }

/* ── Ornament ── */
.orn { color: var(--gold-d); letter-spacing: 0.6em; font-size: 1rem; text-align: center; }

/* ── Divider ── */
.div {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--gold-d) 30%, var(--gold-d) 70%, transparent);
  margin: 2px 0;
}

/* ── Card ── */
.card {
  width: 100%;
  background: var(--panel);
  border: 1px solid var(--gold-d);
  border-radius: 3px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(200,168,75,0.04) 0%, transparent 60%);
  pointer-events: none;
}
.card-blood  { border-color: var(--blood); }
.card-loyal  { border-color: var(--loyal); }
.card-nature { border-color: #2A4A2A; }

/* ── Buttons ── */
.btn {
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 15px 24px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  width: 100%;
  transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; }

.btn-gold {
  background: linear-gradient(135deg, var(--gold-d), var(--gold) 60%, var(--gold-l));
  color: #1A0E00;
  font-weight: 700;
  box-shadow: 0 2px 16px rgba(200,168,75,0.2);
}
.btn-gold:hover:not(:disabled) {
  box-shadow: 0 4px 28px rgba(200,168,75,0.4);
  transform: translateY(-1px);
}
.btn-ghost {
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--gold-d);
}
.btn-ghost:hover:not(:disabled) { background: rgba(200,168,75,0.08); }

.btn-blood {
  background: linear-gradient(135deg, #5C0F0F, var(--blood) 60%, var(--blood-l));
  color: #FFD0D0;
  box-shadow: 0 2px 16px rgba(139,28,28,0.3);
}
.btn-blood:hover:not(:disabled) {
  box-shadow: 0 4px 28px rgba(192,57,43,0.4);
  transform: translateY(-1px);
}
.btn-nature {
  background: linear-gradient(135deg, #0A160A, #1A3A1A);
  color: #7ABA7A;
  border: 1px solid #2A5A2A;
  font-size: 1.4rem;
  padding: 18px;
  letter-spacing: 0;
  text-transform: none;
  font-family: 'EB Garamond', serif;
}
.btn-nature:hover:not(:disabled) { background: linear-gradient(135deg, #1A3A1A, #2A5A2A); }

/* ── Stepper ── */
.stepper { display: flex; align-items: center; gap: 20px; justify-content: center; }
.step-btn {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  width: 48px; height: 48px;
  background: var(--panel2);
  border: 1px solid var(--gold-d);
  color: var(--gold);
  border-radius: 2px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.step-btn:hover:not(:disabled) { background: rgba(200,168,75,0.12); border-color: var(--gold); }
.step-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.step-val {
  font-family: 'Cinzel Decorative', serif;
  font-size: 3rem;
  color: var(--gold);
  min-width: 72px;
  text-align: center;
  text-shadow: 0 0 30px rgba(200,168,75,0.3);
}
.step-val-blood { color: var(--blood-l); }

/* ── Text Input ── */
.input-row { display: flex; align-items: center; gap: 10px; width: 100%; }
.idx { font-family: 'Cinzel', serif; font-size: 0.8rem; color: var(--gold-d); min-width: 20px; text-align: right; }
input[type="text"] {
  font-family: 'EB Garamond', serif;
  font-size: 1.1rem;
  background: var(--panel2);
  border: 1px solid var(--gold-d);
  color: var(--text);
  padding: 11px 14px;
  flex: 1;
  border-radius: 2px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input[type="text"]:focus { border-color: var(--gold); box-shadow: 0 0 12px rgba(200,168,75,0.15); }
input[type="text"]::placeholder { color: var(--muted); }

/* ── Vote buttons ── */
.vote-list { display: flex; flex-direction: column; gap: 7px; width: 100%; }
.vote-btn {
  font-family: 'EB Garamond', serif;
  font-size: 1.1rem;
  padding: 13px 18px;
  background: var(--panel2);
  border: 1px solid rgba(200,168,75,0.15);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s;
  display: flex; align-items: center; gap: 10px;
}
.vote-btn:hover { background: rgba(139,28,28,0.25); border-color: var(--blood-l); color: #FFB0B0; }
.vote-btn.sel { background: rgba(139,28,28,0.45); border-color: var(--blood-l); color: #FFB0B0; }

/* ── Player row ── */
.player-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px;
  background: var(--panel2);
  border: 1px solid rgba(200,168,75,0.12);
  border-radius: 2px;
  font-size: 1rem;
  transition: opacity 0.3s;
}
.player-row.dead { opacity: 0.38; border-color: rgba(139,28,28,0.4); }
.player-row.banished { opacity: 0.38; border-color: rgba(90,70,0,0.4); }
.pill {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border-radius: 20px;
  margin-left: auto;
  white-space: nowrap;
}
.pill-traitor { background: rgba(139,28,28,0.5); color: #FFAAAA; border: 1px solid var(--blood); }
.pill-loyal   { background: rgba(26,58,92,0.5);  color: #AACCFF; border: 1px solid var(--loyal); }

/* ── Role reveal ── */
.role-card {
  text-align: center;
  padding: 32px 24px;
  width: 100%;
  background: var(--panel);
  border-radius: 3px;
  border: 1px solid var(--gold-d);
  position: relative;
  overflow: hidden;
}
.role-icon { font-size: 5rem; margin: 8px 0 16px; display: block; }

/* ── Big icon transition ── */
.big-icon {
  font-size: 5.5rem;
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { transform: scale(1);    filter: brightness(1); }
  50%       { transform: scale(1.06); filter: brightness(1.15); }
}

/* ── Sheep field ── */
.sheep-field {
  position: relative;
  width: 100%;
  height: 90px;
  overflow: hidden;
  background: linear-gradient(to bottom, #060E06, #0E1E0E);
  border-radius: 6px;
  border: 1px solid #2A4A2A;
}
.sheep-star {
  position: absolute;
  width: 2px; height: 2px;
  border-radius: 50%;
  background: #88BB88;
  opacity: 0.5;
}
.sheep {
  position: absolute;
  font-size: 1.7rem;
  animation: walkSheep linear forwards;
  white-space: nowrap;
}
@keyframes walkSheep {
  from { transform: translateX(-50px); }
  to   { transform: translateX(calc(100vw + 50px)); }
}

/* ── Log entries ── */
.log-wrap { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.log-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 8px 12px;
  border-left: 2px solid var(--gold-d);
  background: rgba(255,255,255,0.02);
  border-radius: 0 2px 2px 0;
  font-size: 0.95rem;
}
.log-item.night { border-left-color: #2A2A6A; }
.log-item.day   { border-left-color: #5A4400; }
.log-name { color: var(--gold-l); }
.log-role-t { color: #FF9999; }
.log-role-l { color: #99CCFF; }

/* ── Stats bar ── */
.stats { display: flex; gap: 0; width: 100%; border: 1px solid var(--gold-d); border-radius: 2px; overflow: hidden; }
.stat-cell { flex: 1; text-align: center; padding: 12px 8px; background: var(--panel); border-right: 1px solid var(--gold-d); }
.stat-cell:last-child { border-right: none; }
.stat-num { font-family: 'Cinzel Decorative', serif; font-size: 1.8rem; color: var(--gold); }
.stat-lbl { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }

/* ── Night/Day tints ── */
.tint-night { background: radial-gradient(ellipse 70% 50% at 50% 0%, #0A0A1E 0%, transparent 70%), var(--ink); }
.tint-day   { background: radial-gradient(ellipse 70% 50% at 50% 0%, #1E1200 0%, transparent 70%), var(--ink); }

/* ── Phase badge ── */
.phase-badge {
  font-family: 'Cinzel', serif;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid currentColor;
}
.pb-night { color: #6666AA; }
.pb-day   { color: var(--gold-d); }
.pb-tie   { color: var(--blood); }

/* ── Progress dots ── */
.dots { display: flex; gap: 6px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold-d); transition: background 0.2s; }
.dot.active { background: var(--gold); }
`;

/* ─────────────────────────────────────────────
   EMBER PARTICLES
───────────────────────────────────────────── */
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${4 + i * 6.8}%`,
  delay: `${(i * 0.61).toFixed(2)}s`,
  duration: `${(5 + (i % 4) * 1.5).toFixed(1)}s`,
  size: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
}));

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Traidores() {
  // ── Setup state ──
  const [phase, setPhase] = useState("setup");
  const [numPlayers, setNumPlayers] = useState(6);
  const [names, setNames] = useState(Array(6).fill(""));
  const [numTraitors, setNumTraitors] = useState(2);

  // ── Game state ──
  const [players, setPlayers] = useState([]);       // {name, role, alive}
  const [eliminated, setEliminated] = useState([]); // {name,role,round,how}
  const [round, setRound] = useState(1);

  // ── Role reveal ──
  const [revealIdx, setRevealIdx] = useState(0);
  const [showRole, setShowRole] = useState(false);

  // ── Night voting ──
  const [nightVoterIdx, setNightVoterIdx]   = useState(0);
  const [nightVotes, setNightVotes]         = useState({});
  const [revotePool, setRevotePool]         = useState(null);
  const [showNightAction, setShowNightAction] = useState(false);
  const [selectedVote, setSelectedVote]     = useState("");
  const [nightKilled, setNightKilled]       = useState(null);

  // ── Day phase ──
  const [selectedBanish, setSelectedBanish] = useState("");
  const [dayResultData, setDayResultData]   = useState(null);

  // ── Sheep ──
  const [sheepList, setSheepList] = useState([]);
  const [totalSheep, setTotalSheep] = useState(0);

  // ── Winner ──
  const [winner, setWinner] = useState(null);

  // Derived
  const alivePlayers  = players.filter(p => p.alive);
  const aliveTraitors = alivePlayers.filter(p => p.role === "traitor");
  const aliveLoyals   = alivePlayers.filter(p => p.role === "loyal");

  /* ── Win check ── */
  const checkWin = (ps) => {
    const alive = ps.filter(p => p.alive);
    const t = alive.filter(p => p.role === "traitor").length;
    const l = alive.filter(p => p.role === "loyal").length;
    if (t === 0) return "loyal";
    if (t >= l)  return "traitor";
    return null;
  };

  /* ── Background tint per phase ── */
  const nightPhases = ["nightTransition","nightVoting","nightRevote","nightResult"];
  const dayPhases   = ["dayTransition","dayPhase","dayResult"];
  const tintClass   = nightPhases.includes(phase) ? "tint-night"
                    : dayPhases.includes(phase)   ? "tint-day"
                    : "";

  /* ─────────────────────────────────────────
     SETUP HANDLERS
  ───────────────────────────────────────── */
  const changeNumPlayers = (n) => {
    setNumPlayers(n);
    setNames(Array(n).fill(""));
    setNumTraitors(prev => Math.max(1, Math.min(Math.floor(n / 3), prev)));
  };

  const assignRoles = () => {
    const roles = shuffle([
      ...Array(numTraitors).fill("traitor"),
      ...Array(numPlayers - numTraitors).fill("loyal"),
    ]);
    const ps = names.map((name, i) => ({ name: name.trim(), role: roles[i], alive: true }));
    setPlayers(ps);
    setEliminated([]);
    setRound(1);
    setRevealIdx(0);
    setShowRole(false);
    setWinner(null);
    setPhase("roleReveal");
  };

  /* ─────────────────────────────────────────
     ROLE REVEAL HANDLERS
  ───────────────────────────────────────── */
  const nextReveal = () => {
    setShowRole(false);
    if (revealIdx + 1 >= players.length) {
      setPhase("nightTransition");
    } else {
      setRevealIdx(idx => idx + 1);
    }
  };

  /* ─────────────────────────────────────────
     NIGHT HANDLERS
  ───────────────────────────────────────── */
  const startNight = () => {
    setNightVoterIdx(0);
    setNightVotes({});
    setRevotePool(null);
    setSelectedVote("");
    setShowNightAction(false);
    setSheepList([]);
    setTotalSheep(0);
    setPhase("nightVoting");
  };

  const voteTargets = () => {
    if (revotePool) return alivePlayers.filter(p => revotePool.includes(p.name));
    const voter = alivePlayers[nightVoterIdx];
    return voter ? alivePlayers.filter(p => p.name !== voter.name) : [];
  };

  const advanceNightVoter = (votes) => {
    setSelectedVote("");
    setShowNightAction(false);
    const next = nightVoterIdx + 1;
    if (next >= alivePlayers.length) {
      resolveNight(votes);
    } else {
      setNightVoterIdx(next);
    }
  };

  const resolveNight = (votes) => {
    // Only traitor votes count
    const tVotes = {};
    aliveTraitors.forEach(t => { if (votes[t.name]) tVotes[t.name] = votes[t.name]; });
    const counts = countVotes(tVotes);
    if (!Object.keys(counts).length) { setNightKilled(null); setPhase("nightResult"); return; }
    const top = topCandidates(counts);
    if (top.length === 1) {
      setNightKilled(top[0]);
      setPhase("nightResult");
    } else {
      setRevotePool(top);
      setNightVoterIdx(0);
      setNightVotes({});
      setSelectedVote("");
      setShowNightAction(false);
      setPhase("nightRevote");
    }
  };

  const confirmVote = () => {
    if (!selectedVote) return;
    const voter = alivePlayers[nightVoterIdx];
    const updated = { ...nightVotes, [voter.name]: selectedVote };
    setNightVotes(updated);
    advanceNightVoter(updated);
  };

  const confirmRevote = () => {
    if (!selectedVote) return;
    const voter = aliveTraitors[nightVoterIdx];
    const updated = { ...nightVotes, [voter.name]: selectedVote };
    setNightVotes(updated);
    const next = nightVoterIdx + 1;
    if (next >= aliveTraitors.length) {
      const counts = countVotes(updated);
      const top = topCandidates(counts);
      const killed = top[Math.floor(Math.random() * top.length)];
      setNightKilled(killed);
      setRevotePool(null);
      setPhase("nightResult");
    } else {
      setNightVoterIdx(next);
      setSelectedVote("");
      setShowNightAction(false);
    }
  };

  const applyNightKill = () => {
    if (!nightKilled) { setPhase("dayTransition"); return; }
    const updated = players.map(p => p.name === nightKilled ? { ...p, alive: false } : p);
    const killed = players.find(p => p.name === nightKilled);
    setPlayers(updated);
    setEliminated(e => [...e, { name: nightKilled, role: killed.role, round, how: "killed" }]);
    const w = checkWin(updated);
    if (w) { setWinner(w); setPhase("dayTransition"); }
    else setPhase("dayTransition");
  };

  /* ─────────────────────────────────────────
     DAY HANDLERS
  ───────────────────────────────────────── */
  const startDay = () => { setSelectedBanish(""); setDayResultData(null); setPhase("dayPhase"); };

  const applyBanish = () => {
    if (!selectedBanish) return;
    const banished = players.find(p => p.name === selectedBanish);
    if (!banished) return;
    const updated = players.map(p => p.name === selectedBanish ? { ...p, alive: false } : p);
    setPlayers(updated);
    setEliminated(e => [...e, { name: selectedBanish, role: banished.role, round, how: "banished" }]);
    setDayResultData({ name: selectedBanish, role: banished.role });
    const w = checkWin(updated);
    if (w) setWinner(w);
    setPhase("dayResult");
  };

  const nextRound = () => {
    if (winner) { setPhase("gameOver"); return; }
    setRound(r => r + 1);
    setPhase("nightTransition");
  };

  /* ─────────────────────────────────────────
     SHEEP
  ───────────────────────────────────────── */
  const addSheep = () => {
    const id = Date.now() + Math.random();
    const bottom = 8 + Math.random() * 55;
    const dur = 2.8 + Math.random() * 2.2;
    setSheepList(prev => [...prev.slice(-12), { id, bottom, dur }]);
    setTotalSheep(n => n + 1);
    setTimeout(() => setSheepList(prev => prev.filter(s => s.id !== id)), (dur + 0.5) * 1000);
  };

  /* ─────────────────────────────────────────
     RENDER HELPERS
  ───────────────────────────────────────── */
  const Dots = ({ total, active }) => (
    <div className="dots">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`dot${i <= active ? " active" : ""}`} />
      ))}
    </div>
  );

  /* ═══════════════════════════════════════
     SCREENS
  ═══════════════════════════════════════ */

  /* ── 1. Setup ── */
  const ScreenSetup = () => (
    <div className="screen" key="setup">
      <div className="orn">✦ ✦ ✦</div>
      <div className="title">Los<br/>Traidores</div>
      <div className="subtitle">La traición acecha en las sombras</div>
      <div className="div" />
      <div className="card">
        <div className="label" style={{ textAlign:"center", marginBottom: 16 }}>Número de jugadores</div>
        <div className="stepper">
          <button className="step-btn" onClick={() => changeNumPlayers(Math.max(4, numPlayers - 1))} disabled={numPlayers <= 4}>−</button>
          <span className="step-val">{numPlayers}</span>
          <button className="step-btn" onClick={() => changeNumPlayers(Math.min(20, numPlayers + 1))} disabled={numPlayers >= 20}>+</button>
        </div>
        <p className="subtitle" style={{ marginTop: 12, fontSize: "0.9rem" }}>mínimo 4 jugadores</p>
      </div>
      <button className="btn btn-gold" onClick={() => setPhase("enterNames")}>
        Continuar →
      </button>
      <div className="orn">✦ ✦ ✦</div>
    </div>
  );

  /* ── 2. Enter Names ── */
  const ScreenNames = () => (
    <div className="screen" key="names">
      <div className="label">Ronda de presentaciones</div>
      <div className="title-sm">¿Quiénes juegan?</div>
      <p className="subtitle">Introduce el nombre de cada jugador</p>
      <div className="card" style={{ display:"flex", flexDirection:"column", gap: 9 }}>
        {names.map((n, i) => (
          <div key={i} className="input-row">
            <span className="idx">{i + 1}</span>
            <input
              type="text"
              placeholder={`Jugador ${i + 1}`}
              value={n}
              maxLength={20}
              onChange={e => {
                const a = [...names]; a[i] = e.target.value; setNames(a);
              }}
            />
          </div>
        ))}
      </div>
      <button className="btn btn-gold" onClick={() => setPhase("chooseTraitors")} disabled={names.some(n => !n.trim())}>
        Continuar →
      </button>
      <button className="btn btn-ghost" onClick={() => setPhase("setup")}>← Volver</button>
    </div>
  );

  /* ── 3. Choose Traitors ── */
  const ScreenChooseTraitors = () => {
    const max = Math.floor(numPlayers / 3);
    return (
      <div className="screen" key="traitors">
        <div className="label">Asignación de roles</div>
        <div className="title-sm">¿Cuántos traidores?</div>
        <p className="subtitle">{numPlayers} jugadores en juego</p>
        <div className="card">
          <div className="stepper">
            <button className="step-btn" onClick={() => setNumTraitors(t => Math.max(1, t - 1))} disabled={numTraitors <= 1}>−</button>
            <span className="step-val step-val-blood">{numTraitors}</span>
            <button className="step-btn" onClick={() => setNumTraitors(t => Math.min(max, t + 1))} disabled={numTraitors >= max}>+</button>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap: 24, marginTop: 16 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel Decorative,serif", fontSize:"1.6rem", color: "var(--blood-l)" }}>{numTraitors}</div>
              <div className="subtitle" style={{ fontSize:"0.85rem" }}>traidores</div>
            </div>
            <div style={{ width:1, background:"var(--gold-d)" }} />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel Decorative,serif", fontSize:"1.6rem", color:"var(--loyal-l)" }}>{numPlayers - numTraitors}</div>
              <div className="subtitle" style={{ fontSize:"0.85rem" }}>leales</div>
            </div>
          </div>
        </div>
        <button className="btn btn-gold" onClick={assignRoles}>🎭 Repartir roles</button>
        <button className="btn btn-ghost" onClick={() => setPhase("enterNames")}>← Volver</button>
      </div>
    );
  };

  /* ── 4. Role Reveal ── */
  const ScreenRoleReveal = () => {
    const player = players[revealIdx];
    if (!player) return null;
    const isTraitor = player.role === "traitor";
    const fellows = players.filter(p => p.role === "traitor" && p.name !== player.name);

    return (
      <div className="screen" key={`reveal-${revealIdx}`}>
        <Dots total={players.length} active={revealIdx} />
        {!showRole ? (
          <>
            <div className="label">Turno de</div>
            <div className="title">{player.name}</div>
            <div className="card" style={{ textAlign:"center" }}>
              <p>Toma el móvil en privado y descubre<br/>tu destino en estas sombras.</p>
              <p className="subtitle" style={{ marginTop: 10 }}>Los demás deben apartar la mirada.</p>
            </div>
            <button className="btn btn-gold" onClick={() => setShowRole(true)}>🔮 Revelar mi rol</button>
          </>
        ) : (
          <div className="role-card" style={{ borderColor: isTraitor ? "var(--blood)" : "var(--loyal)" }}>
            <span className="role-icon">{isTraitor ? "🗡️" : "🛡️"}</span>
            <div className="title-sm" style={{ color: isTraitor ? "var(--blood-l)" : "var(--loyal-l)", marginBottom: 8 }}>
              {isTraitor ? "Traidor" : "Leal"}
            </div>
            {isTraitor ? (
              <>
                {fellows.length > 0 ? (
                  <div style={{ marginTop: 14 }}>
                    <div className="label" style={{ textAlign:"center", marginBottom: 10, color:"var(--blood)" }}>
                      Tus cómplices son
                    </div>
                    {fellows.map(f => (
                      <p key={f.name} style={{ color:"#FFAAAA", fontSize:"1.15rem" }}>🗡️ {f.name}</p>
                    ))}
                  </div>
                ) : (
                  <p style={{ color:"#FFAAAA", marginTop: 10, fontStyle:"italic" }}>
                    Eres el único traidor.<br/>Actúa con astucia...
                  </p>
                )}
              </>
            ) : (
              <p className="subtitle" style={{ marginTop: 10 }}>
                Descubre y destierra<br/>a todos los traidores.
              </p>
            )}
            <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={nextReveal}>
              ✓ Entendido — Pasar →
            </button>
          </div>
        )}
      </div>
    );
  };

  /* ── 5. Night Transition ── */
  const ScreenNightTransition = () => (
    <div className="screen" key="night-tr">
      <span className="big-icon">🌙</span>
      <div className="title">Buenas<br/>noches...</div>
      <p className="subtitle">Ronda {round} · La oscuridad desciende sobre el castillo</p>
      <div className="div" />
      <div className="card card-blood" style={{ textAlign:"center" }}>
        <p>Los traidores despiertan<br/>y eligen a su próxima víctima.</p>
        <p className="subtitle" style={{ marginTop: 8 }}>Los demás duermen... o eso creen.</p>
      </div>
      <button className="btn btn-blood" onClick={startNight}>🗡️ Comenzar la noche</button>
    </div>
  );

  /* ── 6. Night Voting ── */
  const ScreenNightVoting = () => {
    const voter = alivePlayers[nightVoterIdx];
    if (!voter) return null;
    const isTraitor = voter.role === "traitor";
    const targets = voteTargets();

    return (
      <div className="screen" key={`nv-${nightVoterIdx}`}>
        <div className="phase-badge pb-night">🌙 Noche — Ronda {round}</div>
        <div className="label">Turno de</div>
        <div className="title">{voter.name}</div>

        {!showNightAction ? (
          <>
            <div className="card" style={{ textAlign:"center" }}>
              <p>Toma el móvil<br/>y descubre tu acción nocturna.</p>
            </div>
            <button className="btn btn-gold" onClick={() => { setShowNightAction(true); setSheepList([]); }}>
              🔮 Ver mi acción
            </button>
          </>
        ) : isTraitor ? (
          <>
            <div className="card card-blood">
              <div className="label" style={{ color:"var(--blood-l)", textAlign:"center", marginBottom: 14 }}>
                🗡️ Elige tu víctima esta noche
              </div>
              <div className="vote-list">
                {targets.map(t => (
                  <button
                    key={t.name}
                    className={`vote-btn${selectedVote === t.name ? " sel" : ""}`}
                    onClick={() => setSelectedVote(t.name)}
                  >
                    <span style={{ opacity:0.6 }}>☽</span>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-blood" disabled={!selectedVote} onClick={confirmVote}>
              Confirmar voto secreto
            </button>
          </>
        ) : (
          <>
            <div className="card card-nature" style={{ textAlign:"center" }}>
              <p style={{ color:"#7ABA7A", fontSize:"1.15rem", marginBottom: 14 }}>
                🙏 Reza para sobrevivir esta noche...
              </p>
              <div className="sheep-field">
                {Array.from({length: 8}, (_,i) => (
                  <div key={i} className="sheep-star" style={{ left:`${10+i*12}%`, top:`${15+i*8}%` }} />
                ))}
                {sheepList.map(s => (
                  <span
                    key={s.id}
                    className="sheep"
                    style={{ bottom:`${s.bottom}%`, animationDuration:`${s.dur}s` }}
                  >🐑</span>
                ))}
              </div>
              <p className="subtitle" style={{ marginTop: 10, fontSize:"0.9rem" }}>
                {totalSheep === 0
                  ? "Pulsa para empezar a rezar..."
                  : `${totalSheep} oveja${totalSheep !== 1 ? "s" : ""} ${totalSheep < 5 ? "contada..." : totalSheep < 10 ? "ya van unas cuantas..." : "¡El cielo se ha llenado de ovejas! 🐑"}`}
              </p>
            </div>
            <button className="btn btn-nature" onClick={addSheep}>🐑 Rezar</button>
            <button className="btn btn-ghost" onClick={() => advanceNightVoter(nightVotes)}>
              Amén — Pasar →
            </button>
          </>
        )}

        <p className="subtitle" style={{ fontSize:"0.85rem" }}>
          Jugador {nightVoterIdx + 1} / {alivePlayers.length}
        </p>
      </div>
    );
  };

  /* ── 7. Night Revote ── */
  const ScreenNightRevote = () => {
    const voter = aliveTraitors[nightVoterIdx];
    if (!voter) return null;
    const targets = (revotePool || []).map(n => alivePlayers.find(p => p.name === n)).filter(Boolean);

    return (
      <div className="screen" key={`nr-${nightVoterIdx}`}>
        <div className="phase-badge pb-tie">⚖️ Empate — Revotación</div>
        <div className="label">Traidor</div>
        <div className="title">{voter.name}</div>

        {!showNightAction ? (
          <>
            <div className="card card-blood" style={{ textAlign:"center" }}>
              <p>Hay un empate.<br/>Los traidores deben desempatar.</p>
            </div>
            <button className="btn btn-gold" onClick={() => setShowNightAction(true)}>
              🔮 Ver mi voto
            </button>
          </>
        ) : (
          <>
            <div className="card card-blood">
              <div className="label" style={{ color:"var(--blood-l)", textAlign:"center", marginBottom: 14 }}>
                ⚖️ Desempate — Elige
              </div>
              <div className="vote-list">
                {targets.map(t => (
                  <button
                    key={t.name}
                    className={`vote-btn${selectedVote === t.name ? " sel" : ""}`}
                    onClick={() => setSelectedVote(t.name)}
                  >
                    ☽ {t.name}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-blood" disabled={!selectedVote} onClick={confirmRevote}>
              Confirmar desempate
            </button>
          </>
        )}

        <p className="subtitle" style={{ fontSize:"0.85rem" }}>
          Traidor {nightVoterIdx + 1} / {aliveTraitors.length}
        </p>
      </div>
    );
  };

  /* ── 8. Night Result ── */
  const ScreenNightResult = () => {
    const killed = nightKilled ? players.find(p => p.name === nightKilled) : null;
    return (
      <div className="screen" key="night-res">
        <span className="big-icon">{killed ? "💀" : "🤫"}</span>
        <div className="title-sm" style={{ color:"var(--muted)" }}>Esta noche...</div>
        {killed ? (
          <>
            <div className="title">{killed.name}</div>
            <p>ha sido eliminado por los traidores.</p>
          </>
        ) : (
          <p>Los traidores no se pusieron de acuerdo.<br/>Esta noche nadie muere.</p>
        )}
        <div className="div" />
        <button className="btn btn-gold" onClick={applyNightKill}>
          ☀️ Continuar al amanecer →
        </button>
      </div>
    );
  };

  /* ── 9. Day Transition ── */
  const ScreenDayTransition = () => {
    const lastKilled = [...eliminated].reverse().find(e => e.round === round && e.how === "killed");
    return (
      <div className="screen" key="day-tr">
        <span className="big-icon">☀️</span>
        <div className="title">Buenos<br/>días...</div>
        {lastKilled ? (
          <div className="card" style={{ textAlign:"center" }}>
            <p>
              Esta mañana,{" "}
              <strong style={{ color:"var(--gold-l)" }}>{lastKilled.name}</strong>{" "}
              ha sido encontrado muerto.
            </p>
            <p className="subtitle" style={{ marginTop: 8 }}>
              Era {lastKilled.role === "traitor"
                ? <span style={{ color:"#FF9999" }}>🗡️ un Traidor</span>
                : <span style={{ color:"#99CCFF" }}>🛡️ un Leal</span>}
            </p>
          </div>
        ) : (
          <p className="subtitle">Esta mañana todos amanecen con vida.</p>
        )}
        <div className="div" />
        {winner ? (
          <button className="btn btn-gold" onClick={() => setPhase("gameOver")}>
            🏆 Ver resultado final →
          </button>
        ) : (
          <button className="btn btn-gold" onClick={startDay}>
            ⚖️ Comenzar el juicio
          </button>
        )}
      </div>
    );
  };

  /* ── 10. Day Phase ── */
  const ScreenDayPhase = () => {
    const candidates = players.filter(p => p.alive);
    return (
      <div className="screen" key="day">
        <div className="phase-badge pb-day">☀️ Día — Ronda {round}</div>
        <div className="title-sm">El Gran Juicio</div>
        <p className="subtitle">Los jugadores debaten y votan públicamente.<br/>¿A quién destierran hoy?</p>

        <div className="stats">
          <div className="stat-cell">
            <div className="stat-num">{alivePlayers.length}</div>
            <div className="stat-lbl">vivos</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num" style={{ color:"var(--blood-l)" }}>{eliminated.filter(e=>e.how==="killed").length}</div>
            <div className="stat-lbl">asesinados</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num" style={{ color:"#C8A800" }}>{eliminated.filter(e=>e.how==="banished").length}</div>
            <div className="stat-lbl">desterrados</div>
          </div>
        </div>

        <div className="card">
          <div className="label" style={{ marginBottom: 12 }}>Selecciona al desterrado</div>
          <div className="vote-list">
            {candidates.map(p => (
              <button
                key={p.name}
                className={`vote-btn${selectedBanish === p.name ? " sel" : ""}`}
                onClick={() => setSelectedBanish(p.name)}
              >
                <span style={{ opacity: 0.5 }}>⚖</span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {eliminated.length > 0 && (
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>Crónica de la partida</div>
            <div className="log-wrap">
              {eliminated.map((e, i) => (
                <div key={i} className={`log-item ${e.how === "killed" ? "night" : "day"}`}>
                  <span>{e.how === "killed" ? "🌙" : "☀️"}</span>
                  <span>
                    R{e.round} · <span className="log-name">{e.name}</span> ·{" "}
                    {e.role === "traitor"
                      ? <span className="log-role-t">Traidor</span>
                      : <span className="log-role-l">Leal</span>} ·{" "}
                    <span style={{ color:"var(--muted)" }}>{e.how === "killed" ? "Asesinado" : "Desterrado"}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-blood" disabled={!selectedBanish} onClick={applyBanish}>
          ⚖️ Desterrar a {selectedBanish || "..."}
        </button>
      </div>
    );
  };

  /* ── 11. Day Result ── */
  const ScreenDayResult = () => {
    const d = dayResultData;
    if (!d) return null;
    const isT = d.role === "traitor";
    return (
      <div className="screen" key="day-res">
        <span className="big-icon">{isT ? "🎉" : "😱"}</span>
        <div className="title-sm" style={{ color:"var(--muted)" }}>El pueblo ha hablado</div>
        <div className="title">{d.name}</div>
        <p>ha sido desterrado.</p>
        <div className="card" style={{ borderColor: isT ? "var(--gold)" : "var(--blood)", textAlign:"center" }}>
          <p style={{ fontSize:"1.2rem" }}>
            Era{" "}
            {isT
              ? <span style={{ color:"#FF9999" }}>🗡️ un Traidor</span>
              : <span style={{ color:"#99CCFF" }}>🛡️ un Leal</span>}
          </p>
          {isT && !winner && <p className="subtitle" style={{ marginTop: 8 }}>¡Un traidor menos entre vosotros!</p>}
          {!isT && <p className="subtitle" style={{ marginTop: 8 }}>El engaño continúa en las sombras...</p>}
        </div>
        <div className="div" />
        <button className="btn btn-gold" onClick={nextRound}>
          {winner ? "🏆 Ver resultado final →" : "🌙 Continuar a la noche →"}
        </button>
      </div>
    );
  };

  /* ── 12. Game Over ── */
  const ScreenGameOver = () => {
    const isT = winner === "traitor";
    const traitorPlayers = players.filter(p => p.role === "traitor");
    const loyalPlayers   = players.filter(p => p.role === "loyal");

    return (
      <div className="screen" key="gameover">
        <span className="big-icon">{isT ? "🗡️" : "🛡️"}</span>
        <div className="title" style={{ color: isT ? "var(--blood-l)" : "var(--loyal-l)" }}>
          {isT ? "¡Los Traidores\nganan!" : "¡Los Leales\nganan!"}
        </div>
        <p className="subtitle">
          {isT ? "La traición ha triunfado en las sombras..." : "La verdad ha salido a la luz al fin."}
        </p>
        <div className="div" />

        <div className="card card-blood">
          <div className="label" style={{ color:"var(--blood-l)", marginBottom: 12 }}>🗡️ Los Traidores eran</div>
          {traitorPlayers.map(p => (
            <div key={p.name} className="player-row" style={{ marginBottom: 6, borderColor:"rgba(192,57,43,0.35)" }}>
              <span>🗡️</span>
              <span>{p.name}</span>
              <span className="pill pill-traitor">{p.alive ? "Superviviente" : "Eliminado"}</span>
            </div>
          ))}
        </div>

        <div className="card card-loyal">
          <div className="label" style={{ color:"var(--loyal-l)", marginBottom: 12 }}>🛡️ Los Leales eran</div>
          {loyalPlayers.map(p => (
            <div key={p.name} className="player-row" style={{ marginBottom: 6, borderColor:"rgba(41,128,185,0.35)" }}>
              <span>🛡️</span>
              <span>{p.name}</span>
              <span className="pill pill-loyal">{p.alive ? "Superviviente" : "Eliminado"}</span>
            </div>
          ))}
        </div>

        {eliminated.length > 0 && (
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>📜 Crónica de la partida</div>
            <div className="log-wrap">
              {eliminated.map((e, i) => (
                <div key={i} className={`log-item ${e.how === "killed" ? "night" : "day"}`}>
                  <span>{e.how === "killed" ? "🌙" : "☀️"}</span>
                  <span>
                    R{e.round} · <span className="log-name">{e.name}</span> ·{" "}
                    {e.role === "traitor"
                      ? <span className="log-role-t">Traidor</span>
                      : <span className="log-role-l">Leal</span>} ·{" "}
                    <span style={{ color:"var(--muted)" }}>{e.how === "killed" ? "Asesinado" : "Desterrado"}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn-gold"
          onClick={() => {
            setPhase("setup"); setPlayers([]); setEliminated([]);
            setWinner(null); setRound(1); setNames(Array(numPlayers).fill(""));
          }}
        >
          🎭 Nueva partida
        </button>
      </div>
    );
  };

  /* ─────────────────────────────────────────
     ROOT RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className={`app ${tintClass}`}>

        {/* Ambient embers */}
        <div className="embers">
          {EMBERS.map(e => (
            <div
              key={e.id}
              className="ember"
              style={{
                left: e.left,
                width: e.size,
                height: e.size,
                animationDelay: e.delay,
                animationDuration: e.duration,
              }}
            />
          ))}
        </div>

        {phase === "setup"           && <ScreenSetup />}
        {phase === "enterNames"      && <ScreenNames />}
        {phase === "chooseTraitors"  && <ScreenChooseTraitors />}
        {phase === "roleReveal"      && <ScreenRoleReveal />}
        {phase === "nightTransition" && <ScreenNightTransition />}
        {phase === "nightVoting"     && <ScreenNightVoting />}
        {phase === "nightRevote"     && <ScreenNightRevote />}
        {phase === "nightResult"     && <ScreenNightResult />}
        {phase === "dayTransition"   && <ScreenDayTransition />}
        {phase === "dayPhase"        && <ScreenDayPhase />}
        {phase === "dayResult"       && <ScreenDayResult />}
        {phase === "gameOver"        && <ScreenGameOver />}

      </div>
    </>
  );
}

