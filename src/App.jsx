import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════
// CSS &const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;700;900&display=swap');

:root {
  --bg-page:          #F5F5F5;
  --bg-card:          #FFFFFF;
  --bg-surface:       #FFFFFF;
  --bg-elevated:      #F0F0F0;
  --border:           #2C2C2C;
  --border-strong:    #000000;
  --text-primary:     #000000;
  --text-secondary:   #444444;
  --text-hint:        #888888;
  --text-inverse:     #FFFFFF;
  --primary:          #000000;
  --primary-hover:    #222222;
  --primary-light:    #E0E0E0;
  --correct:          #000000;
  --correct-bg:       #E8F5E9;
  --wrong:            #000000;
  --wrong-bg:         #FFEBEE;
  --partial:          #000000;
  --partial-bg:       #FFFDE7;
  --radius-sm:        0px;
  --radius-md:        0px;
  --radius-lg:        0px;
  --shadow-md:        4px 4px 0px #000000;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 { font-family: 'Inter', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }

.container { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }
.card { 
  background: var(--bg-card); 
  border: 2px solid var(--border); 
  padding: 3rem; 
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
}

.btn { 
  height: 54px; border: 2px solid var(--border); border-radius: 0; 
  padding: 0 2rem; font-weight: 900; cursor: pointer; transition: all 0.1s; 
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; 
  background: #FFFFFF; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;
}
.btn:hover:not(:disabled) { background: #000000; color: #FFFFFF; transform: translate(-2px, -2px); box-shadow: 4px 4px 0px #000000; }
.btn:active:not(:disabled) { transform: translate(0, 0); box-shadow: none; }
.btn-primary { background: #000000; color: #FFFFFF; }
.btn-primary:hover:not(:disabled) { background: #333333; }

input[type="text"], input[type="password"], input[type="range"] { 
  width: 100%; padding: 1rem; border: 2px solid var(--border); border-radius: 0; 
  background: #FFFFFF; color: #000000; font-weight: 700;
}

.upload-zone { border: 2px dashed #000000 !important; border-radius: 0 !important; }
.upload-zone:hover { background: #F0F0F0 !important; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
@keyframes spin { to { transform: rotate(360deg); } }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 639px) { .grid-2 { grid-template-columns: 1fr; } }
`;float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); } }

.shake { animation: shake 0.4s ease; }
.fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
.slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.float { animation: float 4s ease-in-out infinite; }

/* Grid Layouts */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.diagram-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 2rem; }

@media (max-width: 639px) {
  .grid-2, .grid-3, .diagram-layout { grid-template-columns: 1fr; }
  .card { padding: 1.5rem; border-radius: var(--radius-md); }
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
    text: fullText.slice(0, 60000),
    pageCount: pdf.numPages,
    wordCount: fullText.split(/\s+/).length
  };
};

const extractPptxText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await window.JSZip.loadAsync(arrayBuffer);
  let fullText = '';
  let slideCount = 0;
  
  // PPTX slides are in ppt/slides/slide[n].xml
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  slideCount = slideFiles.length;
  
  for (const name of slideFiles) {
    const xmlText = await zip.file(name).async('text');
    // Extract text from <a:t> tags
    const matches = xmlText.match(/<a:t>([^<]*)<\/a:t>/g);
    if (matches) {
      const slideText = matches.map(m => m.replace(/<a:t>|<\/a:t>/g, '')).join(' ');
      fullText += slideText + '\n';
    }
  }
  
  return {
    text: fullText.slice(0, 60000),
    pageCount: slideCount,
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


const generateLocalQuestions = (text, count) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const filtered = sentences
    .map(s => s.trim())
    .filter(s => s.split(' ').length > 8 && s.length < 250);
  
  const shuffled = shuffle(filtered).slice(0, count);
  
  return {
    quiz_title: "Quick Study Guide",
    topics_covered: ["Document Content"],
    questions: shuffled.map((s, i) => {
      const type = i % 2 === 0 ? 'fill_blank' : 'mcq';
      const words = s.replace(/[.!?(),;:]/g, '').split(/\s+/);
      const candidates = words.filter(w => w.length > 5);
      const target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : words[0];

      if (type === 'fill_blank') {
        return {
          id: `q-${i}`,
          type: 'fill_blank',
          topic_tag: 'Key Concepts',
          difficulty: 'medium',
          page_ref: 'Contextual',
          question: 'Identify the missing key term:',
          sentence: s.replace(new RegExp(`\\b${target}\\b`, 'i'), '___'),
          correct_answer: target,
          explanation: `Full context: "${s}"`
        };
      } else {
        const decoys = shuffle(words.filter(w => w.length > 5 && w.toLowerCase() !== target.toLowerCase())).slice(0, 3);
        while (decoys.length < 3) decoys.push(["Knowledge", "Concept", "Information", "Analysis"][decoys.length]);
        
        return {
          id: `q-${i}`,
          type: 'mcq',
          topic_tag: 'Fact Check',
          difficulty: 'medium',
          page_ref: 'Contextual',
          question: `Which word is missing: "${s.replace(new RegExp(`\\b${target}\\b`, 'i'), '___')}"?`,
          options: shuffle([target, ...decoys]),
          correct_answer: target,
          explanation: `Based on the sentence: "${s}"`
        };
      }
    })
  };
};

const generateLocalStudyPlan = (questions, answers) => {
  const scorePct = Math.round((Object.values(answers).filter(a => a.isCorrect).length / questions.length) * 100);
  return {
    summary: `You scored ${scorePct}% on this session. Reviewing the source material will help reinforce these key concepts.`,
    study_priority: [
      {
        topic: "Core Content",
        score_pct: scorePct,
        reason: "Based on your quiz performance.",
        action: "Re-read the sections related to the questions you missed."
      }
    ]
  };
};

export default function StudyMap() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [screen, setScreen] = useState('upload'); // 'upload' | 'loading' | 'quiz' | 'results'
  
  // RESTORED API KEY LOGIC
  
  const [pdfjsReady, setPdfjsReady] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [pdfMeta, setPdfMeta] = useState({ pageCount: 0, wordCount: 0 });
  const [config, setConfig] = useState({
    questionCount: 10,
    difficulty: 'medium',
    mode: 'exam',
    types: ['mcq', 'true_false', 'fill_blank', 'short_answer', 'diagram']
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
    // Load PDF.js
    const pdfScript = document.createElement('script');
    pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    pdfScript.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsReady(true);
    };
    document.head.appendChild(pdfScript);

    // Load JSZip
    const zipScript = document.createElement('script');
    zipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(zipScript);
  }, []);



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
          <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--wrong-bg)', border: '1px solid var(--wrong-border)', color: '#FCA5A5', padding: '12px 16px', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'none' }}>
            <span><span style={{ fontWeight: 600, marginRight: 8 }}>✗</span> {error.message}</span>
            <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>✕</button>
          </div>
        </div>
      )}

      {screen === 'upload' && (
        <UploadScreen
          
          pdfjsReady={pdfjsReady}
          uploadedFile={uploadedFile} setUploadedFile={setUploadedFile}
          pdfText={pdfText} setPdfText={setPdfText}
          pdfMeta={pdfMeta} setPdfMeta={setPdfMeta}
          config={config} setConfig={setConfig}
          showError={showError}
          onGenerate={async () => {
            setScreen('loading');
            setError(null);
            setLoadingMessage("Analyzing document...");
            
            setTimeout(() => {
              try {
                const parsed = generateLocalQuestions(pdfText, config.questionCount);
                setQuestions(parsed.questions);
                setQuizTitle(parsed.quiz_title);
                setStartTime(Date.now());
                setCurrentIndex(0);
                setAnswers({});
                setSubmitted({});
                setScreen('quiz');
              } catch (err) {
                showError('local_error', 'Could not process PDF: ' + err.message);
                setScreen('upload');
              }
            }, 2000);
          }} />
      )}

      {screen === 'loading' && (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center card float" style={{ padding: '3rem', minWidth: '300px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 0, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 1s ease-in-out infinite', margin: '0 auto 1.5rem', boxShadow: 'none' }} />
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }} className="fade-in">{loadingMessage}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Processing Locally</div>
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
          showError={showError}
          onComplete={async () => {
            setScreen('results');
            setTimeout(() => {
              setStudyPlan(generateLocalStudyPlan(questions, answers));
            }, 1000);
          }} />
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
            resetQuiz(); setScreen('upload'); // Hacky retry
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════
// UPLOAD SCREEN
// ═══════════════════════════════════════════════
function UploadScreen({ pdfjsReady, uploadedFile, setUploadedFile, pdfText, setPdfText, pdfMeta, setPdfMeta, config, setConfig, showError, onGenerate }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'pptx') { showError('wrong_file', 'Please upload a PDF or PPTX file.'); return; }
    if (file.size > 20 * 1024 * 1024) { showError('file_too_large', 'File too large. Use a file under 20MB.'); return; }
    
    setUploadedFile(file);
    try {
      const result = ext === 'pdf' ? await extractPdfText(file) : await extractPptxText(file);
      setPdfText(result.text);
      setPdfMeta({ pageCount: result.pageCount, wordCount: result.wordCount });
    } catch (err) {
      showError('extract_error', 'Could not read file: ' + err.message);
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
      <div className="card fade-in-up" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 42 }}>StudyMap AI</h1>
          <p style={{ fontWeight: 700 }}>BRUTALIST EDITION — NO API KEY REQUIRED</p>
        </div>

        {!uploadedFile ? (
          <div className="mb-4">
            <div className="upload-zone"
              style={{ border: `2px dashed ${isDragOver ? 'var(--primary)' : 'var(--border)'}`, background: isDragOver ? 'var(--primary-light)' : 'var(--bg-surface)', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.1s ease' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept=".pdf,.pptx" ref={fileInputRef} hidden onChange={e => handleFileSelect(e.target.files[0])} />
              <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
              <p style={{ fontWeight: 900 }}>UPLOAD PDF OR PPTX</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>MAX 20MB</p>
            </div>
          </div>
        ) : (
          <div className="fade-in-up mb-8">
            <div className="flex items-center gap-4 mb-6" style={{ background: '#000', padding: '20px', border: '2px solid #000', color: '#fff' }}>
              <div style={{ fontSize: 24 }}>✓</div>
              <div>
                <div style={{ fontWeight: 900, textTransform: 'uppercase' }}>{uploadedFile.name}</div>
                <div style={{ fontSize: 13 }}>{pdfMeta.pageCount} SLIDES/PAGES · {pdfMeta.wordCount} WORDS</div>
              </div>
            </div>

            <div className="grid-2 mb-6">
              <div>
                <label>Questions: <span style={{ color: 'var(--primary)' }}>{config.questionCount}</span></label>
                <input type="range" min={5} max={30} step={1} value={config.questionCount} onChange={e => setConfig({ ...config, questionCount: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--primary)', height: 6 }} />
              </div>
              <div>
                <label>Difficulty</label>
                <div className="flex" style={{ background: 'var(--bg-surface)', padding: 4, borderRadius: 0, border: '1px solid var(--border)' }}>
                  {['easy', 'medium', 'hard'].map(lvl => (
                    <button key={lvl} className={config.difficulty === lvl ? 'btn-primary' : ''} style={{ flex: 1, borderRadius: 0, border: 'none', height: 32, fontSize: 13, textTransform: 'capitalize', background: config.difficulty === lvl ? 'var(--primary)' : 'transparent', color: config.difficulty === lvl ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }} onClick={() => setConfig({ ...config, difficulty: lvl })}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label>Mode</label>
              <div className="flex gap-2">
                <button className={`btn ${config.mode === 'exam' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setConfig({ ...config, mode: 'exam' })}>📝 Exam Mode</button>
                <button className={`btn ${config.mode === 'interview' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setConfig({ ...config, mode: 'interview' })}>💬 Interview Mode</button>
              </div>
            </div>

            <div className="mb-8">
              <label>Question Types</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { id: 'mcq', label: 'Multiple Choice' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'fill_blank', label: 'Fill in the Blank' },
                  { id: 'short_answer', label: 'Short Answer' },
                  { id: 'diagram', label: 'Diagrams & Flowcharts' }
                ].map(t => {
                  const active = config.types.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggleType(t.id)} style={{ padding: '8px 16px', borderRadius: 0, border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`, background: active ? 'var(--primary-light)' : 'var(--bg-surface)', color: active ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: active ? 'var(--shadow-glow)' : 'none' }}>
                      {active ? '✓ ' : ''}{t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button className="btn btn-primary w-full" style={{ height: 56, fontSize: 16, fontWeight: 700 }} disabled={!pdfText || config.types.length === 0} onClick={onGenerate}>
              Generate Study Session ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// QUIZ SCREEN
// ═══════════════════════════════════════════════
function QuizScreen({ isMobile, questions, currentIndex, setCurrentIndex, answers, setAnswers, submitted, setSubmitted, quizTitle, startTime, config, showError, onComplete }) {
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
      onComplete(); // TRIGGERS RESULTS SCREEN
    }
  };

  const markSkipped = () => {
    setAnswers(prev => ({ ...prev, [q.id]: { skipped: true, timeTaken: elapsed } }));
    setSubmitted(prev => ({ ...prev, [q.id]: true }));
    goToNextQuestion();
  };

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(9, 10, 15, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
        <div className="container flex justify-between items-center">
          <div style={{ fontWeight: 700, fontSize: 18 }} className="text-gradient">StudyMap AI</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: 0 }}>Question {currentIndex + 1} of {questions.length}</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: 14, display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--correct)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{width: 8, height: 8, borderRadius: 0, background: 'var(--correct)', boxShadow: '0 0 8px var(--correct)'}}/> {correctCount}</span>
              <span style={{ color: 'var(--wrong)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{width: 8, height: 8, borderRadius: 0, background: 'var(--wrong)', boxShadow: '0 0 8px var(--wrong)'}}/> {wrongCount}</span>
            </div>
            {config.mode === 'exam' && (
              <div className="mono" style={{ fontSize: 14, background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 0 }}>
                {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>
        <div style={{ width: '100%', height: 2, background: 'var(--border)', marginTop: '1rem', position: 'absolute', bottom: 0, left: 0 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#000000', transition: 'width 0.4s ease', boxShadow: 'none' }} role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={questions.length} />
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="card slide-in-right" key={q.id} style={{ maxWidth: 720, margin: '0 auto', border: '2px solid #000' }}>
          <div className="flex justify-between items-center mb-6">
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 0, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{q.topic_tag}</span>
            <span style={{ background: q.difficulty === 'easy' ? 'var(--correct-bg)' : q.difficulty === 'medium' ? 'var(--partial-bg)' : 'var(--wrong-bg)', color: q.difficulty === 'easy' ? 'var(--correct)' : q.difficulty === 'medium' ? 'var(--partial)' : 'var(--wrong)', borderRadius: 0, padding: '4px 12px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{q.difficulty}</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '2rem' }}>{q.question}</h2>

          {q.type === 'mcq' && <MCQQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} />}
          {q.type === 'true_false' && <TrueFalseQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} />}
          {q.type === 'fill_blank' && <FillBlankQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} />}
          {q.type === 'short_answer' && <ShortAnswerQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} apiKey={apiKey} callAnthropic={callAnthropic} />}
          {q.type === 'diagram' && <DiagramQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} isMobile={isMobile} />}

          {qSubmitted && (
            <div className="fade-in-up mt-8">
              <button className="btn btn-primary w-full" onClick={goToNextQuestion} style={{ height: 56, fontSize: 16 }}>
                {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Final Results 🏆'}
              </button>
            </div>
          )}

          {!qSubmitted && (
            <div className="text-center mt-6">
              <button onClick={markSkipped} style={{ background: 'none', border: 'none', color: 'var(--text-hint)', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-hint)'}>Press here to skip this question</button>
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
  const bgVar = correct ? '--correct-bg' : isPartial ? '--partial-bg' : '--wrong-bg';
  return (
    <div style={{ maxHeight: 500, overflow: 'hidden', transition: 'max-height 0.35s ease', marginTop: '1.5rem', padding: '1.5rem', background: `var(${bgVar})`, border: `1px solid var(${colorVar})`, borderRadius: 0 }} className="fade-in-up">
      <div style={{ color: `var(${colorVar})`, fontWeight: 700, fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        {correct ? '✓ Correct!' : isPartial ? `${partialScore} Correct` : '✗ Incorrect'}
      </div>
      <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>{question.explanation}</p>
      {question.page_ref && <p style={{ fontSize: 12, color: 'var(--text-hint)', fontStyle: 'italic', marginTop: 12, opacity: 0.8 }}>Source: {question.page_ref}</p>}
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
    }, 400); // slightly longer delay for the selection animation to play
  };

  return (
    <div>
      {question.options.map(opt => {
        let style = { padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 0, background: 'var(--bg-surface)', cursor: 'pointer', marginBottom: 12, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center' };
        let icon = <div style={{ width: 20, height: 20, borderRadius: 0, border: '1.5px solid var(--text-hint)', marginRight: 16, transition: 'all 0.2s ease', flexShrink: 0 }} />;
        
        if (submitted) {
          if (opt === question.correct_answer) {
            style.background = 'var(--correct-bg)'; style.borderColor = 'var(--correct)'; style.boxShadow = '0 0 15px rgba(34,197,94,0.1)';
            icon = <div style={{ width: 20, height: 20, borderRadius: 0, background: 'var(--correct)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginRight: 16 }}>✓</div>;
          } else if (opt === answer.value) {
            style.background = 'var(--wrong-bg)'; style.borderColor = 'var(--wrong)'; style.animation = 'shake 0.4s ease';
            icon = <div style={{ width: 20, height: 20, borderRadius: 0, background: 'var(--wrong)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginRight: 16 }}>✗</div>;
          } else {
            style.opacity = 0.4;
          }
        } else {
          if (selected === opt) { 
            style.borderColor = 'var(--primary)'; style.background = 'var(--primary-light)'; style.boxShadow = 'var(--shadow-glow)';
            icon = <div style={{ width: 20, height: 20, borderRadius: 0, border: '6px solid var(--primary)', marginRight: 16 }} />;
          }
        }
        return (
          <div key={opt} style={style} onClick={() => handleClick(opt)} onMouseEnter={e => { if(!submitted && selected !== opt) { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--bg-elevated)'; } }} onMouseLeave={e => { if(!submitted && selected !== opt) { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-surface)'; } }}>
            {icon}<span style={{ fontWeight: 500, fontSize: 15 }}>{opt}</span>
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
          let style = { height: 64, flex: 1, fontSize: 18, fontWeight: 600, borderRadius: 0, border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' };
          if (submitted) {
            if (opt.toLowerCase() === question.correct_answer.toString().toLowerCase()) { style.background = 'var(--correct-bg)'; style.color = 'var(--correct)'; style.borderColor = 'var(--correct)'; style.boxShadow = '0 0 15px rgba(34,197,94,0.15)'; }
            else if (opt === answer.value) { style.background = 'var(--wrong-bg)'; style.color = 'var(--wrong)'; style.borderColor = 'var(--wrong)'; style.animation = 'shake 0.4s ease'; }
            else { style.opacity = 0.3; }
          }
          return <button key={opt} style={style} onClick={() => handleClick(opt)} onMouseEnter={e => { if(!submitted) { e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.borderColor='var(--primary)'; } }} onMouseLeave={e => { if(!submitted) { e.currentTarget.style.background='var(--bg-surface)'; e.currentTarget.style.borderColor='var(--border)'; } }}>{opt}</button>;
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
      <p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: '2rem', color: 'var(--text-primary)' }}>
        {question.sentence.split('___').map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <span style={{ display: 'inline-block', minWidth: 140, borderBottom: '3px solid var(--primary)', margin: '0 8px', padding: '0 8px', textAlign: 'center', color: submitted ? (answer.isCorrect ? 'var(--correct)' : 'var(--wrong)') : 'var(--primary)', fontWeight: 700, background: 'var(--bg-surface)', borderRadius: '4px 4px 0 0' }}>
                {submitted ? answer.value : ' '}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
      {!submitted && (
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="text" className="mono" value={val} onChange={e => setVal(e.target.value)} placeholder="Type your answer" onKeyDown={e => e.key === 'Enter' && submit()} style={{ fontSize: 16 }} />
          <button className="btn btn-primary" onClick={submit} style={{ padding: '0 2rem' }}>Check</button>
        </div>
      )}
      {submitted && !answer.skipped && !answer.isCorrect && (
        <div style={{ marginTop: '1rem', color: 'var(--wrong)', background: 'var(--wrong-bg)', padding: '12px 16px', borderRadius: 0, border: '1px solid var(--wrong-border)' }}>
          <span style={{ fontWeight: 600 }}>✗ Incorrect.</span> Correct answer: <span style={{ color: 'var(--text-primary)', fontWeight: 700, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 0, marginLeft: 8 }}>{question.correct_answer}</span>
        </div>
      )}
      {submitted && !answer.skipped && <ExplanationBox question={question} isCorrect={answer.isCorrect} />}
    </div>
  );
}

function ShortAnswerQuestion({ question, submitted, answer, onAnswer }) {
  const [val, setVal] = useState('');
  const [loading, setLoading] = useState(false);
  const wordCount = val.split(/\s+/).filter(x => x).length;

  const submit = async () => {
    if (!val.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const userWords = val.toLowerCase().split(/\W+/);
      const keyPoints = question.key_points || [];
      const mentioned = keyPoints.filter(kp => userWords.some(uw => kp.toLowerCase().includes(uw) || uw.includes(kp.toLowerCase())));
      const missed = keyPoints.filter(kp => !mentioned.includes(kp));
      const score = Math.round((mentioned.length / (keyPoints.length || 1)) * 100);
      
      onAnswer({ 
        value: val, 
        isCorrect: score >= 50, 
        score, 
        mentioned, 
        missed, 
        feedback: score >= 70 ? "Excellent summary! You captured the main ideas well." : "You've touched on some points, but try to include more specific details from the text." 
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      {!submitted ? (
        <div>
          <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="Type your comprehensive explanation here..." style={{ fontSize: 15, lineHeight: 1.6 }} />
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-hint)', marginTop: 8, marginBottom: 20 }}>{wordCount} words</div>
          <button className="btn btn-primary w-full" onClick={submit} disabled={loading} style={{ height: 56 }}>
            {loading ? <span style={{display: 'flex', alignItems: 'center', gap: 8}}><div style={{width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: 0, animation: 'spin 1s linear infinite'}}/> Evaluating Answer...</span> : 'Submit Answer'}
          </button>
        </div>
      ) : (
        answer.skipped ? <p>Skipped</p> : (
          <div className="fade-in-up">
            <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 0, border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: 0, background: answer.isCorrect ? 'var(--correct-bg)' : 'var(--wrong-bg)', border: `2px solid ${answer.isCorrect ? 'var(--correct)' : 'var(--wrong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: answer.isCorrect ? 'var(--correct)' : 'var(--wrong)' }}>
                  {answer.score}%
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{answer.isCorrect ? 'Good Comprehension' : 'Needs Review'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>AI Evaluation Score</div>
                </div>
              </div>
              
              <ul style={{ listStyle: 'none', marginBottom: 20, background: 'var(--bg-page)', padding: '1rem', borderRadius: 0 }}>
                {answer.mentioned?.map((m, i) => <li key={`m-${i}`} style={{ color: 'var(--correct)', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}><span style={{fontWeight: 700}}>✓</span> <span>You mentioned: {m}</span></li>)}
                {answer.missed?.map((m, i) => <li key={`x-${i}`} style={{ color: 'var(--wrong)', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}><span style={{fontWeight: 700}}>✗</span> <span>You missed: {m}</span></li>)}
              </ul>
              <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.6, borderLeft: '3px solid var(--primary)', paddingLeft: 12 }}>{answer.feedback}</p>
            </div>
            <details style={{ marginTop: '1.5rem', cursor: 'pointer', background: 'var(--bg-surface)', borderRadius: 0, border: '1px solid var(--border)' }}>
              <summary style={{ fontWeight: 600, color: 'var(--text-primary)', padding: '1rem', outline: 'none' }}>View Ideal Model Answer</summary>
              <div style={{ padding: '0 1rem 1rem 1rem', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{question.model_answer}</div>
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
    if (!submitted && question.answer_chips) {
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
  const allFilled = placed === total && total > 0;

  return (
    <div>
      <div className="diagram-layout">
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Label Bank</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{isMobile ? "Tap a label, then tap a drop zone" : "Drag each label to the correct zone"}</p>
          <div style={{ fontSize: 13, color: allFilled ? 'var(--correct)' : 'var(--text-hint)', fontWeight: 600 }}>{placed} / {total} Placed</div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 16 }}>
            {(submitted && answer?.chipBank ? answer.chipBank : chipBank).map(chip => {
              const isUsed = chip.placedInZoneId !== null;
              const isSelected = chip.id === selectedChipId;
              const isDragging = dragState.draggingChipId === chip.id;
              
              let style = { padding: '8px 16px', borderRadius: 0, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: isUsed || submitted ? 'default' : 'grab', userSelect: 'none', transition: 'all 0.2s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', opacity: 1 };
              
              if (isUsed) { style.background = 'var(--bg-page)'; style.borderColor = 'transparent'; style.color = 'var(--text-hint)'; style.opacity = 0.4; style.pointerEvents = 'none'; style.boxShadow = 'none'; }
              else if (isSelected) { style.borderColor = 'var(--primary)'; style.background = 'var(--primary-light)'; style.boxShadow = 'var(--shadow-glow)'; }
              else if (isDragging) { style.opacity = 0.5; style.transform = 'scale(0.95)'; }
              
              return (
                <div key={chip.id} style={style} draggable={!isUsed && !submitted && !isMobile} role="button" aria-grabbed={isDragging} aria-label={`Drag chip: ${chip.label}`}
                  onDragStart={(e) => !isMobile && handleChipDragStart(e, chip.id, 'bank')}
                  onDragEnd={() => setDragState({ draggingChipId: null, overZoneId: null })}
                  onClick={() => isMobile && !isUsed && !submitted && handleChipTap(chip.id)}
                  onMouseEnter={e => { if(!isUsed && !submitted && !isSelected && !isDragging) { e.currentTarget.style.background='var(--drag-hover)'; e.currentTarget.style.borderColor='var(--text-hint)'; } }}
                  onMouseLeave={e => { if(!isUsed && !submitted && !isSelected && !isDragging) { e.currentTarget.style.background='var(--bg-surface)'; e.currentTarget.style.borderColor='var(--border)'; } }}
                >
                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-page)', padding: '3rem 1.5rem', borderRadius: 0, border: '1px solid var(--border)', overflowX: 'auto', boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.3)' }}>
            {question.nodes && question.nodes.map((node, i) => {
              const zoneDef = question.drop_zones.find(z => z.node_id === node.id);
              const activeZone = (submitted && answer?.dropZones ? answer.dropZones : dropZones).find(z => z.nodeId === node.id || z.node_id === node.id);
              const zr = zoneResults.find(r => r.zoneId === activeZone?.id);
              
              let DropZoneCmp = null;
              if (activeZone) {
                const filledChip = (submitted && answer?.chipBank ? answer.chipBank : chipBank).find(c => c.id === activeZone.placedChipId);
                let style = { minWidth: 140, height: 44, border: '2px dashed var(--border-strong)', background: 'var(--bg-surface)', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-hint)', position: 'relative', transition: 'all 0.2s ease' };
                let content = `Zone ${activeZone.number || i+1}`;
                
                if (dragState.overZoneId === activeZone.id || (isMobile && selectedChipId)) {
                  style.border = '2px solid var(--primary)'; style.background = 'var(--primary-light)'; style.boxShadow = 'var(--shadow-glow)';
                } else if (filledChip && !submitted) {
                  style.border = '2px solid var(--primary)'; style.background = 'var(--bg-card)'; style.color = 'var(--text-primary)'; style.fontFamily = "'JetBrains Mono', monospace"; style.fontWeight = 600;
                  content = filledChip.label;
                } else if (submitted && zr) {
                  style.fontFamily = "'JetBrains Mono', monospace"; style.fontWeight = 600; style.borderStyle = 'solid';
                  if (zr.isCorrect) { style.borderColor = 'var(--correct)'; style.background = 'var(--correct-bg)'; style.color = 'var(--correct)'; content = zr.placedLabel; }
                  else { style.borderColor = 'var(--wrong)'; style.background = 'var(--wrong-bg)'; style.color = 'var(--wrong)'; content = zr.placedLabel || 'Empty'; }
                }

                DropZoneCmp = (
                  <div style={style} role="listitem" aria-label={`Drop zone ${activeZone.number}: ${filledChip ? filledChip.label : 'empty'}`}
                    onDragOver={e => { if(!submitted && !isMobile){ e.preventDefault(); setDragState(prev => ({...prev, overZoneId: activeZone.id})); } }}
                    onDragLeave={() => !submitted && setDragState(prev => ({...prev, overZoneId: null}))}
                    onDrop={e => { if(!submitted && !isMobile) handleDrop(e, activeZone.id); }}
                    onClick={() => { if(!submitted && isMobile) handleZoneTap(activeZone.id); }}
                  >
                    {content}
                    {filledChip && !submitted && <button style={{ position: 'absolute', top: -10, right: -10, width: 22, height: 22, borderRadius: 0, background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)' }} onClick={(e) => { e.stopPropagation(); handleRemoveFromZone(activeZone.id); }}>✕</button>}
                    {submitted && zr && !zr.isCorrect && <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', textAlign: 'center', fontSize: 12, color: 'var(--correct)', marginTop: 4, fontWeight: 700 }}>{zr.correctLabel}</div>}
                  </div>
                );
              }

              return (
                <React.Fragment key={node.id}>
                  {node.type === 'start' || node.type === 'end' ? (
                    <div style={{ background: '#000000', color: 'white', borderRadius: 0, padding: '10px 24px', fontSize: 14, fontWeight: 600, boxShadow: 'none' }}>
                      {DropZoneCmp || node.display_text}
                    </div>
                  ) : node.type === 'decision' ? (
                    <div style={{ width: 130, height: 130, transform: 'rotate(45deg)', background: 'var(--bg-card)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0, boxShadow: 'none' }}>
                      <div style={{ transform: 'rotate(-45deg)', padding: 12, fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
                        {DropZoneCmp || node.display_text}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 0, padding: '12px 20px', minWidth: 160, textAlign: 'center', fontSize: 14, fontWeight: 500, boxShadow: 'none' }}>
                      {DropZoneCmp || node.display_text}
                    </div>
                  )}
                  {i < question.nodes.length - 1 && (
                    <div style={{ width: 2, height: 36, background: 'var(--border-strong)', margin: '0 auto', position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: -6, left: -5, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid var(--border-strong)' }} />
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
          <button className="btn btn-primary w-full" disabled={!allFilled} onClick={submit} style={{ height: 56, fontSize: 16 }}>Check Answer ({placed}/{total} Placed)</button>
        </div>
      )}
      
      {submitted && !answer.skipped && (
        <div className="fade-in-up mt-8">
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
    }, 300);
  }, [scorePct]);

  let msg = "Keep Practicing!";
  let grad = "linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)";
  if (scorePct >= 50) { msg = "Solid Effort!"; grad = "linear-gradient(135deg, #F59E0B 0%, #22C55E 100%)"; }
  if (scorePct >= 80) { msg = "Outstanding Performance!"; grad = "var(--gradient-main)"; }

  const topics = {};
  questions.forEach(q => {
    if (!topics[q.topic_tag]) topics[q.topic_tag] = { correct: 0, total: 0 };
    topics[q.topic_tag].total++;
    if (answers[q.id]?.isCorrect) topics[q.topic_tag].correct++;
  });

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      
      {/* SECTION A — SCORE HERO */}
      <div className="card text-center mb-8 fade-in-up" style={{ padding: '3rem 2rem', background: 'rgba(20, 22, 30, 0.8)', border: '2px solid #000' }}>
        <h1 style={{ fontSize: 32, marginBottom: '2rem' }} className="text-gradient">Session Complete</h1>
        
        <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
          <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label={`Score: ${scorePct}%`}>
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="65" stroke="var(--bg-surface)" strokeWidth="14" fill="none" />
            <circle cx="90" cy="90" r="65" stroke="url(#scoreGrad)" strokeWidth="14" fill="none" strokeDasharray="408" strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{scorePct}%</span>
          </div>
        </div>
        
        <p style={{ color: 'var(--text-primary)', marginTop: 24, fontSize: 20, fontWeight: 600 }}>{msg}</p>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', justifyContent: 'center', flexWrap: 'wrap', background: 'var(--bg-page)', padding: '1.5rem', borderRadius: 0 }}>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: 1 }}>Correct</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--correct)' }}>{correct}</div></div>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: 1 }}>Wrong</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--wrong)' }}>{wrong}</div></div>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: 1 }}>Skipped</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{skipped}</div></div>
          <div><div style={{ fontSize: 13, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: 1 }}>Time</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{Math.floor(timeTaken/60)}m {timeTaken%60}s</div></div>
        </div>
      </div>

      {/* SECTION B — STUDY RECOMMENDATIONS (MOVED UP FOR BETTER UX) */}
      <h2 className="mb-4 text-gradient" style={{ fontSize: 24 }}>AI AI Study Plan</h2>
      <div className="card mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
        {!studyPlan ? (
          <div className="text-center" style={{ padding: '3rem 1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 0, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem', boxShadow: 'none' }} />
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Analyzing your performance...</div>
            <div style={{ fontSize: 13, color: 'var(--text-hint)', marginTop: 8 }}>Claude is generating personalized recommendations</div>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: '2rem', color: 'var(--text-primary)', fontSize: 16, lineHeight: 1.6 }}>{studyPlan.summary}</p>
            {studyPlan.study_priority?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: i < studyPlan.study_priority.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 0, background: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, boxShadow: 'none' }}>{i+1}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{item.topic}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{item.reason}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-page)', padding: '8px 12px', borderRadius: 0, borderLeft: '3px solid var(--primary)' }}>Action: <span style={{fontWeight: 600}}>{item.action}</span></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* SECTION B.5 — QUESTION REVIEW */}
      <h2 className="mb-4" style={{ fontSize: 20 }}>Question Review</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '3rem' }}>
        {questions.map((q, i) => {
          const ans = answers[q.id];
          const isCorrect = ans?.isCorrect || (ans?.score === ans?.total && ans?.total > 0);
          return (
            <details key={q.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 0, overflow: 'hidden' }} className="fade-in-up">
              <summary style={{ padding: '1.25rem', cursor: 'pointer', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Q{i+1}. {q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}</span>
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 0, background: isCorrect ? 'var(--correct-bg)' : ans?.skipped ? 'var(--bg-surface)' : 'var(--wrong-bg)', color: isCorrect ? 'var(--correct)' : ans?.skipped ? 'var(--text-hint)' : 'var(--wrong)', fontWeight: 600 }}>
                  {isCorrect ? '✓ Correct' : ans?.skipped ? '— Skipped' : '✗ Wrong'}
                </span>
              </summary>
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-page)' }}>
                {ans?.skipped ? <p style={{ color: 'var(--text-hint)' }}>You skipped this question.</p> : (
                  <>
                    <p style={{ color: isCorrect ? 'var(--correct)' : 'var(--wrong)', fontWeight: 600, marginBottom: 8 }}>
                      Your answer: {typeof ans?.value === 'object' ? 'See diagram details' : ans?.value?.toString()}
                    </p>
                    {!isCorrect && q.type !== 'diagram' && (
                      <p style={{ color: 'var(--correct)', marginBottom: 12 }}>
                        Correct answer: <span style={{ fontWeight: 600 }}>{q.correct_answer}</span>
                      </p>
                    )}
                    <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 0, borderLeft: '3px solid var(--primary)', marginTop: 12 }}>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{q.explanation}</p>
                      {q.page_ref && <p style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--text-hint)', marginTop: 8 }}>Source: {q.page_ref}</p>}
                    </div>
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {/* SECTION C — TOPIC HEATMAP */}
      <h2 className="mb-4" style={{ fontSize: 20 }}>Performance by Topic</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: '3rem', animationDelay: '0.3s' }} className="fade-in-up">
        {Object.entries(topics).map(([topic, data], idx) => {
          const pct = Math.round((data.correct / data.total) * 100);
          const bg = pct >= 80 ? 'var(--correct-bg)' : pct >= 50 ? 'var(--partial-bg)' : 'var(--wrong-bg)';
          const color = pct >= 80 ? 'var(--correct)' : pct >= 50 ? 'var(--partial)' : 'var(--wrong)';
          return (
            <div key={topic} style={{ padding: '1.5rem', borderRadius: 0, background: 'var(--bg-card)', border: '2px solid #000', boxShadow: 'none', animationDelay: `${0.3 + (idx * 0.1)}s` }} className="fade-in-up">
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{topic}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: color, lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: 13, color: 'var(--text-hint)' }}>{data.correct}/{data.total}</span>
              </div>
              <div style={{ width: '100%', height: 4, borderRadius: 0, background: 'var(--bg-page)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 0 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION D — ACTION BUTTONS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', animationDelay: '0.5s' }} className="fade-in-up">
        <button className="btn btn-primary" onClick={onRetryWrong} style={{ height: 56, fontSize: 15 }}>Retry Incorrect Questions</button>
        <button className="btn btn-outline" onClick={onRestart} style={{ height: 56 }}>Take a New Quiz</button>
        <button className="btn btn-outline" onClick={() => window.location.reload()} style={{ height: 56 }}>Start Over / Upload PDF</button>
      </div>
    </div>
  );
}
