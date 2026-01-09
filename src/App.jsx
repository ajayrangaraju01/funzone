import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Plus, Trash2, Users, CheckSquare, 
  ArrowLeft, Swords, PartyPopper, RefreshCw, Home, LogOut
} from 'lucide-react';
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

// --- FIREBASE CONFIG ---
// We add defaults here so the app doesn't crash on localhost
const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER", // Replace with your real key
  authDomain: "fun-zone.firebaseapp.com",
  projectId: "fun-zone",
  storageBucket: "fun-zone.appspot.com",
  messagingSenderId: "0000000000",
  appId: "1:000:web:000"
};

const appId = 'fun-zone-default';

// Initialize Firebase safely
let app, auth, db;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// --- CONSTANTS & QUESTIONS ---
const Game = {
  NONE: 'NONE',
  TRUTH_OR_DARE: 'Truth or Dare',
  NEVER_HAVE_I_EVER: 'Never Have I Ever',
  WOULD_YOU_RATHER: 'Would You Rather',
};

const allTdQuestions = [
  { id: 1, text: "What's the most childish thing you still do?", type: 'TRUTH' },
  { id: 2, text: "What's the weirdest thing you've eaten for breakfast?", type: 'TRUTH' },
  { id: 11, text: "Sing everything you say for the next 5 minutes.", type: 'DARE' },
  { id: 12, text: "Do an impression of another player until someone laughs.", type: 'DARE' },
  { id: 311, text: "Let the group go through your phone for 30 seconds.", type: 'DARE' }
];

const allNhieQuestions = [
  { id: 501, text: "Never have I ever stalked an ex on social media." },
  { id: 502, text: "Never have I ever pretended to be sick to skip school or work." }
];

const allWyrQuestions = [
  { id: 601, optionA: "skip exams for a year", optionB: "never use your phone for a year" },
  { id: 602, optionA: "be able to fly", optionB: "be able to turn invisible" }
];

// --- API HELPER FOR AI DARES ---
const callGemini = async (prompt) => {
  const apiKey = "YOUR_GEMINI_KEY"; // Replace with your key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (e) { return "Do 10 pushups!"; }
};

// --- UI COMPONENTS ---
const ScreenWrapper = ({ children }) => (
  <div className="bg-slate-950 text-white min-h-screen font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
    <div className="w-full max-w-md mx-auto relative">{children}</div>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, loading = false }) => {
  const base = 'w-full text-center font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-300',
    truth: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    dare: 'bg-rose-500 hover:bg-rose-400 text-white',
    ai: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white',
    outline: 'border-2 border-slate-800 text-slate-400 hover:text-white'
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading}>
      {loading && <RefreshCw className="animate-spin w-5 h-5" />}
      {children}
    </button>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeGame, setActiveGame] = useState(Game.NONE);
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
    signInAnonymously(auth).catch(() => {});
  }, []);

  const goHome = () => setActiveGame(Game.NONE);

  return (
    <ScreenWrapper>
      {activeGame === Game.NONE && <FunZoneMenu onSelect={setActiveGame} />}
      {activeGame === Game.TRUTH_OR_DARE && <TruthOrDareGame onBack={goHome} />}
      {activeGame === Game.NEVER_HAVE_I_EVER && <NhieGame onBack={goHome} userId={user?.uid} />}
      {activeGame === Game.WOULD_YOU_RATHER && <WyrGame onBack={goHome} />}
    </ScreenWrapper>
  );
}

function FunZoneMenu({ onSelect }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">FUN ZONE</h1>
        <p className="text-slate-400 font-medium uppercase text-sm tracking-widest">Pick your party vibe</p>
      </div>
      <div className="grid gap-4">
        <MenuButton icon={<Swords className="text-emerald-400" />} title="Truth or Dare" desc="Classic group challenge" onClick={() => onSelect(Game.TRUTH_OR_DARE)} />
        <MenuButton icon={<PartyPopper className="text-purple-400" />} title="Never Have I Ever" desc="The confession game" onClick={() => onSelect(Game.NEVER_HAVE_I_EVER)} />
        <MenuButton icon={<CheckSquare className="text-orange-400" />} title="Would You Rather" desc="Tough choices only" onClick={() => onSelect(Game.WOULD_YOU_RATHER)} />
      </div>
    </div>
  );
}

function MenuButton({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all group text-left">
      <div className="bg-slate-950 p-4 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
      <ChevronRight className="text-slate-600" />
    </button>
  );
}

