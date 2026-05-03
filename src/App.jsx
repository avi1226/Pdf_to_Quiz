import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono&display=swap');

:root {
  --bg-page:        #F8FAFC;
  --bg-card:        #FFFFFF;
  --bg-surface:     #F1F5F9;
  --border:         #E2E8F0;
  --primary:        #2563EB;
  --primary-dark:   #1E3A5F;
  --accent:         #38BDF8;
  --correct:        #22C55E;
  --wrong:          #EF4444;
  --partial:        #F59E0B;
  --text-primary:   #0F172A;
  --text-secondary: #475569;
  --text-hint:      #94A3B8;
  --correct-bg:     #F0FDF4;
  --wrong-bg:       #FEF2F2;
  --warning-bg:     #FEF3C7;
  --drag-idle:      #EFF6FF;
  --drag-hover:     #DBEAFE;
  --drag-filled:    #EFF6FF;
  --drag-border:    #93C5FD;
  --drag-correct:   #DCFCE7;
  --drag-wrong:     #FEE2E2;
  --drop-empty:     #F8FAFC;
  --drop-active:    #DBEAFE;
  --drop-filled:    #F0F9FF;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
  --shadow-drag: 0 8px 24px rgba(37,99,235,0.18);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--bg-page);
  color: var(--text-primary);
  font-size: clamp(14px, 2vw, 16px);
  line-height: 1.5;
}
h1, h2, h3, h4 { font-weight: 600; color: var(--primary-dark); }
.container { max-width: 760px; margin: 0 auto; padding: 2rem 1rem; }
.card { background: var(--bg-card); box-shadow: var(--shadow-md); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 1rem; }
.text-center { text-align: center; }
.mb-1 { margin-bottom: 0.5rem; } .mb-2 { margin-bottom: 1rem; } .mb-4 { margin-bottom: 2rem; }
.flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; } .gap-2 { gap: 0.5rem; } .gap-4 { gap: 1rem; }
.w-full { width: 100%; }

/* Form inputs */
input[type="text"], input[type="number"], input[type="password"], textarea, select {
  width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: inherit; font-size: 1rem; background: #fff;
}
input:focus, textarea:focus, select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
textarea { resize: vertical; min-height: 100px; }
label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-secondary); }

.btn {
  background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 44px;
}
.btn:hover:not(:disabled) { background: var(--primary-dark); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline { background: transparent; border: 1px solid var(--primary); color: var(--primary); }
.btn-outline:hover:not(:disabled) { background: var(--bg-surface); }

/* Banner */
.banner { background: var(--warning-bg); padding: 1rem; border-bottom: 1px solid var(--partial); display: flex; gap: 1rem; align-items: center; justify-content: center; }

/* Upload Screen */
.upload-zone { border: 2px dashed var(--border); border-radius: var(--radius-md); padding: 3rem 1rem; text-align: center; background: var(--bg-surface); cursor: pointer; transition: all 0.2s ease; }
.upload-zone:hover, .upload-zone.dragover { border-color: var(--primary); background: var(--drag-idle); }
.checkbox-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
.checkbox-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }

/* Loading Spinner */
.spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Quiz Top Bar */
.top-bar { position: sticky; top: 0; background: var(--bg-page); padding: 1rem 0; z-index: 50; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
.progress-track { background: var(--border); height: 4px; border-radius: 2px; width: 100%; overflow: hidden; margin-top: 0.5rem; }
.progress-fill { background: var(--primary); height: 100%; transition: width 0.3s ease; }

/* Question Cards */
.badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; font-weight: 600; }
.badge-topic { background: var(--primary-dark); color: white; }
.badge-diff { background: var(--bg-surface); color: var(--text-secondary); }

