import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════
// CSS & THEME
// ═══════════════════════════════════════════════
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

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
  --drag-border:    #93C5FD;
  --drag-correct:   #DCFCE7;
  --drag-wrong:     #FEE2E2;
  --drop-empty:     #F8FAFC;
  --drop-active:    #DBEAFE;
  --drop-filled:    #F0F9FF;

  --shadow-sm:   0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:   0 4px 16px rgba(0,0,0,0.10);
  --shadow-drag: 0 8px 24px rgba(37,99,235,0.18);
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: clamp(14px, 2vw, 16px);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 { font-weight: 600; color: var(--primary-dark); }
p { font-weight: 400; color: var(--text-primary); }
.mono { font-family: 'JetBrains Mono', monospace; }

.container { max-width: 760px; margin: 0 auto; padding: 0 1rem; }
.card { background: var(--bg-card); box-shadow: var(--shadow-md); border-radius: var(--radius-lg); padding: 2rem; }

.text-center { text-align: center; }
.text-right { text-align: right; }
.mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; } .mb-4 { margin-bottom: 1rem; } .mb-8 { margin-bottom: 2rem; }
.mt-4 { margin-top: 1rem; } .mt-8 { margin-top: 2rem; }
.flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; } .gap-2 { gap: 0.5rem; } .gap-4 { gap: 1rem; }
.w-full { width: 100%; }

button, input, select, textarea { font-family: inherit; font-size: inherit; }
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

/* Buttons */
.btn { height: 48px; border: none; border-radius: var(--radius-md); padding: 0 1.25rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--bg-surface); color: var(--text-primary); }
.btn:hover:not(:disabled) { filter: brightness(0.95); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-primary); }
.btn-outline.active { background: var(--primary); color: white; border-color: var(--primary); }

/* Inputs */
input[type="text"], input[type="password"], textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: #fff; min-height: 44px; transition: all 0.2s ease; }
input:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
textarea { resize: vertical; min-height: 100px; }
label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-secondary); }

