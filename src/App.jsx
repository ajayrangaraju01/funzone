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

const TdQuestionType = { TRUTH: 'TRUTH', DARE: 'DARE' };

const allTdQuestions = [
  { id: 1, text: "What's the most childish thing you still do?", type: TdQuestionType.TRUTH },
  { id: 2, text: "What's the weirdest thing you've eaten for breakfast?", type: TdQuestionType.TRUTH },
  { id: 11, text: "Sing everything you say for the next 5 minutes.", type: TdQuestionType.DARE },
  { id: 12, text: "Do an impression of another player until someone laughs.", type: TdQuestionType.DARE },
  { id: 101, text: "What's a belief you hold that you're not sure about?", type: TdQuestionType.TRUTH },
  { id: 102, text: "What is your biggest fear in a relationship?", type: TdQuestionType.TRUTH },
  { id: 201, text: "Who in this room do you think is the best kisser?", type: TdQuestionType.TRUTH },
  { id: 202, text: "What is your best pickup line?", type: TdQuestionType.TRUTH },
  { id: 311, text: "Let the group go through your phone for 30 seconds.", type: TdQuestionType.DARE },
  { id: 312, text: "Trade shirts with the person to your left.", type: TdQuestionType.DARE }
];

const allNhieQuestions = [
  { id: 501, text: "Never have I ever stalked an ex on social media." },
  { id: 502, text: "Never have I ever pretended to be sick to skip school or work." },
  { id: 503, text: "Never have I ever lied about my age." },
  { id: 504, text: "Never have I ever broken a bone." }
];

const allWyrQuestions = [
  { id: 601, optionA: "skip exams for a year", optionB: "never use your phone for a year" },
  { id: 602, optionA: "be able to fly", optionB: "be able to turn invisible" },
  { id: 603, optionA: "have unlimited money", optionB: "have unlimited time" }
];

// --- API HELPER FOR AI DARES ---
const callGemini = async (prompt) => {
  const apiKey = ""; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = { 
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "You are a fun party game host. Generate short, engaging game content." }] }
  };

  const fetchWithRetry = async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch(apiUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (!response.ok) throw new Error("API Failure");
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    return "Error generating content. Try again!";
  }
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
  const base = 'w-full text-center font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-300',
    truth: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    dare: 'bg-rose-500 hover:bg-rose-400 text-white',
    ai: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    outline: 'border-2 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
  };
   return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading}>
      {loading && <RefreshCw className="animate-spin w-5 h-5" />}
      {children}
    </button>
  );
};