/* Options (MCQ) */
.option-card { background: var(--bg-surface); border: 2px solid var(--border); border-radius: var(--radius-md); padding: 1rem; cursor: pointer; transition: all 0.2s; margin-bottom: 0.75rem; }
.option-card:hover:not(.disabled) { border-color: var(--primary); background: #F8FAFC; }
.option-card.selected { border-color: var(--primary); background: #EFF6FF; }
.option-card.correct { border-color: var(--correct); background: var(--correct-bg); }
.option-card.wrong { border-color: var(--wrong); background: var(--wrong-bg); }
.option-card.disabled { cursor: default; }

/* Explanation Box */
.explanation-box { background: var(--bg-surface); border-left: 4px solid var(--primary); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 1rem; margin-top: 1.5rem; overflow: hidden; transition: max-height 0.3s ease; animation: slideInRight 0.3s ease; }
.explanation-box.correct { border-left-color: var(--correct); background: var(--correct-bg); }
.explanation-box.wrong { border-left-color: var(--wrong); background: var(--wrong-bg); }

/* Chips & Drag/Drop */
.chip { display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--drag-border); background: var(--drag-idle); color: var(--primary-dark); font-family: 'JetBrains Mono', monospace; font-size: 13px; cursor: grab; user-select: none; transition: all 0.15s ease; box-shadow: var(--shadow-sm); margin: 4px; }
.chip:hover:not(.chip-used) { background: var(--drag-hover); box-shadow: var(--shadow-md); transform: scale(1.02); }
.chip-used { background: var(--bg-surface); border-color: var(--border); color: var(--text-hint); cursor: default; opacity: 0.6; pointer-events: none; }
.chip-dragging { opacity: 0.45; }
.chip-selected-mobile { border-color: var(--accent); background: #EFF6FF; box-shadow: 0 0 0 3px rgba(56,189,248,0.25); }

.drop-zone { min-width: 110px; height: 38px; border-radius: var(--radius-sm); border: 2px dashed var(--drag-border); background: var(--drop-empty); display: flex; align-items: center; justify-content: center; padding: 4px 10px; font-size: 12px; color: var(--text-hint); transition: all 0.15s ease; position: relative; }
.drop-zone-active { border: 2px solid var(--primary); background: var(--drop-active); animation: pulse-border 1s infinite; }
.drop-zone-filled { border: 2px solid var(--drag-border); background: var(--drop-filled); color: var(--primary-dark); font-family: 'JetBrains Mono', monospace; font-size: 13px; cursor: pointer; }
.drop-zone-correct { border: 2px solid var(--correct); background: var(--drag-correct); color: #166534; pointer-events: none; }
.drop-zone-wrong { border: 2px solid var(--wrong); background: var(--drag-wrong); color: #991B1B; pointer-events: none; }
.zone-remove-btn { position: absolute; top: -8px; right: -8px; width: 18px; height: 18px; border-radius: 50%; background: var(--wrong); color: white; font-size: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
.zone-correct-hint { position: absolute; top: 100%; left: 0; width: 100%; text-align: center; font-size: 10px; color: var(--correct); margin-top: 2px; }

/* Flowchart */
.flowchart-container { display: flex; flex-direction: column; align-items: center; gap: 0; padding: 1.5rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border); overflow-x: auto; min-height: 200px; }
.node-process { background: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 10px 16px; text-align: center; font-size: 13px; color: var(--text-primary); min-width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center;}
.node-decision { width: 120px; height: 120px; background: var(--warning-bg); border: 1.5px solid var(--partial); transform: rotate(45deg); display: flex; align-items: center; justify-content: center; margin: 1rem 0; }
.node-decision-inner { transform: rotate(-45deg); font-size: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 140px; }
.node-start, .node-end { background: var(--primary); color: white; border-radius: 50px; padding: 8px 24px; font-size: 13px; font-weight: 500; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.node-label { margin-bottom: 0.5rem; }
.flow-arrow { width: 2px; height: 32px; background: var(--border); margin: 0 auto; position: relative; }
.flow-arrow::after { content: ''; position: absolute; bottom: -6px; left: -4px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid var(--border); }

/* Diagram Layout */
.diagram-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }

/* Results */
.heatmap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.heatmap-tile { padding: 1.5rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border); }
.tile-good { background: var(--correct-bg); border-color: var(--correct); }
.tile-warn { background: var(--warning-bg); border-color: var(--partial); }
.tile-bad { background: var(--wrong-bg); border-color: var(--wrong); }

@media (max-width: 639px) {
  .diagram-layout { grid-template-columns: 1fr; }
  .heatmap-grid { grid-template-columns: 1fr; }
  .grid-2 { display: flex; flex-direction: column; }
}

@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes correctFlash { 0% { background: var(--correct); } 100% { background: var(--correct-bg); } }
@keyframes pulse-border { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.3); } 50% { box-shadow: 0 0 0 4px rgba(37,99,235,0); } }
.shake { animation: shake 0.4s; }
.fade-in-up { animation: fadeInUp 0.4s ease forwards; }
`;

function fisherYates(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const loadPdfJs = () => new Promise((resolve, reject) => {
  if (window.pdfjsLib) return resolve(window.pdfjsLib);
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.onload = () => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    resolve(window.pdfjsLib);
  };
  script.onerror = reject;
  document.head.appendChild(script);
});

async function extractTextFromPDF(file) {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text.substring(0, 12000); // truncate if very long
}

async function fetchAnthropic(messages, apiKey, system = '') {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system,
      messages
    })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

async function generateQuiz(text, config, apiKey) {
  const system = `You are an expert exam coach and knowledge assessor. Analyze the provided PDF
content and generate high-quality exam-style questions strictly from that content.
Do not use outside knowledge. Every question must be traceable to the document.

Rules:
- Assign each question: topic_tag, difficulty (easy/medium/hard), page_ref
- Hard = Bloom's Taxonomy levels 4-6 (analysis, evaluation, synthesis)
- For diagram/flowchart questions: generate a structured diagram object with
  nodes, connections, and label positions. Labels must be shuffled in the
  response so they are not in correct order.
- For interview/short-answer: include model_answer and key_points array
- Respond ONLY in valid JSON matching the schema below. No markdown. No preamble.

JSON Schema:
{
  "quiz_title": "string",
  "topics_covered": ["string"],
  "questions": [
    {
      "id": 1,
      "type": "mcq | true_false | fill_blank | short_answer | diagram",
      "topic_tag": "string",
      "difficulty": "easy | medium | hard",
      "page_ref": "string",
      "question": "string",
      "options": ["A","B","C","D"], // MCQ only
      "correct_answer": "string", // For true_false use "true"|"false"
      "sentence": "The ___ is powerhouse", // fill_blank only
      "model_answer": "string", // short_answer only
      "key_points": ["string"], // short_answer only
      "diagram_type": "flowchart", // diagram only
      "diagram_title": "string", // diagram only
      "diagram_description": "string", // diagram only
      "nodes": [ // diagram only
        { "id": "n1", "type": "process|decision|start|end", "display_text": "string", "connects_to": ["n2"] }
      ],
      "drop_zones": [ // diagram only
        { "zone_id": "z1", "node_id": "n1", "correct_label": "string" }
      ],
      "answer_chips": [ // diagram only, MUST SHUFFLE
        { "chip_id": "c1", "label": "string", "correct_zone_id": "z1" }
      ],
      "explanation": "string"
    }
  ]
}`;

  const prompt = `Generate exactly ${config.numQuestions} questions of difficulty ${config.difficulty}.
Mode: ${config.mode}.
Question types allowed: ${Object.entries(config.qTypes).filter(e => e[1]).map(e => e[0]).join(', ')}.
PDF Content:
${text}`;

  const res = await fetchAnthropic([{ role: 'user', content: prompt }], apiKey, system);
  const raw = res.content[0].text;
  try {
    const jsonStr = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Failed to parse AI response as JSON');
  }
}

async function evaluateShortAnswer(q, answer, apiKey) {
  const prompt = `Question: ${q.question}
Model answer: ${q.model_answer}
Key points: ${q.key_points.join(', ')}
User answer: ${answer}

Return JSON: {"score_pct": 0-100, "mentioned": ["string"], "missed": ["string"], "feedback": "string"}`;

  const res = await fetchAnthropic([{ role: 'user', content: prompt }], apiKey);
  const raw = res.content[0].text;
  const jsonStr = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  return JSON.parse(jsonStr);
}

async function generateStudyPlan(results, apiKey) {
  const prompt = `Quiz results with all Q+A pairs: ${JSON.stringify(results)}. Generate study plan. Return JSON:
{"summary": "string", "study_priority": [{"topic": "string", "reason": "string", "action": "string"}]}`;

  const res = await fetchAnthropic([{ role: 'user', content: prompt }], apiKey);
  const raw = res.content[0].text;
  const jsonStr = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  return JSON.parse(jsonStr);
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '');
  const [screen, setScreen] = useState('upload'); // upload, loading, quiz, results
  const [pdfText, setPdfText] = useState('');
  const [config, setConfig] = useState({
    numQuestions: 10, difficulty: 'Medium', mode: 'Exam Mode',
    qTypes: { mcq: true, true_false: true, fill_blank: true, short_answer: false, diagram: true }
  });
  const [quizData, setQuizData] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState('Reading your document...');
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveKey = (key) => { setApiKey(key); localStorage.setItem('anthropic_api_key', key); };

  const startGeneration = async (text) => {
    if (!apiKey) { setError('Please enter Anthropic API Key'); return; }
    setScreen('loading');
    setError(null);
    const msgs = ['Reading your document...', 'Identifying key concepts...', 'Detecting diagrams and flowcharts...', 'Generating questions...', 'Almost ready...'];
    let idx = 0;
    const interval = setInterval(() => { idx = (idx + 1) % msgs.length; setLoadingMsg(msgs[idx]); }, 2000);
    try {
      const data = await generateQuiz(text, config, apiKey);
      setQuizData(data);
      setResults(new Array(data.questions.length).fill(null));
      setScreen('quiz');
    } catch (err) {
      setError(err.message || 'Generation failed');
      setScreen('upload');
    } finally {
      clearInterval(interval);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file || file.type !== 'application/pdf') { setError('Please upload a PDF file only.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Use a PDF under 10MB.'); return; }
    try {
      const text = await extractTextFromPDF(file);
      if (text.trim().length < 50) { setError('This PDF appears scanned. Try a text-based PDF.'); return; }
      setPdfText(text);
      setError(null);
    } catch (err) { setError('Failed to extract PDF text.'); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {!apiKey && (
        <div className="banner">
          <span><strong>API Key Required:</strong> Enter your Anthropic API Key to use StudyMap.</span>
          <input type="password" placeholder="sk-ant-..." onChange={e => saveKey(e.target.value)} style={{width: '250px', padding:'0.5rem'}} />
        </div>
      )}

      {error && (
        <div className="container" style={{paddingBottom: 0}}>
          <div className="card" style={{background: 'var(--wrong-bg)', color: 'var(--wrong)', borderColor: 'var(--wrong)', borderWidth: 1, borderStyle: 'solid'}}>
            {error} <button onClick={() => setError(null)} style={{background:'none', border:'none', color:'inherit', cursor:'pointer', float:'right', fontWeight:'bold'}}>✕</button>
          </div>
        </div>
      )}

      {screen === 'upload' && (
        <div className="container fade-in-up">
          <div className="text-center mb-4">
            <h1 style={{fontSize: '2.5rem', color: 'var(--primary-dark)'}}>StudyMap</h1>
            <p style={{color: 'var(--text-secondary)'}}>AI-powered PDF Exam & Interview Coach</p>
          </div>

          <div className="card">
            {!pdfText ? (
              <div 
                className="upload-zone"
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); }}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); handleFileUpload(e); }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input type="file" id="file-input" hidden accept=".pdf" onChange={handleFileUpload} />
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📄</div>
                <h3>Drop your PDF here or click to browse</h3>
                <p style={{color: 'var(--text-hint)', marginTop: '0.5rem'}}>PDF up to 10MB</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4" style={{color: 'var(--correct)'}}>
                  <span style={{fontSize: '1.5rem'}}>✓</span> <strong>PDF loaded successfully ({Math.round(pdfText.length / 5)} words)</strong>
                </div>

                <div className="grid-2">
                  <div>
                    <label>Number of Questions ({config.numQuestions})</label>
                    <input type="range" min="5" max="30" value={config.numQuestions} onChange={e => setConfig({...config, numQuestions: parseInt(e.target.value)})} style={{width: '100%', marginBottom: '1rem'}} />
                  </div>
                  <div>
                    <label>Difficulty</label>
                    <select value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})} style={{marginBottom: '1rem'}}>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label>Mode</label>
                    <div className="flex gap-2">
                      <button className={`btn btn-full ${config.mode === 'Exam Mode' ? '' : 'btn-outline'}`} onClick={() => setConfig({...config, mode: 'Exam Mode'})}>Exam Mode</button>
                      <button className={`btn btn-full ${config.mode === 'Interview Mode' ? '' : 'btn-outline'}`} onClick={() => setConfig({...config, mode: 'Interview Mode'})}>Interview Mode</button>
                    </div>
                  </div>
                </div>

                <div className="mb-4 mt-4">
                  <label>Question Types</label>
                  <div className="checkbox-grid">
                    {['mcq', 'true_false', 'fill_blank', 'short_answer', 'diagram'].map(type => (
                      <label key={type} className="checkbox-item">
                        <input type="checkbox" checked={config.qTypes[type]} onChange={e => setConfig({...config, qTypes: {...config.qTypes, [type]: e.target.checked}})} />
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    ))}
                  </div>
                </div>

                <button className="btn btn-full" onClick={() => startGeneration(pdfText)}>Generate Quiz</button>
                <p className="text-center mt-4" style={{color: 'var(--text-hint)', fontSize: '0.85rem'}}>Your PDF is processed locally and via Anthropic API. Not stored.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {screen === 'loading' && (
        <div className="container text-center" style={{marginTop: '20vh'}}>
          <div className="spinner"></div>
          <h2>{loadingMsg}</h2>
        </div>
      )}

      {screen === 'quiz' && (
        <QuizSession 
          quizData={quizData} 
          apiKey={apiKey}
          isMobile={isMobile}
          onComplete={(finalResults) => {
            setResults(finalResults);
            setScreen('results');
          }}
        />
      )}

      {screen === 'results' && (
        <ResultsDashboard 
          quizData={quizData} 
          results={results} 
          apiKey={apiKey}
          onRestart={() => setScreen('upload')} 
        />
      )}
    </>
  );
}

// -----------------------------------------------------------------------------
// QUIZ SESSION COMPONENT
// -----------------------------------------------------------------------------
function QuizSession({ quizData, apiKey, isMobile, onComplete }) {
  const [currIdx, setCurrIdx] = useState(0);
  const [answers, setAnswers] = useState(new Array(quizData.questions.length).fill(null));
  
  const q = quizData.questions[currIdx];
  const answeredCount = answers.filter(a => a !== null).length;
  const correctCount = answers.filter(a => a?.isCorrect).length;
  const wrongCount = answers.filter(a => a !== null && !a.isCorrect && !a.isPartial).length;

  const handleNext = () => {
    if (currIdx < quizData.questions.length - 1) setCurrIdx(currIdx + 1);
    else onComplete(answers);
  };

  const setAnswer = (res) => {
    const newAns = [...answers];
    newAns[currIdx] = res;
    setAnswers(newAns);
  };

  return (
    <div>
      <div className="top-bar">
        <div className="container" style={{padding: '0 1rem'}}>
          <div className="flex justify-between items-center">
            <h3 style={{margin:0}}>{quizData.quiz_title}</h3>
            <span style={{fontWeight:600}}>Question {currIdx + 1} of {quizData.questions.length}</span>
            <span style={{color: 'var(--text-secondary)'}}><span style={{color:'var(--correct)'}}>{correctCount} correct</span> / <span style={{color:'var(--wrong)'}}>{wrongCount} wrong</span></span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{width: `${((currIdx) / quizData.questions.length) * 100}%`}}></div>
          </div>
        </div>
      </div>

      <div className="container" style={{paddingTop: 0}}>
        <div className="card slide-in-right" key={currIdx}>
          <div className="flex justify-between items-center mb-4">
            <span className="badge badge-topic">{q.topic_tag}</span>
            <span className="badge badge-diff">{q.difficulty}</span>
          </div>
          <h2 className="mb-4" style={{fontSize: '1.25rem'}}>{q.question}</h2>

          {q.type === 'mcq' && <MCQ question={q} result={answers[currIdx]} onAnswer={setAnswer} />}
          {q.type === 'true_false' && <TrueFalse question={q} result={answers[currIdx]} onAnswer={setAnswer} />}
          {q.type === 'fill_blank' && <FillBlank question={q} result={answers[currIdx]} onAnswer={setAnswer} />}
          {q.type === 'short_answer' && <ShortAnswer question={q} result={answers[currIdx]} onAnswer={setAnswer} apiKey={apiKey} />}
          {q.type === 'diagram' && <Diagram question={q} result={answers[currIdx]} onAnswer={setAnswer} isMobile={isMobile} />}

          {answers[currIdx] && (
            <div className="mt-4 fade-in-up">
              <button className="btn btn-full" onClick={handleNext}>
                {currIdx < quizData.questions.length - 1 ? 'Next Question →' : 'View Results'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Explanation({ result, explanation, pageRef }) {
  if (!result) return null;
  const isCorrect = result.isCorrect;
  return (
    <div className={`explanation-box ${isCorrect ? 'correct' : 'wrong'}`}>
      <h4 style={{color: isCorrect ? 'var(--correct)' : 'var(--wrong)', marginBottom: '0.5rem'}}>
        {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
      </h4>
      <p>{explanation}</p>
      {pageRef && <p style={{marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>— {pageRef}</p>}
    </div>
  );
}

function MCQ({ question, result, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = (opt) => {
    if (result) return;
    setSelected(opt);
    onAnswer({
      userAnswer: opt,
      isCorrect: opt === question.correct_answer
    });
  };

  return (
    <div>
      <div className="grid-2">
        {question.options.map(opt => {
          let className = 'option-card';
          if (result) {
            className += ' disabled';
            if (opt === question.correct_answer) className += ' correct';
            else if (opt === selected) className += ' wrong';
          } else if (selected === opt) {
            className += ' selected';
          }
          return (
            <div key={opt} className={className} onClick={() => handleSelect(opt)}>
              {opt}
            </div>
          );
        })}
      </div>
      <Explanation result={result} explanation={question.explanation} pageRef={question.page_ref} />
    </div>
  );
}

function TrueFalse({ question, result, onAnswer }) {
  const handleSelect = (val) => {
    if (result) return;
    onAnswer({
      userAnswer: val,
      isCorrect: val.toString().toLowerCase() === question.correct_answer.toString().toLowerCase()
    });
  };

  return (
    <div>
      <div className="grid-2">
        {['True', 'False'].map(opt => {
          let className = 'btn btn-outline btn-full';
          if (result) {
            if (opt.toLowerCase() === question.correct_answer.toString().toLowerCase()) className = 'btn btn-full';
            else if (result.userAnswer === opt) className = 'btn btn-full'; // wait, styled as wrong below
            // to be safe, just standard MCQ logic
          }
          // fallback to option-card style for consistency
          let cardClass = 'option-card text-center';
          if (result) {
            cardClass += ' disabled';
            if (opt.toLowerCase() === question.correct_answer.toString().toLowerCase()) cardClass += ' correct';
            else if (opt === result.userAnswer) cardClass += ' wrong';
          }
          return <div key={opt} className={cardClass} onClick={() => handleSelect(opt)}><h3>{opt}</h3></div>;
        })}
      </div>
      <Explanation result={result} explanation={question.explanation} pageRef={question.page_ref} />
    </div>
  );
}

function FillBlank({ question, result, onAnswer }) {
  const [val, setVal] = useState('');
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (!val.trim()) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    const isCorrect = val.trim().toLowerCase() === question.correct_answer.toLowerCase();
    onAnswer({ userAnswer: val, isCorrect });
  };

  return (
    <div>
      <p className="mb-4" style={{fontSize: '1.1rem', fontFamily: 'JetBrains Mono', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)'}}>
        {question.sentence.replace('___', '__________')}
      </p>
      {!result ? (
        <div className="flex gap-2">
          <input type="text" value={val} onChange={e => setVal(e.target.value)} placeholder="Type your answer..." onKeyDown={e => e.key === 'Enter' && submit()} />
          <button className={`btn ${shake ? 'shake' : ''}`} onClick={submit}>Submit</button>
        </div>
      ) : (
        <div style={{fontSize: '1.1rem', marginTop: '1rem'}}>
          Your answer: <strong style={{color: result.isCorrect ? 'var(--correct)' : 'var(--wrong)'}}>{result.userAnswer}</strong>
          {!result.isCorrect && <div>Correct answer: <strong style={{color: 'var(--correct)'}}>{question.correct_answer}</strong></div>}
        </div>
      )}
      <Explanation result={result} explanation={question.explanation} pageRef={question.page_ref} />
    </div>
  );
}

function ShortAnswer({ question, result, onAnswer, apiKey }) {
  const [val, setVal] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!val.trim()) return;
    setLoading(true);
    try {
      const evalData = await evaluateShortAnswer(question, val, apiKey);
      onAnswer({
        userAnswer: val,
        isCorrect: evalData.score_pct >= 70,
        isPartial: evalData.score_pct > 0 && evalData.score_pct < 70,
        score: evalData.score_pct,
        feedback: evalData.feedback,
        mentioned: evalData.mentioned,
        missed: evalData.missed
      });
    } catch (e) { alert('Evaluation failed'); }
    setLoading(false);
  };

  return (
    <div>
      {!result ? (
        <div>
          <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="Explain your answer..." className="mb-2" />
          <p className="text-right text-hint mb-2">{val.split(' ').filter(x=>x).length} words</p>
          <button className="btn btn-full" onClick={submit} disabled={loading}>{loading ? 'Evaluating...' : 'Submit Answer'}</button>
        </div>
      ) : (
        <div>
          <div className="card" style={{background: 'var(--bg-surface)', padding: '1rem'}}>
            <h4 className="mb-2">AI Evaluation: {result.score}%</h4>
            <p className="mb-2">{result.feedback}</p>
            {result.mentioned.length > 0 && <div style={{color:'var(--correct)', fontSize:'0.9rem'}}>✓ {result.mentioned.join(', ')}</div>}
            {result.missed.length > 0 && <div style={{color:'var(--wrong)', fontSize:'0.9rem'}}>✗ Missed: {result.missed.join(', ')}</div>}
          </div>
          <div className="mt-4">
            <h4>Model Answer</h4>
            <p style={{fontStyle:'italic', color:'var(--text-secondary)'}}>{question.model_answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Diagram({ question, result, onAnswer, isMobile }) {
  const [chipBank, setChipBank] = useState([]);
  const [dropZones, setDropZones] = useState([]);
  const [dragState, setDragState] = useState({ draggingChipId: null, overZoneId: null });
  const [selectedChipId, setSelectedChipId] = useState(null);

  useEffect(() => {
    if (!result) {
      const shuffled = fisherYates(question.answer_chips);
      setChipBank(shuffled.map(c => ({ id: c.chip_id, label: c.label, placedInZoneId: null })));
      setDropZones(question.drop_zones.map((z, i) => ({
        id: z.zone_id,
        nodeId: z.node_id,
        number: i + 1,
        correctChipId: question.answer_chips.find(c => c.correct_zone_id === z.zone_id)?.chip_id,
        placedChipId: null
      })));
    }
  }, [question, result]);

  const handleDragStart = (e, chipId, fromZoneId) => {
    setDragState({ draggingChipId: chipId, overZoneId: null });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('chipId', chipId);
    e.dataTransfer.setData('fromZoneId', fromZoneId || 'bank');
  };

  const handleDragOver = (e, zoneId) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragState(prev => ({...prev, overZoneId: zoneId})); };
  const handleDragLeave = () => setDragState(prev => ({...prev, overZoneId: null}));

  const returnChipToBank = (chipId) => setChipBank(prev => prev.map(c => c.id === chipId ? { ...c, placedInZoneId: null } : c));

  const handleDrop = (e, targetZoneId) => {
    e.preventDefault();
    const chipId = e.dataTransfer.getData('chipId');
    const fromZoneId = e.dataTransfer.getData('fromZoneId');
    setDropZones(prev => prev.map(z => {
      if (z.id === targetZoneId) {
        if (z.placedChipId && z.placedChipId !== chipId) returnChipToBank(z.placedChipId);
        return { ...z, placedChipId: chipId };
      }
      if (z.id === fromZoneId) return { ...z, placedChipId: null };
      return z;
    }));
    setChipBank(prev => prev.map(c => c.id === chipId ? { ...c, placedInZoneId: targetZoneId } : c));
    setDragState({ draggingChipId: null, overZoneId: null });
  };

  const handleRemoveFromZone = (e, zoneId) => {
    e.stopPropagation();
    const zone = dropZones.find(z => z.id === zoneId);
    if (!zone.placedChipId) return;
    returnChipToBank(zone.placedChipId);
    setDropZones(prev => prev.map(z => z.id === zoneId ? { ...z, placedChipId: null } : z));
  };

  const handleChipTap = (chipId) => {
    if (selectedChipId === chipId) setSelectedChipId(null);
    else setSelectedChipId(chipId);
  };

  const handleZoneTap = (zoneId) => {
    if (!selectedChipId) {
      const zone = dropZones.find(z => z.id === zoneId);
      if (zone.placedChipId) setSelectedChipId(zone.placedChipId);
      return;
    }
    const chipId = selectedChipId;
    setDropZones(prev => prev.map(z => {
      if (z.id === zoneId) {
        if (z.placedChipId && z.placedChipId !== chipId) returnChipToBank(z.placedChipId);
        return { ...z, placedChipId: chipId };
      }
      if (z.placedChipId === chipId) return { ...z, placedChipId: null };
      return z;
    }));
    setChipBank(prev => prev.map(c => c.id === chipId ? { ...c, placedInZoneId: zoneId } : c));
    setSelectedChipId(null);
  };

  const submit = () => {
    const isCorrect = dropZones.every(z => z.placedChipId === z.correctChipId);
    const score = dropZones.filter(z => z.placedChipId === z.correctChipId).length;
    onAnswer({
      isCorrect,
      isPartial: !isCorrect && score > 0,
      score,
      total: dropZones.length,
      dropZones,
      chipBank
    });
  };

  const allFilled = dropZones.length > 0 && dropZones.every(z => z.placedChipId);
  const zonesToRender = result ? result.dropZones : dropZones;
  const chipsToRender = result ? result.chipBank : chipBank;

  return (
    <div>
      <div className="diagram-layout">
        <div>
          <h4>Answer Bank</h4>
          <p className="text-hint mb-4" style={{fontSize: '0.85rem'}}>
            {isMobile ? 'Tap a label, then tap where it belongs' : 'Drag each label to its correct position'}
          </p>
          <div style={{display:'flex', flexWrap:'wrap'}}>
            {chipsToRender.map(c => {
              const isUsed = c.placedInZoneId !== null;
              const isSelected = c.id === selectedChipId;
              const isDragging = dragState.draggingChipId === c.id;
              let classes = 'chip';
              if (isUsed) classes += ' chip-used';
              if (isSelected) classes += ' chip-selected-mobile';
              if (isDragging) classes += ' chip-dragging';

              return (
                <div 
                  key={c.id} className={classes}
                  draggable={!isUsed && !result}
                  onDragStart={(e) => handleDragStart(e, c.id, 'bank')}
                  onClick={() => !result && handleChipTap(c.id)}
                >
                  {c.label}
                </div>
              );
            })}
          </div>
          {!result && <div className="mt-4 text-center text-secondary">{dropZones.filter(z => z.placedChipId).length} of {dropZones.length} labels placed</div>}
        </div>

        <div className="flowchart-container">
          <h4 className="mb-4">{question.diagram_title || 'Diagram'}</h4>
          {question.nodes && question.nodes.map((node, i) => {
            const zone = zonesToRender.find(z => z.nodeId === node.id);
            return (
              <React.Fragment key={node.id}>
                <div className={`node-${node.type}`}>
                  {node.type !== 'decision' && <div className="node-label">{node.display_text}</div>}
                  {node.type === 'decision' && <div className="node-decision-inner">{node.display_text}</div>}
                  {zone && (
                    <div 
                      className={`drop-zone ${dragState.overZoneId === zone.id ? 'drop-zone-active' : ''} ${zone.placedChipId ? 'drop-zone-filled' : ''} ${result ? (zone.placedChipId === zone.correctChipId ? 'drop-zone-correct' : 'drop-zone-wrong') : ''}`}
                      onDragOver={e => !result && handleDragOver(e, zone.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={e => !result && handleDrop(e, zone.id)}
                      onClick={() => !result && handleZoneTap(zone.id)}
                    >
                      {zone.placedChipId ? (
                        <>
                          {chipsToRender.find(c => c.id === zone.placedChipId)?.label}
                          {!result && <button className="zone-remove-btn" onClick={e => handleRemoveFromZone(e, zone.id)}>✕</button>}
                        </>
                      ) : (
                        `① Drop here`
                      )}
                      {result && zone.placedChipId !== zone.correctChipId && (
                        <div className="zone-correct-hint">{chipsToRender.find(c => c.id === zone.correctChipId)?.label}</div>
                      )}
                    </div>
                  )}
                </div>
                {i < question.nodes.length - 1 && <div className="flow-arrow"></div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {!result && (
        <button className="btn btn-full mt-4" disabled={!allFilled} onClick={submit}>Check Answers</button>
      )}
      {result && (
        <div className={`explanation-box ${result.isCorrect ? 'correct' : (result.isPartial ? '' : 'wrong')}`}>
          <h4 style={{color: result.isCorrect ? 'var(--correct)' : (result.isPartial ? 'var(--partial)' : 'var(--wrong)'), marginBottom: '0.5rem'}}>
            {result.isCorrect ? '✓ Perfect!' : `You got ${result.score} out of ${result.total} labels correct`}
          </h4>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// RESULTS DASHBOARD
// -----------------------------------------------------------------------------
function ResultsDashboard({ quizData, results, apiKey, onRestart }) {
  const [studyPlan, setStudyPlan] = React.useState(null);
  const [loadingPlan, setLoadingPlan] = React.useState(true);

  React.useEffect(() => {
    generateStudyPlan(results, apiKey)
      .then(plan => setStudyPlan(plan))
      .catch(e => console.error(e))
      .finally(() => setLoadingPlan(false));
  }, [results, apiKey]);

  const total = results.length;
  const correct = results.filter(r => r.isCorrect).length;
  const scorePct = Math.round((correct / total) * 100);

  let msg = "Needs significant work.";
  if (scorePct > 40) msg = "Getting there.";
  if (scorePct > 65) msg = "Good job!";
  if (scorePct > 85) msg = "Excellent! You're exam-ready.";

  const topics = {};
  quizData.questions.forEach((q, i) => {
    if (!topics[q.topic_tag]) topics[q.topic_tag] = { correct: 0, total: 0 };
    topics[q.topic_tag].total++;
    if (results[i].isCorrect) topics[q.topic_tag].correct++;
  });

  return (
    <div className="container fade-in-up">
      <h2 className="text-center mb-4">Quiz Results</h2>
      
      <div className="card text-center mb-4">
        <div style={{fontSize: '4rem', fontWeight: 600, color: scorePct >= 80 ? 'var(--correct)' : (scorePct >= 50 ? 'var(--partial)' : 'var(--wrong)')}}>
          {scorePct}%
        </div>
        <p className="text-secondary">{msg}</p>
        <div className="flex justify-center gap-4 mt-4 text-secondary">
          <span>✓ {correct} Correct</span>
          <span>✗ {total - correct} Wrong</span>
        </div>
      </div>

      <h3 className="mb-4">Where to focus next</h3>
      <div className="heatmap-grid mb-4">
        {Object.entries(topics).map(([topic, data]) => {
          const pct = Math.round((data.correct / data.total) * 100);
          let cls = 'tile-bad';
          if (pct >= 80) cls = 'tile-good';
          else if (pct >= 50) cls = 'tile-warn';
          return (
            <div key={topic} className={`heatmap-tile ${cls}`}>
              <h4>{topic}</h4>
              <div style={{fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0'}}>{pct}%</div>
              <p className="text-secondary" style={{fontSize: '0.85rem'}}>{data.correct} / {data.total} correct</p>
            </div>
          );
        })}
      </div>

      {results.some(r => r.dropZones) && (
        <div className="mb-4 text-left">
          <h3 className="mb-4 mt-4">Diagram & Flowchart Accuracy</h3>
          {results.map((r, i) => {
            if (!r.dropZones) return null;
            const q = quizData.questions[i];
            return (
              <div key={i} className="card mb-4" style={{padding: '1.5rem'}}>
                <h4 className="mb-2">Question {i + 1}</h4>
                <p className="mb-4">{q.question}</p>
                <div style={{transform: 'scale(0.85)', transformOrigin: 'top left', width: '117%'}}>
                  <Diagram question={q} result={r} isMobile={window.innerWidth < 640} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 className="mb-4 mt-4">Study Recommendations</h3>
      {loadingPlan ? (
        <div className="text-center" style={{padding: '2rem'}}>
          <div className="spinner"></div>
          <p>Generating personalized study plan...</p>
        </div>
      ) : studyPlan ? (
        <div className="card text-left mb-4">
          <p className="mb-4">{studyPlan.summary}</p>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {studyPlan.study_priority.map((item, idx) => (
              <div key={idx} style={{background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)'}}>
                <h4 style={{marginBottom: '0.5rem'}}>📚 {item.topic}</h4>
                <p style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}><strong>Reason:</strong> {item.reason}</p>
                <p style={{fontSize: '0.9rem'}}><strong>Action:</strong> {item.action}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-secondary text-center mb-4">Could not generate study plan.</p>
      )}

      <button className="btn btn-full" onClick={onRestart}>Upload New PDF</button>
    </div>
  );
}
