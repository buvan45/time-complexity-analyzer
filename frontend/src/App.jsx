import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Activity, ArrowRight, Braces, Check, ChevronDown, Clock3, Code2,
  Copy, Cpu, Github, Info, LoaderCircle, RotateCcw, Sparkles, Terminal
} from "lucide-react";
import { analyzeCode } from "./api";

const examples = {
  Python: `def find_max(numbers):
    maximum = numbers[0]
    for number in numbers:
        if number > maximum:
            maximum = number
    return maximum`,
  JavaScript: `function findMax(numbers) {
  let maximum = numbers[0];
  for (const number of numbers) {
    if (number > maximum) maximum = number;
  }
  return maximum;
}`,
  Java: `static int findMax(int[] numbers) {
    int maximum = numbers[0];
    for (int number : numbers) {
        if (number > maximum) maximum = number;
    }
    return maximum;
}`,
  "C++": `int findMax(vector<int>& numbers) {
    int maximum = numbers[0];
    for (int number : numbers) {
        if (number > maximum) maximum = number;
    }
    return maximum;
}`
};

const complexityMeta = {
  "O(1)": { name: "Constant", color: "mint", description: "The amount of work stays roughly the same as input size grows." },
  "O(log n)": { name: "Logarithmic", color: "blue", description: "The problem size is reduced by a factor at each step." },
  "O(n)": { name: "Linear", color: "violet", description: "Work grows proportionally to the number of input elements." },
  "O(n log n)": { name: "Linearithmic", color: "blue", description: "Common in efficient comparison-based sorting algorithms." },
  "O(n^2)": { name: "Quadratic", color: "amber", description: "Work often grows with two nested passes over the input." },
  "O(n^3)": { name: "Cubic", color: "amber", description: "Work often grows with three nested passes over the input." },
  "O(2^n)": { name: "Exponential", color: "rose", description: "Work can roughly double with each additional input element." }
};

