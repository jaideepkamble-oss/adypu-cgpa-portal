import { useState, useEffect, useRef } from "react";

const COLORS = {
  beige: "#F5F0E6",
  beigeD: "#EDE7D6",
  blue: "#87CEEB",
  blueD: "#5BABCE",
  cyan: "#00BCD4",
  cyanD: "#0097A7",
  white: "#FFFFFF",
  text: "#1A1A2E",
  textMid: "#4A5568",
  textLight: "#718096",
  success: "#38A169",
  warning: "#D97706",
  danger: "#E53E3E",
  card: "#FFFFFF",
};

const STYLES = {
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  page: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: COLORS.beige, minHeight: "100vh" },
  navContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", background: COLORS.white, boxShadow: "0 1px 8px rgba(0,188,212,0.08)" },
  container: { padding: "24px 28px", maxWidth: 1100, margin: "0 auto" },
  card: { background: COLORS.white, borderRadius: 16, padding: "22px 24px", marginBottom: 22, border: `1.5px solid ${COLORS.beigeD}` },
  grid2Col: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 },
  gridAutoFit: (minWidth = "180px") => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`, gap: 14 }),
};

const GRADE_MAP = [
  { min: 108, max: 120, grade: "A+", gp: 10 },
  { min: 96, max: 107, grade: "A", gp: 9 },
  { min: 84, max: 95, grade: "B+", gp: 8 },
  { min: 72, max: 83, grade: "B", gp: 7 },
  { min: 60, max: 71, grade: "C+", gp: 6 },
  { min: 48, max: 59, grade: "C", gp: 5 },
  { min: 36, max: 47, grade: "D", gp: 4 },
  { min: 0, max: 35, grade: "F", gp: 0 },
];

const CURRICULUM = {
  "Computer Science": {
    7: [
      { name: "Artificial Intelligence", credits: 4 },
      { name: "Cloud Computing", credits: 3 },
      { name: "Big Data Analytics", credits: 3 },
      { name: "Elective I", credits: 4 },
      { name: "Project Work", credits: 4 },
    ],
    8: [
      { name: "Machine Learning", credits: 4 },
      { name: "Cybersecurity", credits: 3 },
      { name: "Elective II", credits: 4 },
      { name: "Major Project", credits: 6 },
    ],
    1: [
      { name: "Engineering Mathematics I", credits: 4 },
      { name: "Physics", credits: 3 },
      { name: "Programming Fundamentals", credits: 4 },
      { name: "Engineering Graphics", credits: 2 },
      { name: "Communication Skills", credits: 3 },
    ],
    2: [
      { name: "Engineering Mathematics II", credits: 4 },
      { name: "Data Structures", credits: 4 },
      { name: "Digital Logic", credits: 3 },
      { name: "OOP with Java", credits: 4 },
      { name: "Technical Communication", credits: 3 },
    ],
    3: [
      { name: "Discrete Mathematics", credits: 4 },
      { name: "Computer Organization", credits: 3 },
      { name: "Database Management", credits: 4 },
      { name: "Operating Systems", credits: 4 },
      { name: "Web Technologies", credits: 3 },
    ],
    4: [
      { name: "Theory of Computation", credits: 4 },
      { name: "Computer Networks", credits: 4 },
      { name: "Software Engineering", credits: 3 },
      { name: "Algorithm Analysis", credits: 4 },
      { name: "Mini Project", credits: 3 },
    ],
    5: [
      { name: "Compiler Design", credits: 4 },
      { name: "Information Security", credits: 3 },
      { name: "Mobile Computing", credits: 3 },
      { name: "Elective I", credits: 4 },
      { name: "Industrial Training", credits: 2 },
    ],
    6: [
      { name: "Distributed Systems", credits: 4 },
      { name: "Data Mining", credits: 3 },
      { name: "IoT Systems", credits: 3 },
      { name: "Elective II", credits: 4 },
      { name: "Seminar", credits: 2 },
    ],
  },
};

const getGrade = (total) => {
  const entry = GRADE_MAP.find((g) => total >= g.min && total <= g.max);
  return entry || { grade: "F", gp: 0 };
};

const calcSGPA = (subjects) => {
  let totalCP = 0, totalC = 0;
  subjects.forEach((s) => {
    const total = (s.ut || 0) + (s.mid || 0) + (s.end || 0);
    const { gp } = getGrade(total);
    totalCP += s.credits * gp;
    totalC += s.credits;
  });
  return totalC > 0 ? (totalCP / totalC).toFixed(2) : "0.00";
};

const calcCGPA = (semesters) => {
  let num = 0, den = 0;
  semesters.forEach((s) => {
    if (s.sgpa && s.credits) {
      num += parseFloat(s.sgpa) * parseFloat(s.credits);
      den += parseFloat(s.credits);
    }
  });
  return den > 0 ? (num / den).toFixed(2) : "0.00";
};

const BarChart = ({ data, label, color }) => {
  const max = Math.max(...data.map((d) => d.value), 10);
  return (
    <div style={{ width: "100%" }}>
      {data.map((d, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.textMid, marginBottom: 4 }}>
            <span>{d.label}</span>
            <span style={{ fontWeight: 600, color: COLORS.cyan }}>{d.value}</span>
          </div>
          <div style={{ background: COLORS.beigeD, borderRadius: 6, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: `linear-gradient(90deg, ${color || COLORS.cyan}, ${COLORS.blue})`, height: "100%", borderRadius: 6, transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, icon, sub, color }) => (
  <div style={{ background: COLORS.card, borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,188,212,0.08)", border: `1.5px solid ${COLORS.beigeD}`, minWidth: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: color || COLORS.cyanD }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>{sub}</div>}
  </div>
);

const Input = ({ label, value, onChange, type = "number", min, max, placeholder, style }) => (
  <div style={{ marginBottom: 12, ...style }}>
    {label && <label style={{ display: "block", fontSize: 13, color: COLORS.textMid, marginBottom: 5, fontWeight: 500 }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min} max={max}
      placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: COLORS.beige, color: COLORS.text, outline: "none", boxSizing: "border-box" }}
    />
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: active ? COLORS.cyan : "transparent", color: active ? "#fff" : COLORS.textMid, fontWeight: active ? 600 : 400, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
    {label}
  </button>
);

// ─── AI Chat Component ──────────────────────────────────────────────────────
const AIChat = ({ studentName, sgpa, cgpa }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${studentName || "there"}! 👋 I'm your AI Academic Assistant. Ask me anything about improving your CGPA, study strategies, or semester planning!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const context = `You are an AI academic advisor for ADYPU (Ajeenkya DY Patil University). The student's name is ${studentName || "Student"}, current SGPA is ${sgpa || "N/A"}, and CGPA is ${cgpa || "N/A"}. Give personalized, practical, encouraging academic advice. Keep responses concise (2-4 sentences max unless a list is needed). Use a friendly, supportive tone.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: [
            ...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "I couldn't generate a response. Please try again.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 420, background: COLORS.white, borderRadius: 16, border: `1.5px solid ${COLORS.beigeD}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.blueD})`, color: "#fff" }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>🤖 AI Academic Assistant</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>Powered by Claude · Ask anything about your studies</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? COLORS.cyan : COLORS.beige,
              color: m.role === "user" ? "#fff" : COLORS.text,
              fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap"
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ background: COLORS.beige, borderRadius: "14px 14px 14px 4px", padding: "10px 14px", fontSize: 14, color: COLORS.textMid }}>
              <span>Thinking</span><span style={{ animation: "pulse 1s infinite" }}>...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${COLORS.beigeD}`, display: "flex", gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about CGPA improvement, study tips..."
          style={{ flex: 1, padding: "9px 13px", borderRadius: 10, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: COLORS.beige, color: COLORS.text, outline: "none" }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "9px 18px", borderRadius: 10, background: COLORS.cyan, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
};

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [profile, setProfile] = useState({ name: "", id: "", branch: "Computer Science", year: "Third Year", semester: 7 });
  const [profileSaved, setProfileSaved] = useState(false);
  const [prevSems, setPrevSems] = useState([
    { sem: 1, sgpa: "", credits: 22 }, { sem: 2, sgpa: "", credits: 24 },
    { sem: 3, sgpa: "", credits: 22 }, { sem: 4, sgpa: "", credits: 24 },
    { sem: 5, sgpa: "", credits: 20 }, { sem: 6, sgpa: "", credits: 22 },
  ]);
  const [currentSubjects, setCurrentSubjects] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [targetCGPA, setTargetCGPA] = useState("8.5");
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const sem = parseInt(profile.semester);
    const branch = profile.branch;
    const subjects = (CURRICULUM[branch] && CURRICULUM[branch][sem]) || CURRICULUM["Computer Science"][7];
    setCurrentSubjects(subjects.map(s => ({ ...s, ut: "", mid: "", end: "" })));
  }, [profile.semester, profile.branch]);

  const filledPrevSems = prevSems.filter(s => s.sgpa && s.credits);
  const cgpa = calcCGPA(filledPrevSems);
  const currentSGPA = currentSubjects.length > 0 && currentSubjects.some(s => s.ut || s.mid || s.end) ? calcSGPA(currentSubjects) : "—";
  const totalCredits = filledPrevSems.reduce((a, s) => a + parseFloat(s.credits || 0), 0);

  const predictMinMarks = () => {
    const target = parseFloat(targetCGPA);
    if (!target || target > 10) return [];
    const currentDen = filledPrevSems.reduce((a, s) => a + parseFloat(s.credits || 0), 0);
    const currentNum = filledPrevSems.reduce((a, s) => a + parseFloat(s.sgpa || 0) * parseFloat(s.credits || 0), 0);
    const semCredits = currentSubjects.reduce((a, s) => a + s.credits, 0);
    const totalDen = currentDen + semCredits;
    const reqNum = target * totalDen - currentNum;
    const reqSGPA = Math.min(10, reqNum / semCredits);

    return currentSubjects.map(s => {
      let minMarks = 0;
      for (let m = 36; m <= 120; m++) {
        const { gp } = getGrade(m);
        if (gp >= reqSGPA) { minMarks = m; break; }
      }
      const pct = Math.round((minMarks / 120) * 100);
      return { name: s.name, minMarks, pct, credits: s.credits };
    });
  };

  const predictions = predictMinMarks();

  const semChartData = prevSems.filter(s => s.sgpa).map(s => ({ label: `Sem ${s.sem}`, value: parseFloat(s.sgpa) }));

  const subjectGrades = currentSubjects.map(s => {
    const total = (parseFloat(s.ut) || 0) + (parseFloat(s.mid) || 0) + (parseFloat(s.end) || 0);
    const { grade, gp } = getGrade(total);
    return { ...s, total, grade, gp };
  });

  // ── LANDING ──
  if (page === "landing") return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: COLORS.beige, minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", background: COLORS.white, boxShadow: "0 1px 8px rgba(0,188,212,0.08)" }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.cyanD, letterSpacing: -0.5 }}>🎓 ADYPU Portal</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setPage("login")} style={{ padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${COLORS.cyan}`, background: "transparent", color: COLORS.cyanD, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Login</button>
          <button onClick={() => setPage("register")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: COLORS.cyan, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Register</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: "80px 40px 60px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: COLORS.blue + "33", color: COLORS.cyanD, fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 20, marginBottom: 20 }}>Ajeenkya DY Patil University</div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: COLORS.text, margin: "0 0 18px", lineHeight: 1.15 }}>
          Calculate, Predict &<br />
          <span style={{ color: COLORS.cyan }}>Improve Your CGPA</span>
        </h1>
        <p style={{ fontSize: 17, color: COLORS.textMid, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Track your academic performance, predict future CGPA, and plan your semester goals with AI-powered guidance.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setPage("register")} style={{ padding: "13px 32px", borderRadius: 10, background: COLORS.cyan, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: `0 4px 16px ${COLORS.cyan}44` }}>Get Started Free</button>
          <button onClick={() => { setProfileSaved(true); setPage("app"); }} style={{ padding: "13px 32px", borderRadius: 10, background: "transparent", color: COLORS.cyanD, fontWeight: 700, fontSize: 15, border: `2px solid ${COLORS.cyan}`, cursor: "pointer" }}>Try Demo →</button>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "40px 40px 60px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: COLORS.text, marginBottom: 32 }}>Everything You Need to Excel</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { icon: "📊", title: "SGPA Calculator", desc: "Enter marks per subject and get instant SGPA" },
            { icon: "📈", title: "CGPA Tracker", desc: "Track your CGPA across all semesters" },
            { icon: "🎯", title: "CGPA Predictor", desc: "Know minimum marks to hit your target" },
            { icon: "🤖", title: "AI Assistant", desc: "Personalized academic roadmap from Claude AI" },
            { icon: "📋", title: "Analytics", desc: "Visual charts of your academic journey" },
            { icon: "📄", title: "PDF Reports", desc: "Download your complete academic report" },
          ].map((f, i) => (
            <div key={i} style={{ background: COLORS.white, borderRadius: 14, padding: "20px 18px", border: `1.5px solid ${COLORS.beigeD}`, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── LOGIN / REGISTER ──
  if (page === "login" || page === "register") {
    const isLogin = page === "login";
    return (
      <div style={{ minHeight: "100vh", background: COLORS.beige, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ background: COLORS.white, borderRadius: 20, padding: "40px 36px", width: 380, boxShadow: "0 8px 32px rgba(0,188,212,0.12)" }}>
          <button onClick={() => setPage("landing")} style={{ fontSize: 13, color: COLORS.textLight, background: "none", border: "none", cursor: "pointer", marginBottom: 20 }}>← Back</button>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>{isLogin ? "Welcome back" : "Create account"}</h2>
          <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 24 }}>{isLogin ? "Login to your ADYPU Portal" : "Join ADYPU Academic Portal"}</p>

          <Input label="Email Address" value="" onChange={() => {}} type="email" placeholder="student@adypu.edu.in" />
          <Input label="Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
          {!isLogin && <Input label="Confirm Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />}

          <button onClick={() => setPage("profile-setup")} style={{ width: "100%", padding: "12px", borderRadius: 10, background: COLORS.cyan, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", marginTop: 8, marginBottom: 14 }}>
            {isLogin ? "Login" : "Create Account"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: COLORS.textLight }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: COLORS.beigeD }} /> or <div style={{ flex: 1, height: 1, background: COLORS.beigeD }} />
            </span>
            <button onClick={() => setPage("profile-setup")} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1.5px solid ${COLORS.beigeD}`, background: COLORS.beige, color: COLORS.text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              🔵 Continue with Google
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: COLORS.textLight, marginTop: 18 }}>
            {isLogin ? "New here? " : "Already have an account? "}
            <button onClick={() => setPage(isLogin ? "register" : "login")} style={{ color: COLORS.cyan, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── PROFILE SETUP ──
  if (page === "profile-setup") return (
    <div style={{ minHeight: "100vh", background: COLORS.beige, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20 }}>
      <div style={{ background: COLORS.white, borderRadius: 20, padding: "40px 36px", width: 420, boxShadow: "0 8px 32px rgba(0,188,212,0.12)" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>Complete Your Profile</h2>
        <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 26 }}>Tell us about your academic journey</p>

        <Input label="Full Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} type="text" placeholder="e.g. Rahul Sharma" />
        <Input label="Student ID / PRN" value={profile.id} onChange={v => setProfile(p => ({ ...p, id: v }))} type="text" placeholder="e.g. 21BCSAI0001" />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.textMid, marginBottom: 5, fontWeight: 500 }}>Branch</label>
          <select value={profile.branch} onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: COLORS.beige, color: COLORS.text }}>
            {["Computer Science", "Information Technology", "Mechanical", "Civil", "Electronics"].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.textMid, marginBottom: 5, fontWeight: 500 }}>Academic Year</label>
          <select value={profile.year} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: COLORS.beige, color: COLORS.text }}>
            {["First Year", "Second Year", "Third Year", "Fourth Year"].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.textMid, marginBottom: 5, fontWeight: 500 }}>Current Semester</label>
          <select value={profile.semester} onChange={e => setProfile(p => ({ ...p, semester: parseInt(e.target.value) }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: COLORS.beige, color: COLORS.text }}>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>

        <button onClick={() => { setProfileSaved(true); setPage("app"); }} style={{ width: "100%", padding: "12px", borderRadius: 10, background: COLORS.cyan, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
          Save & Go to Dashboard
        </button>
      </div>
    </div>
  );

  // ── MAIN APP ──
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "marks", label: "Enter Marks" },
    { id: "predictor", label: "CGPA Predictor" },
    { id: "analytics", label: "Analytics" },
    { id: "ai", label: "AI Assistant" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: COLORS.beige, minHeight: "100vh" }}>
      {/* Top Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", background: COLORS.white, boxShadow: "0 1px 8px rgba(0,188,212,0.08)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: COLORS.cyanD }}>🎓 ADYPU Portal</div>
        <div style={{ display: "flex", gap: 4, background: COLORS.beige, padding: "4px 6px", borderRadius: 12 }}>
          {tabs.map(t => <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{profile.name || "Student"}</div>
            <div style={{ fontSize: 12, color: COLORS.textLight }}>Sem {profile.semester} · {profile.branch}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.cyan, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
            {(profile.name || "S").charAt(0).toUpperCase()}
          </div>
          <button onClick={() => setPage("landing")} style={{ fontSize: 12, color: COLORS.textLight, background: "none", border: `1px solid ${COLORS.beigeD}`, borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>Welcome back, {profile.name || "Student"} 👋</h2>
            <p style={{ color: COLORS.textLight, marginBottom: 24, fontSize: 14 }}>Semester {profile.semester} · {profile.branch} · {profile.year}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
              <StatCard label="Current CGPA" value={cgpa} icon="🏆" sub={`Based on ${filledPrevSems.length} semesters`} color={parseFloat(cgpa) >= 8 ? COLORS.success : parseFloat(cgpa) >= 6 ? COLORS.warning : COLORS.danger} />
              <StatCard label="Current SGPA" value={currentSGPA} icon="📊" sub={`Semester ${profile.semester}`} />
              <StatCard label="Credits Earned" value={totalCredits} icon="✅" sub="Total accumulated" color={COLORS.blueD} />
              <StatCard label="Semester" value={`Sem ${profile.semester}`} icon="📅" sub={profile.year} color={COLORS.cyanD} />
            </div>

            {/* Previous Semesters Entry */}
            <div style={{ background: COLORS.white, borderRadius: 16, padding: "22px 24px", marginBottom: 22, border: `1.5px solid ${COLORS.beigeD}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>📚 Previous Semester Performance</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {prevSems.filter(s => s.sem < profile.semester).map((s, i) => (
                  <div key={i} style={{ background: COLORS.beige, borderRadius: 10, padding: "14px 16px", border: `1px solid ${COLORS.beigeD}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text, marginBottom: 10 }}>Semester {s.sem}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 12, color: COLORS.textLight, display: "block", marginBottom: 4 }}>SGPA (0–10)</label>
                        <input type="number" value={s.sgpa} min="0" max="10" step="0.01"
                          onChange={e => setPrevSems(prev => prev.map((p, j) => j === i ? { ...p, sgpa: e.target.value } : p))}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: "#fff", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 12, color: COLORS.textLight, display: "block", marginBottom: 4 }}>Credits</label>
                        <input type="number" value={s.credits} min="0" max="30"
                          onChange={e => setPrevSems(prev => prev.map((p, j) => j === i ? { ...p, credits: e.target.value } : p))}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: "#fff", boxSizing: "border-box" }}
                        />
                      </div>
                    </div>
                    {s.sgpa && <div style={{ marginTop: 8, fontSize: 12, color: COLORS.cyanD, fontWeight: 600 }}>SGPA: {s.sgpa} × {s.credits} credits</div>}
                  </div>
                ))}
              </div>
              {filledPrevSems.length > 0 && (
                <div style={{ marginTop: 18, padding: "14px 18px", background: `linear-gradient(135deg, ${COLORS.cyan}22, ${COLORS.blue}22)`, borderRadius: 12, border: `1.5px solid ${COLORS.cyan}44` }}>
                  <div style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 4 }}>Calculated CGPA (Σ SGPA × Credits / Σ Credits)</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.cyanD }}>{cgpa}</div>
                  <div style={{ fontSize: 12, color: COLORS.textLight }}>Based on {filledPrevSems.length} semester{filledPrevSems.length !== 1 ? "s" : ""} · {totalCredits} total credits</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MARKS TAB */}
        {tab === "marks" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>📝 Enter Semester {profile.semester} Marks</h2>
            <p style={{ color: COLORS.textLight, marginBottom: 20, fontSize: 14 }}>Each subject: Unit Test (max 20) + Mid-Term (max 50) + End-Term (max 50) = 120</p>

            <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
              {currentSubjects.map((s, i) => {
                const total = (parseFloat(s.ut) || 0) + (parseFloat(s.mid) || 0) + (parseFloat(s.end) || 0);
                const { grade, gp } = getGrade(total);
                const hasMarks = s.ut || s.mid || s.end;
                return (
                  <div key={i} style={{ background: COLORS.white, borderRadius: 14, padding: "18px 20px", border: `1.5px solid ${hasMarks ? COLORS.cyan + "44" : COLORS.beigeD}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.textLight }}>{s.credits} Credits</div>
                      </div>
                      {hasMarks && (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: grade === "F" ? COLORS.danger : grade.startsWith("A") ? COLORS.success : COLORS.cyanD }}>{grade}</div>
                          <div style={{ fontSize: 12, color: COLORS.textLight }}>GP: {gp} · Total: {total}/120</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[["Unit Test", "ut", 20], ["Mid-Term", "mid", 50], ["End-Term", "end", 50]].map(([lbl, key, mx]) => (
                        <div key={key}>
                          <label style={{ fontSize: 12, color: COLORS.textLight, display: "block", marginBottom: 5 }}>{lbl} (/{mx})</label>
                          <input type="number" value={s[key]} min="0" max={mx}
                            onChange={e => {
                              const v = Math.min(mx, Math.max(0, parseFloat(e.target.value) || 0));
                              setCurrentSubjects(prev => prev.map((sub, j) => j === i ? { ...sub, [key]: v || e.target.value } : sub));
                            }}
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.beigeD}`, fontSize: 14, background: COLORS.beige, boxSizing: "border-box" }}
                          />
                        </div>
                      ))}
                    </div>
                    {hasMarks && (
                      <div style={{ marginTop: 12, height: 6, background: COLORS.beigeD, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${(total / 120) * 100}%`, height: "100%", background: grade === "F" ? COLORS.danger : grade.startsWith("A") ? COLORS.success : COLORS.cyan, borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {currentSubjects.some(s => s.ut || s.mid || s.end) && (
              <div style={{ background: COLORS.white, borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${COLORS.cyan}44` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>📊 Semester {profile.semester} Result</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
                  <StatCard label="SGPA" value={currentSGPA} icon="🏅" color={COLORS.cyanD} />
                  <StatCard label="Total Credits" value={currentSubjects.reduce((a, s) => a + s.credits, 0)} icon="✅" color={COLORS.blueD} />
                </div>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: COLORS.beige }}>
                      {["Subject", "Credits", "Total", "Grade", "GP", "CP"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: COLORS.textMid, borderBottom: `1px solid ${COLORS.beigeD}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjectGrades.map((s, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${COLORS.beige}` }}>
                        <td style={{ padding: "8px 10px", color: COLORS.text, fontWeight: 500 }}>{s.name}</td>
                        <td style={{ padding: "8px 10px", color: COLORS.textMid }}>{s.credits}</td>
                        <td style={{ padding: "8px 10px", color: COLORS.textMid }}>{s.total}/120</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ background: s.grade === "F" ? "#FEE" : s.grade.startsWith("A") ? "#EFFFEF" : COLORS.beige, color: s.grade === "F" ? COLORS.danger : s.grade.startsWith("A") ? COLORS.success : COLORS.cyanD, padding: "2px 8px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>{s.grade}</span>
                        </td>
                        <td style={{ padding: "8px 10px", color: COLORS.textMid }}>{s.gp}</td>
                        <td style={{ padding: "8px 10px", color: COLORS.cyanD, fontWeight: 600 }}>{(s.credits * s.gp).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PREDICTOR TAB */}
        {tab === "predictor" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>🎯 CGPA Predictor</h2>
            <p style={{ color: COLORS.textLight, marginBottom: 24, fontSize: 14 }}>Find minimum marks needed to achieve your target CGPA</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
              <div style={{ background: COLORS.white, borderRadius: 16, padding: "22px 20px", border: `1.5px solid ${COLORS.beigeD}`, alignSelf: "start" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Set Your Target</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: COLORS.textMid, fontWeight: 500, display: "block", marginBottom: 8 }}>Target CGPA</label>
                  <input type="number" value={targetCGPA} min="0" max="10" step="0.1"
                    onChange={e => setTargetCGPA(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `2px solid ${COLORS.cyan}`, fontSize: 20, fontWeight: 700, color: COLORS.cyanD, background: COLORS.beige, textAlign: "center", boxSizing: "border-box" }}
                  />
                </div>
                {[7.0, 7.5, 8.0, 8.5, 9.0, 9.5].map(t => (
                  <button key={t} onClick={() => setTargetCGPA(String(t))} style={{ margin: "3px", padding: "5px 12px", borderRadius: 8, border: `1.5px solid ${parseFloat(targetCGPA) === t ? COLORS.cyan : COLORS.beigeD}`, background: parseFloat(targetCGPA) === t ? COLORS.cyan : "transparent", color: parseFloat(targetCGPA) === t ? "#fff" : COLORS.textMid, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{t}</button>
                ))}

                <div style={{ marginTop: 18, padding: "12px", background: COLORS.beige, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>Your current CGPA</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.cyanD }}>{cgpa}</div>
                  {parseFloat(targetCGPA) > parseFloat(cgpa) && (
                    <div style={{ fontSize: 12, color: COLORS.warning, marginTop: 4 }}>+{(parseFloat(targetCGPA) - parseFloat(cgpa)).toFixed(2)} points needed</div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ background: COLORS.white, borderRadius: 16, padding: "22px 20px", border: `1.5px solid ${COLORS.beigeD}`, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>Minimum Required Marks</h3>
                  <p style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 18 }}>To achieve CGPA of {targetCGPA}, you need at least:</p>
                  {predictions.length > 0 ? (
                    predictions.map((p, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                          <span style={{ fontWeight: 600, color: COLORS.text }}>{p.name}</span>
                          <span style={{ color: p.pct > 85 ? COLORS.danger : p.pct > 70 ? COLORS.warning : COLORS.success, fontWeight: 700 }}>{p.minMarks}/120 ({p.pct}%)</span>
                        </div>
                        <div style={{ height: 8, background: COLORS.beigeD, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${p.pct}%`, height: "100%", background: p.pct > 85 ? COLORS.danger : p.pct > 70 ? COLORS.warning : COLORS.success, borderRadius: 4, transition: "width 0.8s" }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px 0", color: COLORS.textLight }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
                      <div>Enter previous semester data and set a target CGPA to see predictions</div>
                    </div>
                  )}
                </div>

                {predictions.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Best Case", desc: "Score 5 more than minimum", delta: "+0.3", color: COLORS.success },
                      { label: "Average Case", desc: "Score at minimum marks", delta: "±0.0", color: COLORS.cyanD },
                      { label: "Minimum Case", desc: "Borderline marks only", delta: "-0.2", color: COLORS.warning },
                    ].map((s, i) => (
                      <div key={i} style={{ background: COLORS.white, borderRadius: 12, padding: "16px 14px", border: `1.5px solid ${s.color}33`, textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: s.color, fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>~{(parseFloat(targetCGPA) + parseFloat(s.delta)).toFixed(1)}</div>
                        <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginBottom: 20 }}>📈 Academic Analytics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={{ background: COLORS.white, borderRadius: 16, padding: "22px 20px", border: `1.5px solid ${COLORS.beigeD}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Semester-wise SGPA Trend</h3>
                {semChartData.length > 0 ? <BarChart data={semChartData} /> : <div style={{ textAlign: "center", padding: "30px 0", color: COLORS.textLight }}>Enter previous SGPA data on the Dashboard</div>}
              </div>

              <div style={{ background: COLORS.white, borderRadius: 16, padding: "22px 20px", border: `1.5px solid ${COLORS.beigeD}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Grade Distribution (Current Sem)</h3>
                {subjectGrades.some(s => s.total > 0) ? (
                  <BarChart data={subjectGrades.filter(s => s.total > 0).map(s => ({ label: s.name.split(" ")[0], value: s.gp }))} color={COLORS.blueD} />
                ) : <div style={{ textAlign: "center", padding: "30px 0", color: COLORS.textLight }}>Enter marks in the "Enter Marks" tab</div>}
              </div>

              <div style={{ background: COLORS.white, borderRadius: 16, padding: "22px 20px", border: `1.5px solid ${COLORS.beigeD}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>CGPA Progress</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {prevSems.filter(s => s.sgpa).map((s, i) => {
                    const cumData = prevSems.slice(0, i + 1).filter(x => x.sgpa);
                    const cum = calcCGPA(cumData);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 12, color: COLORS.textLight, width: 50, flexShrink: 0 }}>Sem {s.sem}</div>
                        <div style={{ flex: 1, height: 8, background: COLORS.beigeD, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${(parseFloat(cum) / 10) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.blueD}, ${COLORS.cyan})`, borderRadius: 4 }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.cyanD, width: 40, textAlign: "right" }}>{cum}</div>
                      </div>
                    );
                  })}
                  {!prevSems.some(s => s.sgpa) && <div style={{ textAlign: "center", padding: "30px 0", color: COLORS.textLight }}>Enter semester data on the Dashboard</div>}
                </div>
              </div>

              <div style={{ background: COLORS.white, borderRadius: 16, padding: "22px 20px", border: `1.5px solid ${COLORS.beigeD}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Performance Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <StatCard label="Best SGPA" value={filledPrevSems.length > 0 ? Math.max(...filledPrevSems.map(s => parseFloat(s.sgpa))).toFixed(2) : "—"} icon="⭐" color={COLORS.success} />
                  <StatCard label="Lowest SGPA" value={filledPrevSems.length > 0 ? Math.min(...filledPrevSems.map(s => parseFloat(s.sgpa))).toFixed(2) : "—"} icon="⚠️" color={COLORS.warning} />
                  <StatCard label="Avg SGPA" value={filledPrevSems.length > 0 ? (filledPrevSems.reduce((a, s) => a + parseFloat(s.sgpa), 0) / filledPrevSems.length).toFixed(2) : "—"} icon="📊" />
                  <StatCard label="Sems Done" value={filledPrevSems.length} icon="🗂️" sub="out of 8" color={COLORS.blueD} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI ASSISTANT TAB */}
        {tab === "ai" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>🤖 AI Academic Assistant</h2>
            <p style={{ color: COLORS.textLight, marginBottom: 20, fontSize: 14 }}>Get personalized study guidance powered by Claude AI</p>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
              <AIChat studentName={profile.name} sgpa={currentSGPA} cgpa={cgpa} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: COLORS.white, borderRadius: 16, padding: "18px 16px", border: `1.5px solid ${COLORS.beigeD}` }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>💬 Quick Questions</h4>
                  {[
                    "How can I improve my CGPA this semester?",
                    "Best study techniques for exams?",
                    "How to manage time across subjects?",
                    "I have backlogs — what should I do?",
                    `How to score 9+ SGPA in Semester ${profile.semester}?`,
                  ].map((q, i) => (
                    <button key={i} onClick={() => {
                      setTab("ai");
                      document.querySelector('input[placeholder*="Ask about"]')?.focus();
                    }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.beigeD}`, background: COLORS.beige, color: COLORS.textMid, fontSize: 12, cursor: "pointer", marginBottom: 6, lineHeight: 1.4 }}>
                      {q}
                    </button>
                  ))}
                </div>
                <div style={{ background: COLORS.white, borderRadius: 16, padding: "18px 16px", border: `1.5px solid ${COLORS.beigeD}` }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>📌 Your Stats</h4>
                  <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 2 }}>
                    <div>🏆 CGPA: <b style={{ color: COLORS.cyanD }}>{cgpa}</b></div>
                    <div>📊 SGPA: <b style={{ color: COLORS.cyanD }}>{currentSGPA}</b></div>
                    <div>📅 Semester: <b style={{ color: COLORS.cyanD }}>{profile.semester}</b></div>
                    <div>🎓 Branch: <b style={{ color: COLORS.cyanD }}>{profile.branch}</b></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