// --- FULL TRUTH OR DARE WITH BOTTLE SPIN ---
function TruthOrDareGame({ onBack }) {
  const [step, setStep] = useState('setup'); 
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bottleRotation, setBottleRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addPlayer = () => {
    if (nameInput.trim()) {
      setPlayers([...players, { id: Date.now(), name: nameInput.trim() }]);
      setNameInput('');
    }
  };

  const spin = () => {
    if (players.length < 2) return;

    const winnerIndex = Math.floor(Math.random() * players.length);
    const winner = players[winnerIndex];

    // --- THE MATH FIX ---
    // 1. Calculate the angle where the player is sitting (360 / total players * index)
    const playerAngle = (winnerIndex / players.length) * 360;
    
    // 2. Add multiple full spins (8-12) so it looks fast
    const extraSpins = (8 + Math.floor(Math.random() * 5)) * 360;
    
    // 3. Calculate the new total rotation
    // We subtract the current rotation % 360 to find the "base" and add the player's angle
    const currentRotationBase = Math.floor(bottleRotation / 360) * 360;
    const nextRotation = currentRotationBase + extraSpins + playerAngle;

    setBottleRotation(nextRotation);

    // Wait for the CSS transition (3 seconds) before showing the selection screen
    setTimeout(() => {
      setCurrentPlayer(winner);
      setStep('selection');
    }, 3100); 
  };

  if (step === 'setup') {
    return (
      <Card>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="text-indigo-400" /> Players
        </h2>
        <div className="flex gap-2 mb-4">
          <input 
            className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl outline-none focus:border-indigo-500 transition-colors" 
            placeholder="Enter name..." 
            value={nameInput} 
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
          />
          <button onClick={addPlayer} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500">
            <Plus />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6 max-h-32 overflow-y-auto">
          {players.map(p => (
            <div key={p.id} className="bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-sm font-medium">{p.name}</span>
              <Trash2 
                size={14} 
                className="text-rose-500 cursor-pointer" 
                onClick={() => setPlayers(players.filter(x => x.id !== p.id))} 
              />
            </div>
          ))}
        </div>
        <Button onClick={() => setStep('spinning')} disabled={players.length < 2}>Start Game</Button>
        <button onClick={onBack} className="w-full mt-4 text-slate-500 text-sm hover:text-white transition-colors">Back to Menu</button>
      </Card>
    );
  }

  if (step === 'spinning') {
    return (
      <div className="flex flex-col items-center gap-12 py-10 animate-in fade-in duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-black italic tracking-widest text-white">SPIN THE BOTTLE</h2>
          <p className="text-slate-500 text-xs uppercase mt-1">Wait for it...</p>
        </div>

        {/* --- THE BOTTLE CIRCLE --- */}
        <div className="relative w-80 h-80 border-4 border-slate-900 rounded-full flex items-center justify-center bg-slate-900/20 shadow-inner">
          
          {/* Player Names Positioned in a Circle */}
          {players.map((p, i) => {
            const angle = (i / players.length) * 360;
            return (
              <div 
                key={p.id} 
                className="absolute transition-all duration-500"
                style={{ transform: `rotate(${angle}deg) translateY(-130px)` }}
              >
                {/* We rotate the text back so it's always readable (not upside down) */}
                <div className="font-bold text-sm bg-slate-800 px-2 py-1 rounded shadow-lg" style={{ transform: `rotate(-${angle}deg)` }}>
                  {p.name}
                </div>
              </div>
            );
          })}

          {/* The Bottle Pointer */}
          <div 
            className="w-4 h-44 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-900 rounded-full shadow-2xl border-2 border-emerald-300/20 relative transition-transform duration-[3s] ease-out" 
            style={{ 
                transform: `rotate(${bottleRotation}deg)`,
                transformOrigin: 'center center' // Ensures it rotates around the middle
            }}
          >
            {/* The "Cap" of the bottle (The pointer part) */}
            <div className="absolute top-0 w-full h-8 bg-emerald-200 rounded-t-full shadow-inner" />
          </div>
          
          {/* Center Pivot Point */}
          <div className="absolute w-6 h-6 bg-slate-950 rounded-full border-4 border-slate-800 z-10 shadow-lg" />
        </div>

        <div className="w-full max-w-xs">
          <Button onClick={spin}>SPIN!</Button>
        </div>
      </div>
    );
  }

  // ... (Selection and Result steps remain the same as your previous full code)
  return (
    <div className="text-center space-y-6">
      <h2 className="text-5xl font-black italic">{currentPlayer?.name.toUpperCase()}</h2>
      <Card className="space-y-4">
        <Button variant="truth" onClick={() => { setResult({type:'TRUTH', text: 'What is your biggest secret?'}); setStep('result'); }}>Truth</Button>
        <Button variant="dare" onClick={() => { setResult({type:'DARE', text: 'Do 20 jumping jacks!'}); setStep('result'); }}>Dare</Button>
      </Card>
      <Button variant="outline" onClick={() => setStep('spinning')}>Reset Bottle</Button>
    </div>
  );
}

// --- NHIE & WYR (Simplified for localhost demo) ---
function NhieGame({ onBack }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="text-center space-y-6">
      <Card className="min-h-[200px] flex items-center justify-center font-bold text-2xl">{allNhieQuestions[idx].text}</Card>
      <Button onClick={() => setIdx((idx + 1) % allNhieQuestions.length)}>Next Question</Button>
      <Button variant="outline" onClick={onBack}>Menu</Button>
    </div>
  );
}

function WyrGame({ onBack }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="space-y-4">
      <h2 className="text-center text-3xl font-black mb-6">WOULD YOU RATHER?</h2>
      <Button variant="outline" className="py-10" onClick={() => setIdx((idx + 1) % allWyrQuestions.length)}>{allWyrQuestions[idx].optionA}</Button>
      <div className="text-center font-bold text-slate-500">OR</div>
      <Button variant="outline" className="py-10" onClick={() => setIdx((idx + 1) % allWyrQuestions.length)}>{allWyrQuestions[idx].optionB}</Button>
      <Button variant="secondary" onClick={onBack} className="mt-6">Back</Button>
    </div>
  );
}