export default function App() {
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState(examples.Python);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(() => code.split("\n").length, [code]);
  const meta = result ? (complexityMeta[result.predicted_complexity] || {}) : {};

  function changeLanguage(next) {
    setLanguage(next);
    setCode(examples[next] || "");
    setResult(null);
    setError("");
  }

  async function runAnalysis() {
    if (!code.trim()) {
      setError("Paste some code into the editor first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeCode({ code, language: language.toLowerCase() });
      setResult(data);
    } catch (err) {
      setError(`${err.message} Make sure the FastAPI backend is running on port 8000.`);
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  }

  function resetCode() {
    setCode(examples[language] || "");
    setResult(null);
    setError("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Complexity Lab home">
          <span className="brand-mark"><Activity size={20} strokeWidth={2.5} /></span>
          <span>complexity<span className="brand-light">lab</span></span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" />
          <span className="topbar-caption">Code analysis workspace</span>
          <span className="version-pill">BETA</span>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> ALGORITHM INSIGHTS, SIMPLIFIED</div>
          <h1>Understand how your code <span>scales.</span></h1>
          <p className="hero-copy">Estimate time complexity with machine learning, then use the result as a starting point for understanding your algorithm.</p>
          <div className="hero-pills">
            <span><Code2 size={14} /> Multiple languages</span>
            <span><Cpu size={14} /> ML-powered prediction</span>
            <span><Clock3 size={14} /> Big-O notation</span>
          </div>
        </section>

        <section className="workspace">
          <div className="editor-panel panel">
            <div className="panel-heading editor-heading">
              <div className="panel-title-wrap">
                <span className="panel-icon"><Braces size={17} /></span>
                <div>
                  <h2>Code editor</h2>
                  <p>Paste or write your algorithm</p>
                </div>
              </div>
              <div className="editor-actions">
                <button className="icon-button" onClick={copyCode} title="Copy code" aria-label="Copy code">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button className="icon-button" onClick={resetCode} title="Reset example" aria-label="Reset example"><RotateCcw size={16} /></button>
              </div>
            </div>

            <div className="editor-toolbar">
              <label htmlFor="language-select">LANGUAGE</label>
              <div className="select-wrap">
                <select id="language-select" value={language} onChange={(e) => changeLanguage(e.target.value)}>
                  {Object.keys(examples).map((item) => <option key={item}>{item}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
              <span className="toolbar-spacer" />
              <span className="line-count">{lineCount} lines</span>
            </div>

            <div className="monaco-wrap">
              <Editor
                height="390px"
                language={{ Python: "python", JavaScript: "javascript", Java: "java", "C++": "cpp" }[language]}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineHeight: 23,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  padding: { top: 18, bottom: 18 },
                  scrollBeyondLastLine: false,
                  roundedSelection: true,
                  renderLineHighlight: "gutter",
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: "on",
                  smoothScrolling: true,
                  cursorBlinking: "smooth"
                }}
              />
            </div>

            <div className="editor-footer">
              <span><span className="footer-dot" /> Ready for analysis</span>
              <span><Terminal size={13} /> Source code is analyzed, not executed</span>
            </div>
            <button className="analyze-button" onClick={runAnalysis} disabled={loading}>
              {loading ? <><LoaderCircle className="spin" size={17} /> Analyzing code...</> : <><Sparkles size={17} /> Analyze complexity <ArrowRight size={17} /></>}
            </button>
            {error && <div className="error-message" role="alert"><Info size={16} /> {error}</div>}
          </div>

          <aside className="results-column">
            <div className="panel result-panel">
              <div className="panel-heading">
                <div className="panel-title-wrap">
                  <span className="panel-icon result-icon"><Activity size={17} /></span>
                  <div>
                    <h2>Analysis result</h2>
                    <p>Your algorithm at a glance</p>
                  </div>
                </div>
                <span className={`live-tag ${result ? "live-tag-ready" : ""}`}><span /> {result ? "COMPLETE" : "AWAITING"}</span>
              </div>

              {result ? (
                <div className="result-content">
                  <div className={`complexity-card ${meta.color || "violet"}`}>
                    <span className="result-label">PREDICTED TIME COMPLEXITY</span>
                    <div className="big-o">{result.predicted_complexity}</div>
                    <div className="complexity-name">{result.complexity_name || meta.name || "Estimated class"}</div>
                  </div>
                  <div className="result-explanation">
                    <div className="mini-heading"><Sparkles size={14} /> INTERPRETATION</div>
                    <p>{result.explanation || meta.description || "This is the model's estimated complexity class."}</p>
                  </div>
                  <div className="result-detail">
                    <span>Analysis method</span><strong>{result.analysis_method || "ML prediction"}</strong>
                  </div>
                  {result.warnings?.length > 0 && (
                    <div className="warning-box"><Info size={15} /><div>{result.warnings.join(" ")}</div></div>
                  )}
                  <div className="disclaimer"><Info size={14} /> This is an estimate, not a formal proof. Validate it against the algorithm's logic and input constraints.</div>
                </div>
              ) : (
                <div className="empty-result">
                  <div className="empty-illustration">
                    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                    <div className="empty-core"><Activity size={27} /></div>
                    <span className="float-symbol symbol-one">O(n)</span>
                    <span className="float-symbol symbol-two">ƒ(x)</span>
                    <span className="float-symbol symbol-three">∑</span>
                  </div>
                  <h3>Your results will appear here</h3>
                  <p>Run an analysis to see the predicted Big-O class and a short interpretation.</p>
                  <div className="empty-divider" />
                  <div className="supported-title">SUPPORTED COMPLEXITY CLASSES</div>
                  <div className="complexity-chips">
                    {["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)"].map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className="tip-card">
              <div className="tip-icon"><Info size={17} /></div>
              <div>
                <h3>Remember the basics</h3>
                <p>Big-O describes how runtime grows as input size increases. It doesn't directly measure seconds or hardware speed.</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="how-section">
          <div className="section-heading">
            <span className="section-kicker">THE WORKFLOW</span>
            <h2>From source code to insight</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card"><span className="step-number">01</span><div className="step-icon"><Code2 size={20} /></div><h3>Write your code</h3><p>Paste an algorithm or start with the editable example in the code editor.</p></div>
            <div className="step-card"><span className="step-number">02</span><div className="step-icon"><Cpu size={20} /></div><h3>Analyze patterns</h3><p>The backend extracts code features and asks the trained classifier for a prediction.</p></div>
            <div className="step-card"><span className="step-number">03</span><div className="step-icon"><Activity size={20} /></div><h3>Review the estimate</h3><p>Use the predicted Big-O class as a guide, then validate it with algorithm analysis.</p></div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-brand"><span className="brand-mark small"><Activity size={15} /></span> complexitylab</div>
          <span>Built for learning, experimentation, and better algorithms.</span>
          <span className="footer-note">ML estimates can be imperfect.</span>
        </footer>
      </main>
    </div>
  );
}