const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="absolute -top-12 left-0 text-slate-400 hover:text-white flex items-center gap-1 transition z-10">
    <ArrowLeft size={20} /> Back
  </button>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeGame, setActiveGame] = useState(Game.NONE);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error("Auth Error", e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
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
        <h1 className="text-6xl font-black tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
          FUN ZONE
        </h1>
        <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">Pick your party vibe</p>
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
    <button onClick={onClick} className="flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl hover:bg-slate-800/80 transition-all group text-left active:scale-[0.98]">
      <div className="bg-slate-950 p-4 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
      <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
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
  const [playerHistory, setPlayerHistory] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const addPlayer = () => {
    if (nameInput.trim()) {
      setPlayers([...players, { id: Date.now(), name: nameInput.trim() }]);
      setNameInput('');
    }
  };

  const spin = () => {
    if (step !== 'spinning' || players.length === 0) return;

    // Filter players who haven't had a turn in the current cycle
    const unplayed = players.filter(p => !playerHistory.includes(p.id));
    
    let pool = unplayed;
    let nextHistory = playerHistory;

    // Reset if everyone has played
    if (unplayed.length === 0) {
      // To avoid the same person going twice in a row during reset:
      const lastPlayerId = playerHistory[playerHistory.length - 1];
      pool = players.filter(p => p.id !== lastPlayerId);
      nextHistory = [];
    }

    // Pick a truly random winner from the eligible pool
    const winner = pool[Math.floor(Math.random() * pool.length)];
    const winnerIndex = players.findIndex(p => p.id === winner.id);
    
    // Bottle Physics: Extra chaos
    const spins = 8 + Math.floor(Math.random() * 5); // 8 to 12 full rotations
    const targetAngle = (winnerIndex / players.length) * 360;
    
    // We add a slight random offset so it's not perfectly centered on the text
    const randomOffset = (Math.random() - 0.5) * 15; 
    
    const currentRotation = bottleRotation;
    const nextRotation = currentRotation + (spins * 360) + ((targetAngle - (currentRotation % 360) + 360) % 360) + randomOffset;

    setBottleRotation(nextRotation);
    setPlayerHistory([...nextHistory, winner.id]);

    setTimeout(() => {
      setCurrentPlayer(winner);
      setStep('selection');
    }, 3200);
  };

  const getQuestion = (type) => {
    // Filter available questions (avoiding repeats if possible)
    let available = allTdQuestions.filter(q => q.type === type && !usedQuestions.includes(q.id));
    
    // If all questions of this type used, reset history for this type
    if (available.length === 0) {
      available = allTdQuestions.filter(q => q.type === type);
      setUsedQuestions(prev => prev.filter(id => !allTdQuestions.find(q => q.id === id && q.type === type)));
    }

    const q = available[Math.floor(Math.random() * available.length)];
    setResult({ type, text: q.text });
    setUsedQuestions(prev => [...prev, q.id]);
    setStep('result');
  };

  const getAiDare = async () => {
    setLoading(true);
    const dare = await callGemini(`Generate a funny, safe, and unexpected party dare for ${currentPlayer.name}. Ensure it's original. One sentence.`);
    setResult({ type: 'DARE (AI)', text: dare });
    setLoading(false);
    setStep('result');
  };

  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <BackButton onClick={onBack} />
        <Card>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users className="text-indigo-400" /> Players</h2>
          <div className="flex gap-2 mb-4">
            <input className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl outline-none focus:border-indigo-500 transition-colors" placeholder="Enter name..." value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
            <button onClick={addPlayer} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-colors"><Plus /></button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {players.map(p => (
              <div key={p.id} className="bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 animate-in zoom-in-90">
                <span className="text-sm font-medium">{p.name}</span>
                <button onClick={() => setPlayers(players.filter(x => x.id !== p.id))} className="text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
            {players.length === 0 && <p className="text-slate-600 text-sm italic w-full text-center py-4">Add at least 2 players to start</p>}
          </div>
        </Card>
        <div className="space-y-3">
          <Button onClick={() => setStep('spinning')} disabled={players.length < 2}>Start Game</Button>
          <Button variant="outline" onClick={onBack}>Quit to Menu</Button>
        </div>
      </div>
    );
  }

  if (step === 'spinning') {
    return (
      <div className="flex flex-col items-center gap-8 py-10 animate-in fade-in duration-500">
        <BackButton onClick={() => setStep('setup')} />
        <div className="text-center">
          <h2 className="text-2xl font-black text-white italic tracking-widest">SPIN THE BOTTLE</h2>
          <p className="text-slate-500 text-xs uppercase mt-1">Who will be next?</p>
        </div>

        <div className="relative w-80 h-80 border-8 border-slate-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Players in a circle */}
          {players.map((p, i) => {
            const angle = (i / players.length) * 360;
            const isActive = playerHistory[playerHistory.length - 1] === p.id && !currentPlayer;
            return (
              <div key={p.id} className="absolute transition-all duration-500" style={{ transform: `rotate(${angle}deg) translateY(-135px)` }}>
                <div 
                  className={`px-3 py-1 rounded-lg text-sm font-bold border-2 transition-all duration-300 ${isActive ? 'bg-indigo-600 border-indigo-400 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                  style={{ transform: `rotate(-${angle}deg)` }}
                >
                  {p.name}
                </div>
              </div>
            );
          })}

          {/* Center Bottle */}
          <div 
            className="w-5 h-40 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800 rounded-full shadow-2xl border-2 border-emerald-300/30 relative transition-transform duration-[3.2s] cubic-bezier(0.15, 0, 0.15, 1)" 
            style={{ transform: `rotate(${bottleRotation}deg)`, transformOrigin: 'center 50%' }}
          >
            <div className="absolute top-0 w-full h-6 bg-emerald-200 rounded-full shadow-inner" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-20 bg-white/10 rounded-full" />
          </div>
          
          {/* Center Point */}
          <div className="absolute w-4 h-4 bg-slate-950 rounded-full border-2 border-slate-800 z-10" />
        </div>

        <div className="w-full space-y-3">
          <Button onClick={spin}>SPIN!</Button>
          <Button variant="outline" onClick={onBack}>Exit Game</Button>
        </div>
      </div>
    );
  }

  if (step === 'selection') {
    return (
      <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
        <div className="space-y-1">
          <p className="text-indigo-400 text-sm font-bold tracking-widest uppercase">The bottle chose</p>
          <h2 className="text-5xl font-black italic text-white drop-shadow-lg">{currentPlayer.name.toUpperCase()}</h2>
        </div>
        <Card className="space-y-4 bg-slate-900/50 backdrop-blur-md border-slate-700">
          <Button variant="truth" onClick={() => getQuestion('TRUTH')}>Truth</Button>
          <Button variant="dare" onClick={() => getQuestion('DARE')}>Dare</Button>
          <Button variant="ai" onClick={getAiDare} loading={loading}>AI Dare ✨</Button>
        </Card>
        <Button variant="outline" onClick={onBack}>Quit Game</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      <Card className="text-center min-h-[250px] flex flex-col justify-center gap-6 border-indigo-500/30 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black tracking-[0.2em] text-indigo-400 border border-indigo-500/20 uppercase">
            {result.type}
          </span>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{currentPlayer.name}'s Challenge</p>
        </div>
        <p className="text-2xl font-bold leading-tight text-white px-2">"{result.text}"</p>
      </Card>
      <div className="space-y-3">
        <Button onClick={() => setStep('spinning')}>Next Turn</Button>
        <Button variant="outline" onClick={onBack}>Return to Menu</Button>
      </div>
    </div>
  );
}

// --- NHIE & WYR (Simplified for localhost demo) ---
function NhieGame({ onBack, userId }) {
  const [mode, setMode] = useState(null);
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (gameId) {
      const q = doc(db, 'artifacts', appId, 'public', 'data', 'nhie_sessions', gameId);
      return onSnapshot(q, (snapshot) => {
        if (snapshot.exists()) setGameState(snapshot.data());
      }, (err) => console.error(err));
    }
  }, [gameId]);

  const createGame = async () => {
    const id = Math.random().toString(36).substring(2, 7).toUpperCase();
    const session = {
      id, hostId: userId, status: 'lobby',
      currentQuestion: allNhieQuestions[0].text,
      players: [{ id: userId, name: 'Host', fingers: 5 }],
      questionIndex: 0
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'nhie_sessions', id), session);
    setGameId(id);
    setIsHost(true);
  };

  const nextQuestion = async () => {
    if (!isHost) return;
    const nextIdx = (gameState.questionIndex + 1) % allNhieQuestions.length;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'nhie_sessions', gameId), {
      questionIndex: nextIdx, currentQuestion: allNhieQuestions[nextIdx].text
    });
  };

  const takeFinger = async () => {
    const updatedPlayers = gameState.players.map(p => p.id === userId ? { ...p, fingers: Math.max(0, p.fingers - 1) } : p);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'nhie_sessions', gameId), { players: updatedPlayers });
  };

  if (!mode) {
    return (
      <div className="space-y-4 animate-in fade-in">
        <BackButton onClick={onBack} />
        <Button onClick={() => setMode('single')}>Single Player</Button>
        <Button variant="secondary" onClick={() => setMode('multi')}>Multiplayer</Button>
        <Button variant="outline" onClick={onBack} className="mt-4"><Home size={18} /> Menu</Button>
      </div>
    );
  }

  if (mode === 'multi' && !gameId) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setMode(null)} />
        <Button onClick={createGame}>Create Game</Button>
        <div className="flex gap-2">
          <input className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Room Code" onChange={e => setGameId(e.target.value.toUpperCase())} />
        </div>
        <Button variant="outline" onClick={onBack}>Quit to Menu</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton onClick={() => { setMode(null); setGameId(''); }} />
      {gameState && (
        <>
          <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>ROOM: {gameId}</span>
            <button onClick={onBack} className="flex items-center gap-1 hover:text-white"><LogOut size={12}/> Leave</button>
          </div>
          <Card className="text-center py-10 min-h-[200px] flex items-center justify-center">
            <p className="text-2xl font-bold">{gameState.currentQuestion}</p>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="danger" onClick={takeFinger}>I HAVE 🍷</Button>
            <Button variant="secondary" onClick={() => {}}>I HAVEN'T</Button>
          </div>
          <div className="space-y-2">
            {gameState.players.map(p => (
              <div key={p.id} className="bg-slate-900 p-3 rounded-xl flex justify-between items-center border border-slate-800">
                <span className="font-bold">{p.name}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < p.fingers ? 'bg-rose-500' : 'bg-slate-700'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {isHost && <Button onClick={nextQuestion}>Next Question</Button>}
            <Button variant="outline" onClick={onBack}>Return to Menu</Button>
          </div>
        </>
      )}
    </div>
  );
}

function WyrGame({ onBack }) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(null);
  const q = allWyrQuestions[index];

  const handleNext = () => {
    setIndex((index + 1) % allWyrQuestions.length);
    setAnswered(null);
  };

  return (
    <div className="space-y-8 h-full flex flex-col justify-center animate-in fade-in">
      <BackButton onClick={onBack} />
      <div className="text-center space-y-1">
        <h2 className="text-4xl font-black italic tracking-tighter text-indigo-500 uppercase">Would You Rather</h2>
      </div>
      <div className="space-y-4 relative">
        <WyrButton text={q.optionA} active={answered === 'A'} otherActive={answered === 'B'} onClick={() => setAnswered('A')} percent={42} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 text-sm font-black z-10 shadow-lg">OR</div>
        <WyrButton text={q.optionB} active={answered === 'B'} otherActive={answered === 'A'} onClick={() => setAnswered('B')} percent={58} />
      </div>
      <div className="space-y-3">
        {answered && <Button onClick={handleNext}>Next Question <ChevronRight /></Button>}
        <Button variant="outline" onClick={onBack}>Quit Game</Button>
      </div>
    </div>
  );
}

function WyrButton({ text, active, otherActive, onClick, percent }) {
  return (
    <button onClick={onClick} disabled={active || otherActive} className={`w-full relative overflow-hidden p-8 rounded-3xl border-2 transition-all text-left flex flex-col justify-center min-h-[140px] ${active ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900'} ${otherActive ? 'opacity-50 grayscale scale-95' : 'hover:border-slate-600'}`}>
      <div className="relative z-10 flex justify-between items-center w-full">
        <p className={`text-xl font-bold leading-tight max-w-[80%] ${active ? 'text-white' : 'text-slate-300'}`}>{text}</p>
        {(active || otherActive) && <span className="text-3xl font-black italic opacity-20">{percent}%</span>}
      </div>
      {(active || otherActive) && <div className="absolute inset-y-0 left-0 bg-indigo-500/20 transition-all duration-1000" style={{ width: `${percent}%` }} />}
    </button>
  );
}