import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  Smartphone, 
  Calendar, 
  User, 
  Printer, 
  Compass, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Layers,
  AlertCircle
} from 'lucide-react';

// --- Numerology Logic Helpers ---

// Reduce a number to a single digit (1-9)
const reduceToSingleDigit = (num) => {
  let n = parseInt(num);
  if (isNaN(n)) return 0;
  while (n > 9) {
    n = n.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  }
  return n;
};

// Calculate sum without reducing immediately (for compound numbers)
const calculateCompoundSum = (str) => {
  const cleanStr = str.replace(/\D/g, '');
  return cleanStr.split('').reduce((acc, curr) => acc + parseInt(curr), 0);
};

// Planet Mapping with Keywords for Dynamic Interpretation
const planets = {
  0: { planet: "Void", element: "Space", color: "Grey", keywords: ["Emptiness", "Amplifier", "Hidden Potential"] },
  1: { planet: "Sun", element: "Water", color: "Orange/Red", direction: "East", keywords: ["Leadership", "Ego", "Government", "Father", "Authority"] },
  2: { planet: "Moon", element: "Earth", color: "White/Silver", direction: "North-West", keywords: ["Emotion", "Intuition", "Mother", "Fluctuation", "Art"] },
  3: { planet: "Jupiter", element: "Wood", color: "Yellow", direction: "North-East", keywords: ["Wisdom", "Expansion", "Teaching", "Spirituality", "Advisor"] },
  4: { planet: "Rahu", element: "Wood", color: "Blue", direction: "South-West", keywords: ["Illusion", "Obsession", "Technical", "Sudden Gains", "Foreign"] },
  5: { planet: "Mercury", element: "Earth", color: "Green", direction: "North", keywords: ["Communication", "Business", "Balance", "Intelligence", "Fun"] },
  6: { planet: "Venus", element: "Metal", color: "White/Pink", direction: "South-East", keywords: ["Luxury", "Love", "Media", "Comfort", "Vehicles"] },
  7: { planet: "Ketu", element: "Metal", color: "Grey", direction: "North-East", keywords: ["Spirituality", "Detach", "Research", "Occult", "Intuition"] },
  8: { planet: "Saturn", element: "Earth", color: "Black/Blue", direction: "West", keywords: ["Hard Work", "Justice", "Delay", "Property", "Law"] },
  9: { planet: "Mars", element: "Fire", color: "Red", direction: "South", keywords: ["Action", "Energy", "Aggression", "Sports", "Courage"] },
};

// Loshu Grid Standard Positions
// 4 9 2
// 3 5 7
// 8 1 6
const loshuPositions = [
  { num: 4, row: 0, col: 0 }, { num: 9, row: 0, col: 1 }, { num: 2, row: 0, col: 2 },
  { num: 3, row: 1, col: 0 }, { num: 5, row: 1, col: 1 }, { num: 7, row: 1, col: 2 },
  { num: 8, row: 2, col: 0 }, { num: 1, row: 2, col: 1 }, { num: 6, row: 2, col: 2 },
];

// Compatibility (Simplified Vedic Friends)
const friendshipTable = {
  1: { friends: [1, 2, 3, 5, 9], neutral: [4, 7], enemies: [6, 8] },
  2: { friends: [1, 2, 3, 5], neutral: [7, 8, 9], enemies: [4, 6] },
  3: { friends: [1, 2, 3, 5, 7], neutral: [4, 8, 9], enemies: [6] },
  4: { friends: [1, 5, 6, 7], neutral: [3, 8, 9], enemies: [2] },
  5: { friends: [1, 2, 3, 5, 6], neutral: [7, 8, 9], enemies: [4] },
  6: { friends: [1, 5, 6, 7], neutral: [2, 4, 8, 9], enemies: [3] },
  7: { friends: [1, 3, 4, 5, 6], neutral: [8, 9], enemies: [2] },
  8: { friends: [3, 5, 6, 7], neutral: [2, 4, 9], enemies: [1] },
  9: { friends: [1, 2, 3, 5], neutral: [4, 6, 7, 8], enemies: [] },
};