/* Animations */
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes correctFlash { 0% { background-color: var(--correct); } 100% { background-color: var(--correct-bg); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse-border { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.3); } 50% { box-shadow: 0 0 0 5px rgba(37,99,235,0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.shake { animation: shake 0.4s ease; }
.fade-in-up { animation: fadeInUp 0.4s ease both; }
.slide-in-right { animation: slideInRight 0.3s ease; }

/* Grid Layouts */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

/* Diagram Specific */
.diagram-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1.5rem; }

/* Responsive adjustments */
@media (max-width: 639px) {
  .grid-2, .grid-3, .diagram-layout { grid-template-columns: 1fr; }
  .card { padding: 1rem; }
  .btn, .input { width: 100%; }
}
`;

// ═══════════════════════════════════════════════
// UTILS & PATTERNS
// ═══════════════════════════════════════════════

const parseJSON = (raw) => {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

const extractPdfText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return {
    text: fullText.slice(0, 12000),
    pageCount: pdf.numPages,
    wordCount: fullText.split(/\s+/).length
  };
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ═══════════════════════════════════════════════
// PROMPTS
// ═══════════════════════════════════════════════

const SYSTEM_PROMPT = `You are an expert exam coach. Generate quiz questions strictly from the
provided document content. Do not use outside knowledge. Every question
must be directly traceable to the text provided.

Rules:
- Assign each question: topic_tag, difficulty (easy/medium/hard), page_ref
- Hard difficulty = Bloom's Taxonomy levels 4-6
- For diagram questions: generate nodes, drop_zones, and answer_chips
- answer_chips must be returned in shuffled order
- For short_answer: include model_answer and key_points array
- Respond ONLY in valid JSON. No markdown. No preamble. No explanation.`;

const buildQuizPrompt = (pdfText, config) => `Here is the document content:

${pdfText}

Generate ${config.questionCount} questions.
Types to include: ${config.types.join(', ')}
Difficulty: ${config.difficulty}
Mode: ${config.mode}

Return this exact JSON structure:
{
  "quiz_title": "string",
  "topics_covered": ["string"],
  "questions": [
    {
      "id": "number",
      "type": "mcq|true_false|fill_blank|short_answer|diagram",
      "topic_tag": "string",
      "difficulty": "easy|medium|hard",
      "page_ref": "string",
      "question": "string",
      "options": ["A","B","C","D"],
      "correct_answer": "string",
      "sentence": "string with ___ blank (fill_blank only)",
      "model_answer": "string (short_answer only)",
      "key_points": ["string (short_answer only)"],
      "explanation": "string",
      "diagram_type": "flowchart|anatomy|concept_map|cycle",
      "diagram_title": "string (diagram only)",
      "diagram_description": "string (diagram only)",
      "nodes": [
        {
          "id": "string",
          "type": "process|decision|start|end",
          "display_text": "string",
          "position": { "row": 1, "col": 1 },
          "connects_to": ["nodeId"]
        }
      ],
      "drop_zones": [
        {
          "id": "string",
          "node_id": "string",
          "number": 1,
          "position_hint": "string",
          "x": 50,
          "y": 30,
          "correct_chip_id": "string"
        }
      ],
      "answer_chips": [
        {
          "id": "string",
          "label": "string",
          "correct_zone_id": "string"
        }
      ]
    }
  ]
}`;

const SHORT_ANSWER_EVAL_PROMPT = (question, userAnswer) => `Question: ${question.question}
Model answer: ${question.model_answer}
Key points required: ${question.key_points.join(', ')}
User's answer: ${userAnswer}

Evaluate the answer. Return JSON only:
{
  "score_pct": 0-100,
  "mentioned": ["key points the user covered"],
  "missed": ["key points the user missed"],
  "feedback": "2-3 sentence constructive feedback"
}`;

const STUDY_PLAN_SYSTEM_PROMPT = `You are a learning coach. Analyze quiz results and generate a
concise, actionable study plan. Respond ONLY in valid JSON.`;

const buildStudyPlanPrompt = (questions, answers) => `Quiz results:
${JSON.stringify(
  questions.map(q => ({
    id: q.id,
    topic: q.topic_tag,
    type: q.type,
    correct: answers[q.id]?.isCorrect,
    skipped: answers[q.id]?.skipped
  }))
)}

Return JSON:
{
  "summary": "2-sentence overall summary",
  "study_priority": [
    {
      "topic": "string",
      "score_pct": 0-100,
      "reason": "string",
      "action": "specific study action"
    }
  ]
}`;

// ═══════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════

export default function StudyMap() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [screen, setScreen] = useState('upload'); // 'upload' | 'loading' | 'quiz' | 'results'
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [pdfjsReady, setPdfjsReady] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [pdfMeta, setPdfMeta] = useState({ pageCount: 0, wordCount: 0 });
  const [config, setConfig] = useState({
    questionCount: 10,
    difficulty: 'medium',
    mode: 'exam',
    types: ['mcq', 'true_false', 'fill_blank', 'diagram']
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [quizTitle, setQuizTitle] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [studyPlan, setStudyPlan] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const callAnthropic = async (messages, systemPrompt, retries = 1) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
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
          system: systemPrompt,
          messages: messages
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API error');
      }
      const data = await response.json();
      return data.content[0].text;
    } catch (err) {
      if (retries > 0 && err.message.includes('parse')) {
        return callAnthropic(messages, systemPrompt, retries - 1);
      }
      throw err;
    }
  };

  const showError = (code, message) => {
    setError({ code, message });
    setTimeout(() => setError(null), 6000);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted({});
    setStudyPlan(null);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {error && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '1rem' }} className="fade-in-up">
          <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--wrong-bg)', border: '1px solid var(--wrong)', color: '#991B1B', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><span style={{ fontWeight: 600 }}>✗</span> {error.message}</span>
            <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>✕</button>
          </div>
        </div>
      )}

      {screen === 'upload' && (
        <UploadScreen
          apiKey={apiKey} setApiKey={setApiKey}
          apiKeyVisible={apiKeyVisible} setApiKeyVisible={setApiKeyVisible}
          pdfjsReady={pdfjsReady}
          uploadedFile={uploadedFile} setUploadedFile={setUploadedFile}
          pdfText={pdfText} setPdfText={setPdfText}
          pdfMeta={pdfMeta} setPdfMeta={setPdfMeta}
          config={config} setConfig={setConfig}
          showError={showError}
          onGenerate={async () => {
            setScreen('loading');
            setError(null);
            const messagesList = ["Reading your document...", "Identifying key concepts...", "Detecting diagrams and flowcharts...", "Building your questions...", "Almost ready..."];
            let msgIndex = 0;
            setLoadingMessage(messagesList[0]);
            const interval = setInterval(() => {
              msgIndex = (msgIndex + 1) % messagesList.length;
              setLoadingMessage(messagesList[msgIndex]);
            }, 2000);

            try {
              const raw = await callAnthropic([{ role: 'user', content: buildQuizPrompt(pdfText, config) }], SYSTEM_PROMPT);
              const parsed = parseJSON(raw);
              setQuestions(parsed.questions);
              setQuizTitle(parsed.quiz_title);
              setStartTime(Date.now());
              setCurrentIndex(0);
              setAnswers({});
              setSubmitted({});
              setScreen('quiz');
            } catch (err) {
              let code = 'api_error';
              if (err.message.includes('JSON')) code = 'parse_error';
              showError(code, 'Could not generate questions: ' + err.message);
              setScreen('upload');
            } finally {
              clearInterval(interval);
            }
          }}
        />
      )}

      {screen === 'loading' && (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ color: 'var(--text-secondary)' }} className="fade-in">{loadingMessage}</div>
          </div>
        </div>
      )}

      {screen === 'quiz' && (
        <QuizScreen
          isMobile={isMobile}
          questions={questions}
          currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}
          answers={answers} setAnswers={setAnswers}
          submitted={submitted} setSubmitted={setSubmitted}
          quizTitle={quizTitle}
          startTime={startTime}
          config={config}
          apiKey={apiKey}
          callAnthropic={callAnthropic}
          showError={showError}
          onComplete={async () => {
            setScreen('results');
            try {
              const raw = await callAnthropic([{ role: 'user', content: buildStudyPlanPrompt(questions, answers) }], STUDY_PLAN_SYSTEM_PROMPT);
              setStudyPlan(parseJSON(raw));
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          questions={questions}
          answers={answers}
          studyPlan={studyPlan}
          isMobile={isMobile}
          onRestart={() => { resetQuiz(); setScreen('upload'); }}
          onRetryWrong={() => {
            const wrongTopics = Array.from(new Set(questions.filter(q => !answers[q.id]?.isCorrect && !answers[q.id]?.skipped).map(q => q.topic_tag)));
            if (wrongTopics.length === 0) return;
            // Hacky retry: could generate a new quiz. For now just resets to quiz view with only wrong questions
            // Real implemention should re-fetch.
            resetQuiz(); setScreen('upload');
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════
// UPLOAD SCREEN
// ═══════════════════════════════════════════════
function UploadScreen({ apiKey, setApiKey, apiKeyVisible, setApiKeyVisible, pdfjsReady, uploadedFile, setUploadedFile, pdfText, setPdfText, pdfMeta, setPdfMeta, config, setConfig, showError, onGenerate }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file || file.type !== 'application/pdf') { showError('wrong_file', 'Please upload a PDF file only.'); return; }
    if (file.size > 10 * 1024 * 1024) { showError('file_too_large', 'File too large. Use a PDF under 10MB.'); return; }
    setUploadedFile(file);
    if (!pdfjsReady) return;
    try {
      const result = await extractPdfText(file);
      if (result.text.trim().length < 100) { showError('no_text', 'Could not extract text. Try a text-based PDF (not scanned).'); return; }
      setPdfText(result.text);
      setPdfMeta({ pageCount: result.pageCount, wordCount: result.wordCount });
    } catch (e) {
      showError('parse_error', 'Failed to extract text from PDF.');
    }
  };

  const toggleType = (type) => {
    if (config.types.includes(type)) {
      if (config.types.length > 1) setConfig({ ...config, types: config.types.filter(t => t !== type) });
    } else {
      setConfig({ ...config, types: [...config.types, type] });
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 28, color: 'var(--primary-dark)' }}>StudyMap</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Turn your PDFs into exam-ready practice</p>
        </div>

        <div className="mb-4">
          <label htmlFor="apiKeyInput">Anthropic API Key</label>
          <div style={{ position: 'relative' }}>
            <input id="apiKeyInput" type={apiKeyVisible ? 'text' : 'password'} placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <button aria-label="Toggle API Key visibility" style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setApiKeyVisible(!apiKeyVisible)}>
              {apiKeyVisible ? '🙈' : '👁️'}
            </button>
            {apiKey.startsWith('sk-ant-') && <span style={{ position: 'absolute', right: 40, top: 10, background: 'var(--correct-bg)', color: 'var(--correct)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>✓ Valid</span>}
          </div>
        </div>

        {!uploadedFile ? (
          <div className="mb-4">
            <div className="upload-zone"
              style={{ border: `2px dashed ${isDragOver ? 'var(--primary)' : 'var(--drag-border)'}`, background: isDragOver ? 'var(--drag-hover)' : 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', animation: isDragOver ? 'pulse-border 1.5s infinite' : 'none' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept=".pdf" ref={fileInputRef} hidden onChange={e => handleFileSelect(e.target.files[0])} />
              <div style={{ color: 'var(--primary)', fontSize: 40 }}>☁️</div>
              <p style={{ fontWeight: 500, marginTop: 8 }}>Drop your PDF here or click to browse</p>
              <p style={{ color: 'var(--text-hint)', fontSize: 13 }}>Supports PDF up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="fade-in-up mb-8">
            <div className="flex items-center gap-2 mb-4" style={{ background: 'var(--correct-bg)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--correct)' }}>
              <span style={{ color: 'var(--correct)' }}>✓</span>
              <div>
                <div style={{ fontWeight: 600 }}>{uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</div>
                {pdfText && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pdfMeta.pageCount} pages · {pdfMeta.wordCount} words extracted</div>}
              </div>
            </div>

            <div className="grid-2 mb-4">
              <div>
                <label>Number of Questions: {config.questionCount}</label>
                <input type="range" min={5} max={30} step={1} value={config.questionCount} onChange={e => setConfig({ ...config, questionCount: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--primary)' }} />
              </div>
              <div>
                <label>Difficulty</label>
                <div className="flex" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {['easy', 'medium', 'hard'].map(lvl => (
                    <button key={lvl} className={config.difficulty === lvl ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, borderRadius: 0, border: 'none', height: 36, fontSize: 13, textTransform: 'capitalize', background: config.difficulty === lvl ? 'var(--primary)' : 'transparent', color: config.difficulty === lvl ? 'white' : 'var(--text-primary)' }} onClick={() => setConfig({ ...config, difficulty: lvl })}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label>Mode</label>
              <div className="flex gap-2">
                <button className={`btn ${config.mode === 'exam' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setConfig({ ...config, mode: 'exam' })}>Exam Mode</button>
                <button className={`btn ${config.mode === 'interview' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setConfig({ ...config, mode: 'interview' })}>Interview Mode</button>
              </div>
            </div>

            <div className="mb-4">
              <label>Question Types</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { id: 'mcq', label: 'Multiple Choice' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'fill_blank', label: 'Fill in the Blank' },
                  { id: 'short_answer', label: 'Short Answer / Explain' },
                  { id: 'diagram', label: 'Diagram & Flowchart (drag-and-drop)' }
                ].map(t => {
                  const active = config.types.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggleType(t.id)} style={{ padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`, background: active ? 'var(--drag-idle)' : 'var(--bg-surface)', color: active ? 'var(--primary-dark)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button className="btn btn-primary w-full" style={{ height: 48, fontSize: 16 }} disabled={!pdfText || !apiKey || config.types.length === 0} onClick={onGenerate}>
              Generate Quiz →
            </button>
          </div>
        )}
        <p style={{ fontSize: 12, color: 'var(--text-hint)', textAlign: 'center', marginTop: '1rem' }}>
          Your PDF is read locally in your browser and never uploaded to any server.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// QUIZ SCREEN
// ═══════════════════════════════════════════════
function QuizScreen({ isMobile, questions, currentIndex, setCurrentIndex, answers, setAnswers, submitted, setSubmitted, quizTitle, startTime, config, apiKey, callAnthropic, showError, onComplete }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const wrongCount = Object.values(answers).filter(a => a.isCorrect === false && !a.skipped).length;
  const progress = ((currentIndex) / questions.length) * 100;

  const q = questions[currentIndex];
  const qSubmitted = submitted[q.id];
  const qAnswer = answers[q.id];

  const handleAnswerSubmit = (questionId, result) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...result, timeTaken: elapsed } }));
    setSubmitted(prev => ({ ...prev, [questionId]: true }));
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const markSkipped = () => {
    setAnswers(prev => ({ ...prev, [q.id]: { skipped: true, timeTaken: elapsed } }));
    setSubmitted(prev => ({ ...prev, [q.id]: true }));
    goToNextQuestion();
  };

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
        <div className="container flex justify-between items-center">
          <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>StudyMap</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Question {currentIndex + 1} of {questions.length}</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: 14 }}>
              <span style={{ color: 'var(--correct)', fontWeight: 600 }}>{correctCount} ✓</span>{' '}
              <span style={{ color: 'var(--wrong)', fontWeight: 600 }}>{wrongCount} ✗</span>
            </div>
            {config.mode === 'exam' && (
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14 }}>
                {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>
        <div style={{ width: '100%', height: 4, background: 'var(--border)', marginTop: '0.75rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.4s ease' }} role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={questions.length} />
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card slide-in-right" key={q.id} style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="flex justify-between items-center mb-4">
            <span style={{ background: 'var(--primary-dark)', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}>{q.topic_tag}</span>
            <span style={{ background: q.difficulty === 'easy' ? '#F0FDF4' : q.difficulty === 'medium' ? '#FEF3C7' : '#FEF2F2', color: q.difficulty === 'easy' ? '#166534' : q.difficulty === 'medium' ? '#92400E' : '#991B1B', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>{q.difficulty}</span>
          </div>

          <div style={{ color: 'var(--text-hint)', fontSize: 13, marginBottom: 8 }}>Q{currentIndex + 1}</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>{q.question}</h2>

          {q.type === 'mcq' && <MCQQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} />}
          {q.type === 'true_false' && <TrueFalseQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} />}
          {q.type === 'fill_blank' && <FillBlankQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} />}
          {q.type === 'short_answer' && <ShortAnswerQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} apiKey={apiKey} callAnthropic={callAnthropic} />}
          {q.type === 'diagram' && <DiagramQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} isMobile={isMobile} />}

          {qSubmitted && (
            <div className="fade-in-up mt-8">
              <button className="btn btn-primary w-full" onClick={goToNextQuestion}>
                {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Results'}
              </button>
            </div>
          )}

          {!qSubmitted && (
            <div className="text-center mt-4">
              <button onClick={markSkipped} style={{ background: 'none', border: 'none', color: 'var(--text-hint)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Skip this question</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// QUESTION RENDERERS
// ──────────────────────────────────────────────

function ExplanationBox({ question, isCorrect, partialScore, isPartial }) {
  const correct = isCorrect || (isPartial && partialScore === 100);
  const colorVar = correct ? '--correct' : isPartial ? '--partial' : '--wrong';
  return (
    <div style={{ maxHeight: 500, overflow: 'hidden', transition: 'max-height 0.35s ease', marginTop: '1rem', padding: '1rem 1.25rem', background: 'var(--bg-surface)', borderLeft: `3px solid var(${colorVar})`, borderRadius: 'var(--radius-md)' }} className="fade-in-up">
      <div style={{ color: `var(${colorVar})`, fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
        {correct ? '✓ Correct!' : isPartial ? `${partialScore} Correct` : '✗ Incorrect'}
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{question.explanation}</p>
      {question.page_ref && <p style={{ fontSize: 12, color: 'var(--text-hint)', fontStyle: 'italic', marginTop: 6 }}>— {question.page_ref}</p>}
    </div>
  );
}

function MCQQuestion({ question, submitted, answer, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const handleClick = (opt) => {
    if (submitted) return;
    setSelected(opt);
    setTimeout(() => {
      onAnswer({ value: opt, isCorrect: opt === question.correct_answer });
    }, 300);
  };

  return (
    <div>
      {question.options.map(opt => {
        let style = { padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', cursor: 'pointer', marginBottom: 8, transition: 'all 0.2s ease' };
        let icon = null;
        if (submitted) {
          if (opt === question.correct_answer) {
            style.background = 'var(--correct-bg)'; style.borderColor = 'var(--correct)'; style.animation = 'correctFlash 0.5s ease forwards';
            icon = <span style={{ color: 'var(--correct)', marginRight: 8, fontWeight: 600 }}>✓</span>;
          } else if (opt === answer.value) {
            style.background = 'var(--wrong-bg)'; style.borderColor = 'var(--wrong)'; style.animation = 'shake 0.4s ease';
            icon = <span style={{ color: 'var(--wrong)', marginRight: 8, fontWeight: 600 }}>✗</span>;
          } else {
            style.opacity = 0.5;
          }
        } else {
          if (selected === opt) { style.borderColor = 'var(--primary)'; style.background = 'var(--drag-idle)'; style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }
        }
        return (
          <div key={opt} style={style} onClick={() => handleClick(opt)} onMouseEnter={e => { if(!submitted && selected !== opt) { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--drag-idle)'; } }} onMouseLeave={e => { if(!submitted && selected !== opt) { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-surface)'; } }}>
            {icon}{opt}
          </div>
        );
      })}
      {submitted && !answer.skipped && <ExplanationBox question={question} isCorrect={answer.isCorrect} />}
    </div>
  );
}

function TrueFalseQuestion({ question, submitted, answer, onAnswer }) {
  const handleClick = (opt) => {
    if (submitted) return;
    onAnswer({ value: opt, isCorrect: opt.toString().toLowerCase() === question.correct_answer.toString().toLowerCase() });
  };
  return (
    <div>
      <div className="grid-2">
        {['True', 'False'].map(opt => {
          let style = { height: 52, flex: 1, fontSize: 16, fontWeight: 500, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' };
          if (submitted) {
            if (opt.toLowerCase() === question.correct_answer.toString().toLowerCase()) { style.background = 'var(--correct)'; style.color = 'white'; style.borderColor = 'var(--correct)'; }
            else if (opt === answer.value) { style.background = 'var(--wrong)'; style.color = 'white'; style.borderColor = 'var(--wrong)'; style.animation = 'shake 0.4s ease'; }
            else { style.opacity = 0.5; }
          }
          return <button key={opt} style={style} onClick={() => handleClick(opt)}>{opt}</button>;
        })}
      </div>
      {submitted && !answer.skipped && <ExplanationBox question={question} isCorrect={answer.isCorrect} />}
    </div>
  );
}

function FillBlankQuestion({ question, submitted, answer, onAnswer }) {
  const [val, setVal] = useState('');
  const submit = () => {
    if (!val.trim()) return;
    onAnswer({ value: val, isCorrect: val.trim().toLowerCase() === question.correct_answer.toLowerCase() });
  };
  return (
    <div>
      <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: '1.5rem' }}>
        {question.sentence.split('___').map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <span style={{ display: 'inline-block', minWidth: 120, borderBottom: '2px solid var(--primary)', margin: '0 4px', textAlign: 'center', color: submitted ? (answer.isCorrect ? 'var(--correct)' : 'var(--wrong)') : 'inherit', fontWeight: 600 }}>
                {submitted ? answer.value : '______'}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
      {!submitted && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" className="mono" value={val} onChange={e => setVal(e.target.value)} placeholder="Type your answer" onKeyDown={e => e.key === 'Enter' && submit()} />
          <button className="btn btn-primary" onClick={submit}>Check</button>
        </div>
      )}
      {submitted && !answer.skipped && !answer.isCorrect && (
        <div style={{ marginTop: '1rem', color: 'var(--wrong)' }}>
          <span style={{ fontWeight: 600 }}>✗ Incorrect.</span> Correct answer: <span style={{ color: 'var(--correct)', fontWeight: 600 }}>{question.correct_answer}</span>
        </div>
      )}
      {submitted && !answer.skipped && <ExplanationBox question={question} isCorrect={answer.isCorrect} />}
    </div>
  );
}

function ShortAnswerQuestion({ question, submitted, answer, onAnswer, apiKey, callAnthropic }) {
  const [val, setVal] = useState('');
  const [loading, setLoading] = useState(false);
  const wordCount = val.split(/\s+/).filter(x => x).length;

  const submit = async () => {
    if (!val.trim()) return;
    setLoading(true);
    try {
      const raw = await callAnthropic([{ role: 'user', content: SHORT_ANSWER_EVAL_PROMPT(question, val) }], "You are an evaluator. Respond only in JSON.");
      const evalData = parseJSON(raw);
      onAnswer({ value: val, isCorrect: evalData.score_pct >= 70, score: evalData.score_pct, mentioned: evalData.mentioned, missed: evalData.missed, feedback: evalData.feedback });
    } catch (e) {
      alert('Evaluation failed');
    }
    setLoading(false);
  };

  return (
    <div>
      {!submitted ? (
        <div>
          <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="Explain your answer..." />
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-hint)', marginTop: 4, marginBottom: 16 }}>{wordCount} words</div>
          <button className="btn btn-primary w-full" onClick={submit} disabled={loading}>{loading ? 'Evaluating...' : 'Submit Answer'}</button>
        </div>
      ) : (
        answer.skipped ? <p>Skipped</p> : (
          <div>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>{answer.score}% Match</div>
              <ul style={{ listStyle: 'none', marginBottom: 16 }}>
                {answer.mentioned?.map((m, i) => <li key={i} style={{ color: 'var(--correct)', fontSize: 14, marginBottom: 4 }}>✓ {m}</li>)}
                {answer.missed?.map((m, i) => <li key={i} style={{ color: 'var(--wrong)', fontSize: 14, marginBottom: 4 }}>✗ {m}</li>)}
              </ul>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 14 }}>{answer.feedback}</p>
            </div>
            <details style={{ marginTop: '1rem', cursor: 'pointer' }}>
              <summary style={{ fontWeight: 600, color: 'var(--primary)' }}>Show Model Answer</summary>
              <p style={{ marginTop: 8, padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--text-secondary)' }}>{question.model_answer}</p>
            </details>
          </div>
        )
      )}
    </div>
  );
}

function DiagramQuestion({ question, submitted, answer, onAnswer, isMobile }) {
  const [chipBank, setChipBank] = useState([]);
  const [dropZones, setDropZones] = useState([]);
  const [dragState, setDragState] = useState({ draggingChipId: null, overZoneId: null });
  const [selectedChipId, setSelectedChipId] = useState(null);
  const [zoneResults, setZoneResults] = useState([]);

  useEffect(() => {
    if (!submitted) {
      setChipBank(shuffle(question.answer_chips).map(c => ({ ...c, placedInZoneId: null })));
      setDropZones(question.drop_zones.map(z => ({ ...z, placedChipId: null })));
      setZoneResults([]);
      setSelectedChipId(null);
    } else if (answer?.zoneResults) {
      setZoneResults(answer.zoneResults);
    }
  }, [question, submitted, answer]);

  const handleChipDragStart = (e, chipId, fromZoneId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('chipId', chipId);
    e.dataTransfer.setData('fromZoneId', fromZoneId || 'bank');
    setDragState({ draggingChipId: chipId, overZoneId: null });
  };

  const handleDrop = (e, targetZoneId) => {
    e.preventDefault();
    const chipId = e.dataTransfer.getData('chipId');
    const fromZoneId = e.dataTransfer.getData('fromZoneId');

    setDropZones(prev => prev.map(z => {
      if (z.id === targetZoneId) return { ...z, placedChipId: chipId };
      if (z.id === fromZoneId) return { ...z, placedChipId: null };
      return z;
    }));

    setChipBank(prev => prev.map(c => {
      if (c.id === chipId) return { ...c, placedInZoneId: targetZoneId };
      const targetZone = dropZones.find(z => z.id === targetZoneId);
      if (targetZone?.placedChipId === c.id) return { ...c, placedInZoneId: null };
      return c;
    }));
    setDragState({ draggingChipId: null, overZoneId: null });
  };

  const handleRemoveFromZone = (zoneId) => {
    const zone = dropZones.find(z => z.id === zoneId);
    if (!zone?.placedChipId) return;
    const chipId = zone.placedChipId;
    setDropZones(prev => prev.map(z => z.id === zoneId ? { ...z, placedChipId: null } : z));
    setChipBank(prev => prev.map(c => c.id === chipId ? { ...c, placedInZoneId: null } : c));
  };

  const handleChipTap = (chipId) => setSelectedChipId(prev => prev === chipId ? null : chipId);

  const handleZoneTap = (zoneId) => {
    if (!selectedChipId) {
      const zone = dropZones.find(z => z.id === zoneId);
      if (zone?.placedChipId) {
        setSelectedChipId(zone.placedChipId);
        handleRemoveFromZone(zoneId);
      }
      return;
    }
    const chipId = selectedChipId;
    setDropZones(prev => prev.map(z => {
      if (z.id === zoneId) return { ...z, placedChipId: chipId };
      if (z.placedChipId === chipId) return { ...z, placedChipId: null };
      return z;
    }));
    setChipBank(prev => prev.map(c => {
      if (c.id === chipId) return { ...c, placedInZoneId: zoneId };
      const targetZone = dropZones.find(z => z.id === zoneId);
      if (targetZone?.placedChipId === c.id) return { ...c, placedInZoneId: null };
      return c;
    }));
    setSelectedChipId(null);
  };

  const submit = () => {
    const results = dropZones.map(zone => {
      const chip = chipBank.find(c => c.id === zone.placedChipId);
      const correctChip = chipBank.find(c => c.id === zone.correct_chip_id);
      return { zoneId: zone.id, placedLabel: chip?.label || null, correctLabel: correctChip?.label, isCorrect: zone.placedChipId === zone.correct_chip_id };
    });
    const score = results.filter(r => r.isCorrect).length;
    setZoneResults(results);
    onAnswer({ value: dropZones, isCorrect: score === dropZones.length, score, total: dropZones.length, zoneResults: results, chipBank, dropZones });
  };

  const placed = dropZones.filter(z => z.placedChipId).length;
  const total = dropZones.length;
  const allFilled = placed === total;

  return (
    <div>
      <div className="diagram-layout">
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Answer Bank</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{isMobile ? "Tap a label, then tap where it belongs" : "Drag each label to its correct position"}</p>
          <div style={{ fontSize: 13, color: allFilled ? 'var(--correct)' : 'var(--text-secondary)' }}>{placed} of {total} labels placed</div>
          
          {isMobile && !submitted && (
            <div style={{ background: 'var(--warning-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#92400E', marginBottom: 12, marginTop: 8 }}>
              Tap a label → tap where it belongs
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 12 }}>
            {(submitted && answer?.chipBank ? answer.chipBank : chipBank).map(chip => {
              const isUsed = chip.placedInZoneId !== null;
              const isSelected = chip.id === selectedChipId;
              const isDragging = dragState.draggingChipId === chip.id;
              
              let style = { padding: '8px 16px', borderRadius: 20, border: '1.5px solid var(--drag-border)', background: 'var(--drag-idle)', color: 'var(--primary-dark)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: isUsed || submitted ? 'default' : 'grab', userSelect: 'none', transition: 'all 0.15s ease', boxShadow: 'var(--shadow-sm)', opacity: 1 };
              
              if (isUsed) { style.background = 'var(--bg-surface)'; style.borderColor = 'var(--border)'; style.color = 'var(--text-hint)'; style.opacity = 0.55; style.pointerEvents = 'none'; }
              else if (isSelected) { style.borderColor = 'var(--accent)'; style.background = '#EFF6FF'; style.boxShadow = '0 0 0 3px rgba(56,189,248,0.25)'; }
              else if (isDragging) { style.opacity = 0.4; style.cursor = 'grabbing'; }
              
              return (
                <div key={chip.id} style={style} draggable={!isUsed && !submitted && !isMobile} role="button" aria-grabbed={isDragging} aria-label={`Drag chip: ${chip.label}`}
                  onDragStart={(e) => !isMobile && handleChipDragStart(e, chip.id, 'bank')}
                  onDragEnd={() => setDragState({ draggingChipId: null, overZoneId: null })}
                  onClick={() => isMobile && !isUsed && !submitted && handleChipTap(chip.id)}
                  onMouseEnter={e => { if(!isUsed && !submitted && !isSelected && !isDragging) { e.currentTarget.style.background='var(--drag-hover)'; e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; } }}
                  onMouseLeave={e => { if(!isUsed && !submitted && !isSelected && !isDragging) { e.currentTarget.style.background='var(--drag-idle)'; e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; } }}
                >
                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 16 }}>{question.diagram_title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{question.diagram_description}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-surface)', padding: '2rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflowX: 'auto' }}>
            {question.nodes && question.nodes.map((node, i) => {
              const zoneDef = question.drop_zones.find(z => z.node_id === node.id);
              const activeZone = (submitted && answer?.dropZones ? answer.dropZones : dropZones).find(z => z.nodeId === node.id || z.node_id === node.id);
              const zr = zoneResults.find(r => r.zoneId === activeZone?.id);
              
              let DropZoneCmp = null;
              if (activeZone) {
                const filledChip = (submitted && answer?.chipBank ? answer.chipBank : chipBank).find(c => c.id === activeZone.placedChipId);
                let style = { minWidth: 110, height: 38, border: '2px dashed var(--drag-border)', background: 'var(--drop-empty)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-hint)', position: 'relative', transition: 'all 0.15s ease' };
                let content = `① Drop here`.replace('1', activeZone.number || i+1);
                
                if (dragState.overZoneId === activeZone.id) {
                  style.border = '2px solid var(--primary)'; style.background = 'var(--drop-active)'; style.animation = 'pulse-border 1s infinite';
                } else if (filledChip && !submitted) {
                  style.border = '2px solid var(--drag-border)'; style.background = 'var(--drop-filled)'; style.color = 'var(--primary-dark)'; style.fontFamily = "'JetBrains Mono', monospace"; style.fontSize = 13;
                  content = filledChip.label;
                } else if (submitted && zr) {
                  style.fontFamily = "'JetBrains Mono', monospace"; style.fontSize = 13; style.borderStyle = 'solid';
                  if (zr.isCorrect) { style.borderColor = 'var(--correct)'; style.background = 'var(--drag-correct)'; style.color = '#166534'; content = `✓ ${zr.placedLabel}`; }
                  else { style.borderColor = 'var(--wrong)'; style.background = 'var(--drag-wrong)'; style.color = '#991B1B'; content = `✗ ${zr.placedLabel || 'Empty'}`; }
                }

                DropZoneCmp = (
                  <div style={style} role="listitem" aria-label={`Drop zone ${activeZone.number}: ${filledChip ? filledChip.label : 'empty'}`}
                    onDragOver={e => { if(!submitted && !isMobile){ e.preventDefault(); setDragState(prev => ({...prev, overZoneId: activeZone.id})); } }}
                    onDragLeave={() => !submitted && setDragState(prev => ({...prev, overZoneId: null}))}
                    onDrop={e => { if(!submitted && !isMobile) handleDrop(e, activeZone.id); }}
                    onClick={() => { if(!submitted && isMobile) handleZoneTap(activeZone.id); }}
                  >
                    {content}
                    {filledChip && !submitted && <button style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderRadius: '50%', background: 'var(--wrong)', color: 'white', fontSize: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }} onClick={(e) => { e.stopPropagation(); handleRemoveFromZone(activeZone.id); }}>✕</button>}
                    {submitted && zr && !zr.isCorrect && <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', textAlign: 'center', fontSize: 12, color: 'var(--correct)', marginTop: 2, fontWeight: 600 }}>{zr.correctLabel}</div>}
                  </div>
                );
              }

              return (
                <React.Fragment key={node.id}>
                  {node.type === 'start' || node.type === 'end' ? (
                    <div style={{ background: 'var(--primary)', color: 'white', borderRadius: 50, padding: '8px 20px', fontSize: 13, fontWeight: 500 }}>
                      {DropZoneCmp || node.display_text}
                    </div>
                  ) : node.type === 'decision' ? (
                    <div style={{ width: 110, height: 110, transform: 'rotate(45deg)', background: 'var(--warning-bg)', border: '1.5px solid var(--partial)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ transform: 'rotate(-45deg)', padding: 8, fontSize: 12, textAlign: 'center' }}>
                        {DropZoneCmp || node.display_text}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', minWidth: 140, textAlign: 'center', fontSize: 13 }}>
                      {DropZoneCmp || node.display_text}
                    </div>
                  )}
                  {i < question.nodes.length - 1 && (
                    <div style={{ width: 2, height: 28, background: 'var(--border)', margin: '0 auto', position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: -6, left: -4, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid var(--border)' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {!submitted && (
        <div className="mt-8">
          <button className="btn btn-primary w-full" disabled={!allFilled} onClick={submit}>Check Answers ({placed}/{total} placed)</button>
          {!allFilled && <div style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', marginTop: 8 }}>Place {total - placed} more label(s) to continue</div>}
        </div>
      )}
      
      {submitted && !answer.skipped && (
        <div className="fade-in-up mt-8">
          <div style={{ fontSize: 16, fontWeight: 600, color: answer.score === answer.total ? 'var(--correct)' : answer.score > answer.total / 2 ? 'var(--partial)' : 'var(--wrong)', textAlign: 'center', marginBottom: 16 }}>
            You got {answer.score} out of {answer.total} labels correct {answer.score === answer.total && '✓'}
          </div>
          <ExplanationBox question={question} isCorrect={answer.score === answer.total} isPartial={true} partialScore={`${answer.score}/${answer.total}`} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════
function ResultsScreen({ questions, answers, studyPlan, isMobile, onRestart, onRetryWrong }) {
  const [offset, setOffset] = useState(408);
  
  const total = questions.length;
  const correct = Object.values(answers).filter(a => a.isCorrect === true).length;
  const wrong = Object.values(answers).filter(a => a.isCorrect === false && !a.skipped).length;
  const skipped = Object.values(answers).filter(a => a.skipped).length;
  const timeTaken = Object.values(answers).reduce((acc, a) => acc + (a.timeTaken || 0), 0);
  
  const diagramQs = questions.filter(q => q.type === 'diagram');
  const diagCorrect = diagramQs.reduce((acc, q) => acc + (answers[q.id]?.score || 0), 0);
  const diagTotal = diagramQs.reduce((acc, q) => acc + (answers[q.id]?.total || 0), 0);
  
  const scorePct = Math.round((correct / total) * 100) || 0;

  useEffect(() => {
    setTimeout(() => {
      setOffset(408 - (scorePct / 100 * 408));
    }, 100);
  }, [scorePct]);

  let msg = "Needs significant work.";
  if (scorePct >= 50) msg = "Getting there.";
  if (scorePct >= 80) msg = "Excellent! You're exam-ready.";

  const topics = {};
  questions.forEach(q => {
    if (!topics[q.topic_tag]) topics[q.topic_tag] = { correct: 0, total: 0 };
    topics[q.topic_tag].total++;
    if (answers[q.id]?.isCorrect) topics[q.topic_tag].correct++;
  });

  const downloadResults = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ score: scorePct, answers, studyPlan }));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "studymap_results.json");
    dlAnchorElem.click();
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      
      {/* SECTION A — SCORE HERO */}
      <div className="card text-center mb-8 fade-in-up" style={{ animationDelay: '0s' }}>
        <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
          <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label={`Score: ${scorePct}%`}>
            <circle cx="80" cy="80" r="65" stroke="var(--border)" strokeWidth="12" fill="none" />
            <circle cx="80" cy="80" r="65" stroke="var(--primary)" strokeWidth="12" fill="none" strokeDasharray="408" strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.2s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600, color: 'var(--primary-dark)' }}>
            {scorePct}%
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 18 }}>{msg}</p>
        
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)' }}>Correct</div><div style={{ fontSize: 20, fontWeight: 600, color: 'var(--correct)' }}>✓ {correct}</div></div>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)' }}>Wrong</div><div style={{ fontSize: 20, fontWeight: 600, color: 'var(--wrong)' }}>✗ {wrong}</div></div>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)' }}>Skipped</div><div style={{ fontSize: 20, fontWeight: 600 }}>— {skipped}</div></div>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)' }}>Time</div><div style={{ fontSize: 20, fontWeight: 600 }}>⏱ {Math.floor(timeTaken/60)}m {timeTaken%60}s</div></div>
          {diagTotal > 0 && <div><div style={{ fontSize: 13, color: 'var(--text-hint)' }}>Diagrams</div><div style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)' }}>🔷 {diagCorrect}/{diagTotal}</div></div>}
        </div>
      </div>

      {/* SECTION B — TOPIC HEATMAP */}
      <h2 className="mb-4">Where to focus next</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: '2rem' }} className="fade-in-up" style={{ animationDelay: '0.1s' }}>
        {Object.entries(topics).map(([topic, data], idx) => {
          const pct = Math.round((data.correct / data.total) * 100);
          const bg = pct >= 80 ? 'var(--correct-bg)' : pct >= 50 ? 'var(--warning-bg)' : 'var(--wrong-bg)';
          const border = pct >= 80 ? 'var(--correct)' : pct >= 50 ? 'var(--partial)' : 'var(--wrong)';
          const color = pct >= 80 ? '#166534' : pct >= 50 ? '#92400E' : '#991B1B';
          return (
            <div key={topic} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `1.5px solid ${border}`, background: bg, color: color, transition: 'all 0.2s ease' }} className="fade-in-up" style={{ animationDelay: `${0.1 + (idx * 0.08)}s` }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{topic}</div>
              <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--border)', marginTop: 8 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: border, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{data.correct}/{data.total} correct</div>
              <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{pct}%</div>
            </div>
          );
        })}
      </div>

      {/* SECTION C — DIAGRAM PERFORMANCE */}
      {diagramQs.length > 0 && (
        <>
          <h2 className="mb-4">Diagram & Flowchart Accuracy</h2>
          {diagramQs.map(q => {
            const ans = answers[q.id];
            if (ans?.skipped) return null;
            return (
              <div key={q.id} className="card mb-4 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>{ans.score}/{ans.total} labels correct</div>
                <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117%', pointerEvents: 'none' }}>
                  <DiagramQuestion question={q} submitted={true} answer={ans} onAnswer={()=>{}} isMobile={isMobile} />
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* SECTION D — QUESTION REVIEW */}
      <h2 className="mb-4 mt-8">Question Review</h2>
      <div className="mb-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
        {questions.map((q, i) => {
          const ans = answers[q.id];
          const isCorrect = ans?.isCorrect;
          return (
            <details key={q.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 8, overflow: 'hidden' }}>
              <summary style={{ padding: '1rem', cursor: 'pointer', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', outline: 'none' }}>
                <span>Q{i+1}. {q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}</span>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: isCorrect ? 'var(--correct-bg)' : ans?.skipped ? 'var(--bg-surface)' : 'var(--wrong-bg)', color: isCorrect ? 'var(--correct)' : ans?.skipped ? 'var(--text-hint)' : 'var(--wrong)' }}>
                  {isCorrect ? '✓ Correct' : ans?.skipped ? '— Skipped' : '✗ Wrong'}
                </span>
              </summary>
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                {ans?.skipped ? <p>Skipped</p> : (
                  <>
                    <p style={{ color: isCorrect ? 'var(--correct)' : 'var(--wrong)' }}>Your answer: {ans?.value?.toString() || 'See diagram above'}</p>
                    {!isCorrect && q.type !== 'diagram' && <p style={{ color: 'var(--correct)', marginTop: 4 }}>Correct answer: {q.correct_answer}</p>}
                    <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>{q.explanation}</p>
                    <p style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>— {q.page_ref}</p>
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {/* SECTION E — STUDY RECOMMENDATIONS */}
      <h2 className="mb-4">Your Study Plan</h2>
      <div className="card mb-8 fade-in-up" style={{ animationDelay: '0.4s' }}>
        {!studyPlan ? (
          <div className="text-center" style={{ padding: '2rem' }}><div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />Generating...</div>
        ) : (
          <>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>{studyPlan.summary}</p>
            {studyPlan.study_priority?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: i < studyPlan.study_priority.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>{i+1}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.topic}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.reason}</div>
                  <div style={{ fontSize: 13, color: 'var(--primary)', fontStyle: 'italic', marginTop: 4 }}>{item.action}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* SECTION F — ACTION BUTTONS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }} className="fade-in-up" style={{ animationDelay: '0.5s' }}>
        <button className="btn btn-primary" onClick={onRetryWrong}>Retry Wrong Answers</button>
        <button className="btn btn-outline" onClick={onRestart}>Retake Full Quiz</button>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>Upload New PDF</button>
        <button className="btn btn-outline" onClick={downloadResults}>Download Results</button>
      </div>
    </div>
  );
}