// Specific Pair Meanings Library (Expanded)
const specificPairMeanings = {
  '11': "Strong leadership, but potential for ego clashes. High status.",
  '12': "Success with some delays. Creative but mentally fluctuating.",
  '13': "Excellent for education, consulting, and management roles.",
  '14': "Financial ups and downs. Risk-taking behavior.",
  '15': "Great for business, communication, and government favors.",
  '16': "Relationship struggles, but good for luxury and arts.",
  '17': "Leadership with a spiritual or technical touch. Government jobs.",
  '18': "Struggle in early life, father-son conflict, health issues.",
  '19': "High energy, technical skills, dominance, and success.",
  '21': "Good intuition, creative, but needs emotional balance.",
  '22': "Over-sensitive, emotional, moody, but very intuitive.",
  '23': "Good healer, occult knowledge, and medical profession.",
  '24': "Creative but prone to depression or overthinking.",
  '25': "Good for marketing and speaking, but mental instability.",
  '26': "Creative arts, good for females, but emotional spending.",
  '27': "Spiritual inclination, good for occult, but relationship drift.",
  '28': "Chronic health issues, stress, or 'Moon-Saturn' poison yoga.",
  '29': "Aggressive mind, irritation, not good for marriage.",
  '31': "Respectful, good advisor, leadership in education.",
  '32': "Good for healing, teaching, and counseling.",
  '33': "Highly knowledgeable, spiritual guru, abundance.",
  '34': "Hard work leads to success, knowledgeable but strict.",
  '35': "Excellent for communication business and teaching.",
  '36': "Argumentative (Jupiter vs Venus), but wealthy.",
  '37': "Spiritual growth, overseas connections, education.",
  '38': "Legal profession, justice, property dealings.",
  '39': "Technical expert, surgeon, or engineer.",
  '41': "Political success, sudden gains, but defame risk.",
  '42': "Mental confusion, foreign lands, creative.",
  '43': "Technical knowledge, good for planners and architects.",
  '44': "Cunning, manipulative, secretive, good for spies.",
  '45': "Sharp intellect, mass communication, manipulative.",
  '46': "Media, cinema, luxury, but scandalous.",
  '47': "Deep research, technical intuition, programmer.",
  '48': "Legal issues, hurdles, but good for lawyers.",
  '49': "High tech, accidents, surgeries, or police work.",
  '51': "Business with government, articulate, successful.",
  '52': "Accounting, writing, banking, emotional decisions.",
  '53': "Intelligent, good administrator, balanced life.",
  '54': "Sharp speech, sudden travel, business tactics.",
  '55': "Strong business acumen, travel, quick money.",
  '56': "Luxury business, media, popularity.",
  '57': "Banking, finance, occult studies.",
  '58': "Property business, slow growth in trade.",
  '59': "Technical business, hardware, impatient speech.",
  '61': "Luxury lover, government contracts, relationship issues.",
  '62': "Artistic, creative, women-oriented business.",
  '63': "Wealthy but dissatisfaction in relationships.",
  '64': "Unconventional luxury, foreign goods, sudden expenses.",
  '65': "Good for trade, networking, and social life.",
  '66': "Extreme luxury, creative arts, branding, glamour.",
  '67': "Spiritual love, detached from material luxury.",
  '68': "Luxury delays, bladder/kidney issues.",
  '69': "Passionate, potential for extra-marital affairs.",
  '71': "Spiritual leader, government research, solitude.",
  '72': "Overthinking, psychic ability, writer.",
  '73': "Spiritual teacher, occultist, researcher.",
  '74': "Technical skills, foreign settlement.",
  '75': "Technical business, healing, accountancy.",
  '76': "Donation, charity, but relationship detachment.",
  '77': "Deep thinker, spiritual, analytical, loner.",
  '78': "History, archaeology, chronic health issues.",
  '79': "Technical breakthrough, spiritual warrior.",
  '81': "Father-son conflict, government penalties, ego hurt.",
  '82': "Depression, eye trouble, isolation.",
  '83': "Justice, law, religious organization.",
  '84': "Legal traps, conspiracy, sudden downfall.",
  '85': "Real estate business, slow but steady growth.",
  '86': "Delay in marriage, prostate issues.",
  '87': "Research in old topics, occult, detachment.",
  '88': "Extreme delays, hard labor, karma repayment.",
  '89': "Technical mastery, machinery, accidents.",
  '91': "Leadership, army, police, government success.",
  '92': "Aggressive emotions, blood pressure.",
  '93': "Strategic planning, commander.",
  '94': "Police, technical, risk-taker, conspiracy.",
  '95': "Technical business, debate, argument.",
  '96': "Passionate, luxury, scandals.",
  '97': "Technical research, engineering.",
  '98': "Land disputes, blood disorders, struggle.",
  '99': "High aggression, commander, sports, dominance.",
  '00': "Void: Creates a vacuum or amplifies the adjacent number.",
  '10': "Rise and fall in status. Sun with zero.",
  '20': "Emotional emptiness or high intuition.",
  '30': "Knowledge used for selfless reasons.",
  '40': "Sudden confusion or sudden clarity.",
  '50': "Communication gap or freedom.",
  '60': "Loss of luxury or spiritual luxury.",
  '70': "Deep detachment or spiritual peak.",
  '80': "Hardships without results or monk-like life.",
  '90': "Wasted energy or focused potential."
};

const getPairMeaning = (a, b) => {
  const key = `${a}${b}`;
  if (specificPairMeanings[key]) {
    return specificPairMeanings[key];
  }
  // Fallback for undocumented pairs (dynamic generation)
  const planetA = planets[parseInt(a)];
  const planetB = planets[parseInt(b)];
  return `Combination of ${planetA.planet} and ${planetB.planet}. Blends ${planetA.keywords[0]} with ${planetB.keywords[0]}.`;
};

const missingNumberEffects = {
  1: "Difficulty in expressing authority or self. Lack of confidence/ego.",
  2: "Lack of sensitivity, intuition, or patience. Relationship friction.",
  3: "Lack of creative imagination or confusion in direction/wisdom.",
  4: "Lack of discipline, order, and difficulty accumulating wealth.",
  5: "Difficulty in setting goals, lack of drive, or communication gaps.",
  6: "Lack of domestic happiness, luxury, or support from family.",
  7: "Disorganized, lack of spiritual depth, or difficulty analyzing.",
  8: "Lack of financial management or motivation. Struggle with details.",
  9: "Lack of ambition, energy, or humanitarian concern."
};

export default function MobileNumerologyApp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    mobile: ''
  });
  const [report, setReport] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Generate Report
  const generateReport = () => {
    if (!formData.name || !formData.dob || !formData.mobile) {
      alert("Please fill in all fields.");
      return;
    }

    setIsAnimating(true);

    setTimeout(() => {
      // 1. Core Calculations
      const dobDate = new Date(formData.dob);
      const day = dobDate.getDate(); // gets day as integer (1-31)
      const driver = reduceToSingleDigit(day);
      const dobStr = formData.dob.replaceAll('-', '');
      const conductor = reduceToSingleDigit(calculateCompoundSum(dobStr));

      // 2. Mobile Analysis
      const cleanMobile = formData.mobile.replace(/\D/g, '');
      const mobileCompound = calculateCompoundSum(cleanMobile);
      const mobileTotal = reduceToSingleDigit(mobileCompound);

      // 3. Grid Generation
      const dobDigits = dobStr.split('').map(d => parseInt(d)).filter(d => !isNaN(d) && d !== 0);

      // --- LOGIC MODIFICATION ---
      // Rule 1: Add Mulank (Driver) ONLY if birth date is double digit (> 9)
      // Because if it is single digit (1-9), that number is already in dobDigits
      if (day > 9 && driver !== 0) {
        dobDigits.push(driver);
      }

      // Rule 2: Always add Bhagyank (Conductor)
      if (conductor !== 0) {
        dobDigits.push(conductor);
      }
      // ---------------------------

      const gridCounts = {};
      dobDigits.forEach(d => {
        gridCounts[d] = (gridCounts[d] || 0) + 1;
      });

      // 4. Missing Numbers
      const missingNumbers = [];
      [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n => {
        if (!gridCounts[n]) missingNumbers.push({ num: n, effect: missingNumberEffects[n] });
      });

      // 5. Repetitive Mobile Numbers
      const mobileDigitCounts = {};
      cleanMobile.split('').forEach(d => {
        mobileDigitCounts[d] = (mobileDigitCounts[d] || 0) + 1;
      });
      const repetitions = Object.entries(mobileDigitCounts)
        .filter(([digit, count]) => count >= 3)
        .map(([digit, count]) => ({
          digit,
          count,
          meaning: `Excess energy of ${planets[digit].planet}. Can cause ${planets[digit].keywords[0]} imbalance.`
        }));

      // 6. Compatibility Analysis
      const driverRel = friendshipTable[driver];
      const conductorRel = friendshipTable[conductor];
      
      let score = 0;
      let status = "Neutral";
      let statusColor = "text-yellow-600";

      const isFriendDriver = driverRel.friends.includes(mobileTotal);
      const isEnemyDriver = driverRel.enemies.includes(mobileTotal);
      const isFriendConductor = conductorRel.friends.includes(mobileTotal);
      const isEnemyConductor = conductorRel.enemies.includes(mobileTotal);

      if (isEnemyDriver || isEnemyConductor) {
        status = "Challenging (Avoid)";
        statusColor = "text-red-600";
        score = 30;
      } else if (isFriendDriver && isFriendConductor) {
        status = "Excellent (Lucky)";
        statusColor = "text-green-600";
        score = 95;
      } else if (isFriendDriver || isFriendConductor) {
        status = "Good";
        statusColor = "text-blue-600";
        score = 75;
      } else {
        score = 50;
      }

      // 7. Full Pair Analysis (Every adjacent pair)
      const allPairs = [];
      for (let i = 0; i < cleanMobile.length - 1; i++) {
        const a = cleanMobile[i];
        const b = cleanMobile[i+1];
        const pair = `${a}${b}`;
        allPairs.push({ 
          pair, 
          meaning: getPairMeaning(a, b),
          index: i 
        });
      }

      // 8. Remedies
      const mobilePlanet = planets[mobileTotal];
      const remedy = {
        direction: mobilePlanet.direction,
        wallpaper: `Use images related to Number ${mobileTotal} (${mobilePlanet.planet}) or element ${mobilePlanet.element}. Recommended: ${mobilePlanet.color} themes.`,
        tip: `Charge your phone in the ${mobilePlanet.direction} direction of your house/room.`
      };

      setReport({
        driver,
        conductor,
        mobileCompound,
        mobileTotal,
        gridCounts,
        missingNumbers,
        repetitions,
        status,
        statusColor,
        score,
        allPairs,
        remedy,
        mobilePlanet
      });
      
      setStep(2);
      setIsAnimating(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const reset = () => {
    setStep(1);
    setReport(null);
    setFormData({ name: '', dob: '', mobile: '' });
  };

  // --- Render Helpers ---

  const renderGrid = () => {
    if (!report) return null;
    return (
      <div className="grid grid-cols-3 gap-1 border-4 border-amber-700 bg-amber-50 w-full max-w-[200px] h-48 shadow-inner mx-auto">
        {loshuPositions.map((pos) => {
          const count = report.gridCounts[pos.num] || 0;
          return (
            <div key={pos.num} className="flex items-center justify-center border border-amber-200 bg-white relative">
              {count > 0 ? (
                <div className="text-center">
                  <span className="text-xl font-bold text-amber-900 block leading-none">
                    {Array(count).fill(pos.num).join('')}
                  </span>
                </div>
              ) : (
                <span className="text-gray-200 text-xs">{pos.num}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 print:bg-white print:text-black">
      
      {/* Navigation */}
      <nav className="bg-indigo-900 text-white p-4 shadow-lg print:hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={24} />
            <h1 className="text-xl font-bold tracking-wide">Divine Aura</h1>
          </div>
          {step === 2 && (
            <button onClick={reset} className="text-sm bg-indigo-800 hover:bg-indigo-700 px-3 py-1 rounded transition">
              New Check
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Step 1: Input Form */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 max-w-lg mx-auto border border-indigo-50 mt-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Detailed Mobile Analysis</h2>
              <p className="text-slate-500">Comprehensive Vedic Numerology Report</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <User size={16} /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g. Rahul Kumar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar size={16} /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Smartphone size={16} /> Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <button
                onClick={generateReport}
                disabled={isAnimating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-1px] transition flex justify-center items-center gap-2"
              >
                {isAnimating ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} /> Generating Full Report...
                  </>
                ) : (
                  <>
                    Generate Detailed Report <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Full Report */}
        {step === 2 && report && (
          <div className="animate-fade-in print:animate-none">
            
            {/* Toolbar */}
            <div className="flex justify-end mb-6 print:hidden gap-3">
               <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                <RefreshCw size={16} /> Check Another
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 shadow-md transition">
                <Printer size={16} /> Print Report (PDF)
              </button>
            </div>

            {/* A4 Report Wrapper */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none print:border-none print:w-full max-w-[210mm] mx-auto min-h-[297mm]">
              
              {/* Report Header */}
              <div className="bg-indigo-900 text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-black print:p-0 print:mb-6">
                <div className="flex justify-between items-start">
                  
                  {/* Brand Section with Image */}
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://ik.imagekit.io/alj2mkmic/WhatsApp%20Image%202025-12-11%20at%2010.45.10%20PM.jpeg" 
                      alt="Divine Aura" 
                      className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-sm print:border-gray-300"
                      onError={(e) => {e.target.style.display = 'none'}}
                    />
                    <div>
                      <h2 className="text-3xl font-bold mb-1 uppercase tracking-wider">Divine Aura</h2>
                      <p className="opacity-80 text-sm print:text-gray-600">Comprehensive Mobile & Birth Chart Analysis</p>
                    </div>
                  </div>

                  <div className="text-right mt-2">
                    <p className="font-bold text-xl">{formData.name}</p>
                    <div className="text-indigo-200 text-sm print:text-gray-600 mt-1">
                      <p>DOB: {formData.dob}</p>
                      <p>Mobile: {formData.mobile}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 print:p-0">
                
                {/* Section 1: Core Numbers & Compatibility */}
                <section className="break-inside-avoid">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                    <BookOpen className="text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">1. Core Strength Analysis</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded border border-slate-200">
                        <span className="text-xs uppercase text-slate-500 font-bold">Driver (Mulank)</span>
                        <div className="text-3xl font-bold text-indigo-900">{report.driver}</div>
                        <div className="text-xs text-slate-400">{planets[report.driver].planet}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded border border-slate-200">
                        <span className="text-xs uppercase text-slate-500 font-bold">Conductor (Bhagyank)</span>
                        <div className="text-3xl font-bold text-purple-900">{report.conductor}</div>
                        <div className="text-xs text-slate-400">{planets[report.conductor].planet}</div>
                      </div>
                      <div className="col-span-2 bg-yellow-50 p-4 rounded border border-yellow-200">
                        <span className="text-xs uppercase text-yellow-800 font-bold">Mobile Total</span>
                        <div className="flex justify-between items-end">
                          <div className="text-4xl font-bold text-yellow-700">{report.mobileTotal}</div>
                          <div className="text-right">
                             <span className="text-sm text-yellow-800 font-semibold">Compound: {report.mobileCompound}</span>
                             <div className="text-xs text-yellow-600">{planets[report.mobileTotal].planet} Energy</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-4">
                       <div className={`p-5 rounded-lg border-l-4 ${report.score > 70 ? 'bg-green-50 border-green-500' : report.score < 40 ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                          <h4 className="font-bold text-gray-700 text-sm uppercase mb-1">Compatibility Verdict</h4>
                          <p className={`text-2xl font-bold ${report.statusColor} mb-1`}>{report.status}</p>
                          <p className="text-sm text-gray-600 leading-snug">
                            Your mobile number total ({report.mobileTotal}) creates a <strong>{report.status.toLowerCase()}</strong> relationship with your birth numbers ({report.driver} & {report.conductor}).
                          </p>
                       </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Vedic Grid & Missing Numbers */}
                <section className="break-inside-avoid">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                    <Calendar className="text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">2. Vedic Birth Chart (Loshu Grid)</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col items-center justify-start pt-2">
                      {renderGrid()}
                      <p className="text-xs text-center text-gray-400 mt-2">Numbers present in DOB + D/C</p>
                    </div>

                    <div className="w-full md:w-2/3">
                      <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase">Missing Numbers & Impact</h4>
                      {report.missingNumbers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {report.missingNumbers.map((m) => (
                            <div key={m.num} className="flex items-start gap-3 p-2 border-b border-gray-100">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                                {m.num}
                              </span>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-800">Missing {planets[m.num].planet}:</span> {m.effect}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 text-green-700 rounded text-sm">
                          Excellent! You have a complete chart (Golden Plane).
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section 3: Repetitive Numbers Analysis */}
                {report.repetitions.length > 0 && (
                  <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                      <AlertCircle className="text-orange-500" />
                      <h3 className="text-xl font-bold text-gray-800">3. Repetitive Number Analysis</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.repetitions.map((rep, idx) => (
                        <div key={idx} className="bg-orange-50 p-3 rounded border border-orange-100 text-sm">
                          <p className="font-bold text-orange-800 mb-1">
                            Number {rep.digit} appears {rep.count} times
                          </p>
                          <p className="text-orange-700">{rep.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 4: Detailed Pair Analysis */}
                <section className="break-inside-avoid">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                    <Layers className="text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">4. Comprehensive Pair Analysis</h3>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Scanning every adjacent pair in your mobile number ({formData.mobile}) for hidden influences.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.allPairs.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200 break-inside-avoid">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-mono font-bold text-indigo-700 bg-white px-3 py-1 rounded border border-indigo-100 shadow-sm">
                            {item.pair}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 font-semibold mb-0.5">Position {idx + 1}</p>
                          <p className="text-sm text-slate-700 leading-snug">{item.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 5: Remedies */}
                <section className="break-inside-avoid">
                   <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                      <Compass className="text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-800">5. Personal Remedies</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm print:shadow-none print:border-gray-300">
                          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <Compass size={16} /> Charging Direction
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{report.remedy.tip}</p>
                          <div className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded inline-block">
                            Face {report.remedy.direction}
                          </div>
                      </div>

                      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm print:shadow-none print:border-gray-300">
                          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <ImageIcon size={16} /> Lucky Wallpaper
                          </h4>
                          <p className="text-sm text-gray-600">{report.remedy.wallpaper}</p>
                      </div>
                   </div>
                </section>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">End of Report</p>
                  <p className="text-xs text-gray-300 mt-1">© Divine Aura • Generated on {new Date().toLocaleDateString()}</p>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          /* Reset root styles to ensure full page printing in preview environments */
          html, body, #root, main {
            height: auto !important;
            overflow: visible !important;
            position: static !important;
          }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            background: white !important;
            color: black !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:w-full { width: 100% !important; max-width: none !important; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}