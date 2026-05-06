import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════
// CSS & THEME
// ═══════════════════════════════════════════════
const STYLES = `
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
  --shadow-sm:        2px 2px 0px #000000;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3 { font-family: 'Inter', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }

.container { width: 100%; max-width: 900px; margin: 0 auto; padding: 0 1rem; }
.card { 
  background: var(--bg-card); 
  border: 2px solid var(--border); 
  padding: 2rem; 
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  width: 100%;
}

@media (min-width: 640px) {
  .card { padding: 3rem; }
}

.btn { 
  height: auto; min-height: 54px; border: 2px solid var(--border); border-radius: 0; 
  padding: 0.75rem 1.5rem; font-weight: 900; cursor: pointer; transition: all 0.1s; 
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; 
  background: #FFFFFF; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;
  font-size: 0.9rem;
}
.btn:hover:not(:disabled) { background: #000000; color: #FFFFFF; transform: translate(-2px, -2px); box-shadow: var(--shadow-md); }
.btn:active:not(:disabled) { transform: translate(0, 0); box-shadow: none; }
.btn-primary { background: #000000; color: #FFFFFF; }
.btn-primary:hover:not(:disabled) { background: #333333; }

input[type="text"], input[type="password"], input[type="range"] { 
  width: 100%; padding: 1rem; border: 2px solid var(--border); border-radius: 0; 
  background: #FFFFFF; color: #000000; font-weight: 700;
}

.upload-zone { border: 2px dashed #000000 !important; border-radius: 0 !important; width: 100%; }
.upload-zone:hover { background: #F0F0F0 !important; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
@keyframes spin { to { transform: rotate(360deg); } }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 639px) { 
  .grid-2 { grid-template-columns: 1fr; }
  h1 { font-size: 2rem !important; }
}
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.2); } 50% { box-shadow: 0 0 0 8px rgba(0,0,0,0); } }

.shake { animation: shake 0.4s ease; }
.float { animation: float 4s ease-in-out infinite; }

/* Grid Layouts */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.diagram-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 2rem; }

@media (max-width: 639px) {
  .grid-2, .grid-3, .diagram-layout { grid-template-columns: 1fr; }
  .card { padding: 1.5rem; }
  .btn, .input { width: 100%; }
}

/* Utilities */
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.mt-12 { margin-top: 3rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.text-center { text-align: center; }
.w-full { width: 100%; }
`;

// ═══════════════════════════════════════════════
// UTILS & PATTERNS
// ═══════════════════════════════════════════════

const parseJSON = (raw) => {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

// ── Enhanced OCR Spell Correction Engine ──

// Common OCR character confusions (what OCR misreads → what it should be)
const OCR_CONFUSIONS = {
  'rn': 'm', 'cl': 'd', 'cl': 'd', 'li': 'h', 'ln': 'in', 'vv': 'w',
  'nn': 'm', 'ii': 'u', 'tl': 'ti', 'fl': 'fi', 'rl': 'n', 'lI': 'h',
  'oO': 'o', 'Oo': 'o', 'l1': 'll', '1l': 'll', 'I1': 'Il',
};

// Build comprehensive dictionary
const DICT_WORDS = new Set();
// Top English words
"the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were been has had did does doing would should could may might shall must need used able same own few end found part much each every such between should however another still since during both long those before after through while where again never world life always point here three place order without does last while before since great very still really after under right between left small because those most only state same being number through school never world where going through point things might every could place long before since where find while might place after still could about under between again right number other state there small before large never going just every where still things while those right about again could after place being state here through might number world find long still every things never".split(" ").forEach(w => DICT_WORDS.add(w));
// Academic vocabulary
"analysis theory concept principle application methodology research experiment hypothesis conclusion evidence evaluation comparison definition explanation description classification category characteristic property feature aspect element factor component role purpose effect result consequence impact influence significance importance relevant essential critical fundamental basic primary secondary specific general particular individual overall comprehensive detailed accurate precise consistent reliable valid appropriate suitable effective efficient sufficient necessary required optional available current previous following additional further alternative potential possible probable likely certain various several multiple numerous frequent common typical standard normal regular traditional conventional modern contemporary advanced intermediate introduction overview summary review discussion argument perspective approach technique procedure practice example illustration demonstration representation interpretation understanding knowledge information communication technology science mathematics engineering physics chemistry biology psychology sociology economics history philosophy education environment society culture".split(" ").forEach(w => DICT_WORDS.add(w));
// CS & Programming terms
"function variable constant method class object array string integer boolean return value parameter argument type data structure algorithm program code system process memory input output define declaration expression statement operator operand condition loop iteration recursion pointer reference address stack queue tree graph node edge binary search sort merge insert delete update create read write file error exception handle thread network protocol database table query index key primary foreign relation schema model view controller interface abstract inherit polymorphism encapsulation module package library framework compile interpret execute runtime syntax semantic logic digital analog signal circuit register processor instruction architecture component design pattern notation global local scope binding closure prototype constructor destructor allocation garbage collection concurrent parallel distributed synchronous asynchronous callback promise event handler listener trigger middleware routing endpoint request response header body status authentication authorization encryption hash certificate socket stream buffer cache proxy server client host port domain path resource service container virtual deploy infrastructure cloud storage compute bandwidth latency throughput availability scalability reliability performance testing debug monitor logging trace profile benchmark tuple dictionary list linked heap priority sorted unsorted balanced traversal depth breadth complexity constant linear logarithmic quadratic exponential polynomial factorial optimal worst average case amortized recursive iterative dynamic programming greedy divide conquer backtracking heuristic approximation simulation random deterministic".split(" ").forEach(w => DICT_WORDS.add(w));
// More general English
"about above according across actually after again against already also although always among another answer any appear around away back become before began begin behind being believe below beside between beyond both bring build call came change children city close come consider could country course day develop different each early end enough even example experience eye face fact family far feel find first follow form found general give great group hand happen head help here high hold home house idea important include increase interest keep kind know large last late lead learn leave let level life light line little live long look lose make man many matter may mean might mind money move much must name need never next night number offer often old only open order other own part people person place plan play point possible power present problem provide public question quite rather read real really receive report result right room run same say school seem service set several show side since small some something sometimes stand start state still story student study system take talk tell than that their them then there these thing think those though thought three through time together too turn under understand until upon very want water way well what when where whether which while who whole why without word work world would write year young".split(" ").forEach(w => DICT_WORDS.add(w));
// Technical/document words  
"chapter section paragraph page figure table diagram chart equation formula theorem proof lemma corollary definition axiom postulate proposition conjecture graph matrix vector scalar tensor function relation mapping domain range codomain bijection injection surjection isomorphism homomorphism endomorphism automorphism kernel image quotient subgroup normal cyclic abelian commutative associative distributive identity inverse element set subset superset union intersection complement difference symmetric power partition equivalence congruence modular arithmetic integer rational real complex natural prime composite factorial permutation combination probability distribution variance deviation correlation regression interpolation extrapolation approximation convergence divergence limit continuity derivative integral differential gradient divergence curl laplacian fourier transform convolution impulse response transfer function stability feedback control signal noise filter amplitude frequency phase wavelength period harmonic oscillation damping resonance impedance conductance resistance capacitance inductance voltage current power energy work force mass acceleration velocity displacement momentum torque pressure temperature entropy enthalpy gibbs helmholtz".split(" ").forEach(w => DICT_WORDS.add(w));

// Weighted Levenshtein that accounts for OCR-specific confusions
const ocrLevenshtein = (a, b) => {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d = Array.from({length: m + 1}, (_, i) => {
    const row = new Float32Array(n + 1);
    row[0] = i;
    return row;
  });
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i-1].toLowerCase() === b[j-1].toLowerCase()) {
        d[i][j] = d[i-1][j-1];
      } else {
        // Check for OCR-specific confusion (lower cost for common misreads)
        let subCost = 1;
        const ac = a[i-1].toLowerCase(), bc = b[j-1].toLowerCase();
        // Common visual confusions get lower penalty
        const visualPairs = 'o0 O0 l1 lI 1l I1 il li rn nn cl vv ii 5s S5 8B B8 6b 9g gq qg';
        if (visualPairs.includes(ac+bc) || visualPairs.includes(bc+ac)) subCost = 0.3;
        // Similar-looking letters
        else if ('oe ae io ou ei'.includes(ac+bc) || 'oe ae io ou ei'.includes(bc+ac)) subCost = 0.6;
        
        d[i][j] = Math.min(
          d[i-1][j] + 1,         // deletion
          d[i][j-1] + 1,         // insertion
          d[i-1][j-1] + subCost  // substitution
        );
        
        // Transposition (swap adjacent chars) — very common in OCR
        if (i > 1 && j > 1 && a[i-1].toLowerCase() === b[j-2].toLowerCase() && a[i-2].toLowerCase() === b[j-1].toLowerCase()) {
          d[i][j] = Math.min(d[i][j], d[i-2][j-2] + 0.5);
        }
      }
    }
  }
  return d[m][n];
};

// Apply common OCR multi-char confusion fixes before spell check
const fixOcrPatterns = (text) => {
  return text
    .replace(/\brn(?=[aeiou])/g, 'm')     // rning → ming (morning)
    .replace(/(?<=[a-z])rn(?=[a-z])/g, 'm') // rnore → more
    .replace(/\bcl(?=[aeiou])/g, 'd')     // clata → data
    .replace(/\bvv(?=[aeiou])/g, 'w')     // vvith → with
    .replace(/(?<=\w)tbe\b/g, 'the')      // common misread
    .replace(/\btbe\b/gi, 'the')
    .replace(/\bwbich\b/gi, 'which')
    .replace(/\btbat\b/gi, 'that')
    .replace(/\bwitb\b/gi, 'with')
    .replace(/\bfrorn\b/gi, 'from')
    .replace(/\bsarne\b/gi, 'same')
    .replace(/\bnarne\b/gi, 'name')
    .replace(/\btirne\b/gi, 'time')
    .replace(/\bcornputer\b/gi, 'computer')
    .replace(/\bprograrnm?e?\b/gi, 'program')
    .replace(/\bnurnber\b/gi, 'number')
    .replace(/\bmernory\b/gi, 'memory')
    .replace(/\bsystern\b/gi, 'system');
};

const correctOcrWord = (word, dictionary, maxDist) => {
  if (word.length < 3) return word;
  const lower = word.toLowerCase();
  if (dictionary.has(lower)) return word;
  
  let bestMatch = null, bestDist = maxDist + 1;
  for (const dictWord of dictionary) {
    // Quick length filter
    if (Math.abs(dictWord.length - lower.length) > maxDist) continue;
    // Quick first-char filter (OCR rarely gets the first letter completely wrong)
    if (lower.length > 4 && dictWord.length > 4) {
      const fc = lower[0], dc = dictWord[0];
      // Allow only visually similar first chars
      if (fc !== dc && !('o0O il1I lI1 Il1 cCo sS5 bB8 gG9'.includes(fc+dc) || 'o0O il1I lI1 Il1 cCo sS5 bB8 gG9'.includes(dc+fc))) {
        if (lower[0] !== dictWord[0] && lower[1] !== dictWord[1]) continue;
      }
    }
    const dist = ocrLevenshtein(lower, dictWord);
    if (dist < bestDist) { bestDist = dist; bestMatch = dictWord; }
    if (dist <= 0.5) break; // near-perfect match
  }
  
  if (bestMatch && bestDist <= maxDist) {
    if (word === word.toUpperCase()) return bestMatch.toUpperCase();
    if (word[0] === word[0].toUpperCase()) return bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1);
    return bestMatch;
  }
  return word;
};

// Bigram context: common word pairs help resolve ambiguity
const COMMON_BIGRAMS = new Map([
  ['data','structure'],['data','type'],['data','base'],['binary','tree'],['binary','search'],
  ['linked','list'],['hash','table'],['hash','map'],['source','code'],['machine','learning'],
  ['operating','system'],['file','system'],['control','flow'],['for','loop'],['while','loop'],
  ['if','else'],['return','value'],['function','call'],['base','case'],['time','complexity'],
  ['space','complexity'],['big','notation'],['object','oriented'],['dynamic','programming'],
  ['divide','conquer'],['depth','first'],['breadth','first'],['main','memory'],['virtual','memory'],
  ['page','table'],['stack','pointer'],['program','counter'],['instruction','set'],
  ['assembly','language'],['high','level'],['low','level'],['real','time'],['run','time'],
]);

const correctWithContext = (words, dictionary) => {
  const result = [...words];
  for (let i = 0; i < result.length; i++) {
    const w = result[i].toLowerCase().replace(/[^a-z]/g, '');
    if (w.length < 3) continue;
    
    // Check if previous word + current word should form a known bigram
    if (i > 0) {
      const prev = result[i-1].toLowerCase().replace(/[^a-z]/g, '');
      const expectedNext = COMMON_BIGRAMS.get(prev);
      if (expectedNext && !dictionary.has(w)) {
        const dist = ocrLevenshtein(w, expectedNext);
        if (dist <= 2) {
          const orig = result[i];
          result[i] = orig[0] === orig[0].toUpperCase() 
            ? expectedNext.charAt(0).toUpperCase() + expectedNext.slice(1) 
            : expectedNext;
          console.log(`  Context fix: "${prev} ${orig}" → "${prev} ${result[i]}"`);
        }
      }
    }
    // Check if current word + next word should form a known bigram  
    if (i < result.length - 1) {
      const next = result[i+1].toLowerCase().replace(/[^a-z]/g, '');
      for (const [key, val] of COMMON_BIGRAMS) {
        if (val === next && !dictionary.has(w)) {
          const dist = ocrLevenshtein(w, key);
          if (dist <= 2) {
            const orig = result[i];
            result[i] = orig[0] === orig[0].toUpperCase()
              ? key.charAt(0).toUpperCase() + key.slice(1) : key;
            console.log(`  Context fix: "${orig} ${next}" → "${result[i]} ${next}"`);
            break;
          }
        }
      }
    }
  }
  return result;
};

const correctOcrText = (text) => {
  // Pass 1: Fix known OCR multi-char patterns
  text = fixOcrPatterns(text);
  
  // Build document dictionary from frequently appearing words
  const wordFreq = {};
  text.split(/\s+/).forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length >= 3) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  
  const docDict = new Set(DICT_WORDS);
  Object.entries(wordFreq).forEach(([w, count]) => {
    if (count >= 2) docDict.add(w);
  });
  
  console.log(`Spell correction: ${docDict.size} dict words, ${Object.keys(wordFreq).length} unique OCR words`);
  
  // Pass 2: Individual word correction with OCR-aware distance
  let corrected = 0;
  let result = text.replace(/\b[a-zA-Z]{3,}\b/g, (match) => {
    const maxDist = match.length <= 4 ? 1 : match.length <= 6 ? 1.5 : match.length <= 9 ? 2.5 : 3;
    const fixed = correctOcrWord(match, docDict, maxDist);
    if (fixed !== match) { corrected++; console.log(`  Fix: "${match}" → "${fixed}"`); }
    return fixed;
  });
  
  // Pass 3: Context-aware bigram correction
  const words = result.split(/(\s+)/); // preserve whitespace
  const onlyWords = words.filter(w => /[a-zA-Z]/.test(w));
  const contextFixed = correctWithContext(onlyWords, docDict);
  let wi = 0;
  result = words.map(w => /[a-zA-Z]/.test(w) ? contextFixed[wi++] : w).join('');
  
  console.log(`Spell correction: fixed ${corrected} words total`);
  return result;
};

const cleanOcrText = (rawText) => {
  let lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let cleaned = lines.map(line => {
    return line
      .replace(/[|l](?=[A-Z])/g, 'I')
      .replace(/0(?=[a-z])/g, 'o')
      .replace(/1(?=[a-z]{2})/g, 'l')
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s*[>:;]+\s*/g, ' ')
      .replace(/\s*[-=]+>\s*/g, ' ')
      .replace(/\(\s*\)/g, '')
      .replace(/\[\s*\]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }).filter(l => l.length > 0);
  
  cleaned = cleaned.filter(line => {
    const words = line.split(/\s+/);
    if (words.length < 3) return false;
    const realWords = words.filter(w => w.length >= 2 && (w.match(/[a-zA-Z]/g) || []).length / w.length >= 0.7);
    if (realWords.length / words.length < 0.5) return false;
    const specialRatio = (line.match(/[^a-zA-Z0-9\s.,!?'"()-]/g) || []).length / line.length;
    if (specialRatio > 0.25) return false;
    return true;
  });
  
  let text = cleaned.join('. ').replace(/\.\s*\./g, '.').trim();
  text = correctOcrText(text);
  return text;
};

const isSentenceReadable = (sentence) => {
  const words = sentence.split(/\s+/);
  if (words.length < 4) return false;
  const goodWords = words.filter(w => w.length >= 3 && (w.match(/[a-zA-Z]/g) || []).length / w.length >= 0.75);
  return goodWords.length >= words.length * 0.6;
};



// Preprocessing strategies for OCR - try multiple and pick best
const ocrPreprocess = {
  // Strategy 1: Light cleanup - just grayscale + mild contrast
  grayscale: (canvas) => {
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    const img = ctx.getImageData(0, 0, out.width, out.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
      // Mild contrast boost
      const v = Math.max(0, Math.min(255, (g - 128) * 1.3 + 128));
      d[i] = d[i+1] = d[i+2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return out;
  },
  // Strategy 2: Strong contrast (good for faint handwriting)
  highContrast: (canvas) => {
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    const img = ctx.getImageData(0, 0, out.width, out.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
      const v = Math.max(0, Math.min(255, (g - 128) * 2.0 + 128));
      d[i] = d[i+1] = d[i+2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return out;
  },
  // Strategy 3: Adaptive threshold (good for printed text on noisy backgrounds)
  adaptive: (canvas) => {
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    const img = ctx.getImageData(0, 0, out.width, out.height);
    const d = img.data;
    const w = out.width, h = out.height;
    const gray = new Float32Array(w * h);
    for (let i = 0; i < d.length; i += 4) {
      gray[i/4] = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
    }
    const integral = new Float64Array(w * h);
    for (let y = 0; y < h; y++) {
      let rs = 0;
      for (let x = 0; x < w; x++) {
        rs += gray[y*w+x];
        integral[y*w+x] = rs + (y > 0 ? integral[(y-1)*w+x] : 0);
      }
    }
    const bk = 25, half = 12, C = 12;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const x1=Math.max(0,x-half), y1=Math.max(0,y-half), x2=Math.min(w-1,x+half), y2=Math.min(h-1,y+half);
        const cnt=(x2-x1+1)*(y2-y1+1);
        let s=integral[y2*w+x2];
        if(x1>0) s-=integral[y2*w+(x1-1)];
        if(y1>0) s-=integral[(y1-1)*w+x2];
        if(x1>0&&y1>0) s+=integral[(y1-1)*w+(x1-1)];
        const v = gray[y*w+x] < (s/cnt - C) ? 0 : 255;
        const idx = (y*w+x)*4;
        d[idx]=d[idx+1]=d[idx+2]=v; d[idx+3]=255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return out;
  }
};

const extractPdfText = async (file, onOcrStart, onDiagramFound) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const extractedDiagrams = [];
    
    console.log(`PDF loaded. Pages: ${pdf.numPages}`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';

      // Extract Diagrams (Images)
      try {
        const ops = await page.getOperatorList();
        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === window.pdfjsLib.OPS.paintImageXObject || 
              ops.fnArray[j] === window.pdfjsLib.OPS.paintInlineImageXObject) {
            
            const objId = ops.argsArray[j][0];
            let image = null;
            try { image = await page.commonObjs.get(objId); } catch(e) {}
            if (!image) { try { image = await page.objs.get(objId); } catch(e) {} }
            
            if (image && image.width > 200 && image.height > 200) {
              const canvas = document.createElement('canvas');
              canvas.width = image.width;
              canvas.height = image.height;
              const ctx = canvas.getContext('2d');
              
              if (image.data) {
                const imgData = ctx.createImageData(image.width, image.height);
                if (image.data.length === image.width * image.height * 3) {
                  const d = imgData.data;
                  for (let k = 0, l = 0; k < d.length; k += 4, l += 3) {
                    d[k] = image.data[l]; d[k+1] = image.data[l+1]; d[k+2] = image.data[l+2]; d[k+3] = 255;
                  }
                } else {
                  imgData.data.set(image.data);
                }
                ctx.putImageData(imgData, 0, 0);
                extractedDiagrams.push({ id: `diag-${i}-${j}`, src: canvas.toDataURL('image/png'), page: i });
                if (onDiagramFound) onDiagramFound();
              }
            }
          }
        }
      } catch (diagErr) {
        console.warn("Diagram extraction skipped for page", i, diagErr);
      }
    }

    const avgCharsPerPage = fullText.trim().length / pdf.numPages;
    console.log(`Avg chars/page: ${avgCharsPerPage.toFixed(0)}`);

    if (avgCharsPerPage < 50 && window.Tesseract) {
      console.log("Scanned/handwritten PDF detected. Starting multi-strategy OCR...");
      if (onOcrStart) onOcrStart();
      fullText = '';
      
      const worker = await window.Tesseract.createWorker('eng', 1, {
        logger: m => { if (m.status === 'recognizing text') console.log(`OCR progress: ${(m.progress * 100).toFixed(0)}%`); }
      });
      
      // Use PSM 3 (auto) — let Tesseract decide the best segmentation
      await worker.setParameters({
        tessedit_pageseg_mode: '3',
        preserve_interword_spaces: '1',
      });
      
      const pagesToProcess = Math.min(pdf.numPages, 15);
      const allPageTexts = [];
      
      for (let i = 1; i <= pagesToProcess; i++) {
        console.log(`\n── OCR Page ${i}/${pagesToProcess} ──`);
        const page = await pdf.getPage(i);
        
        // Render at scale 2.0 (lower = less noise for handwriting)
        const viewport = page.getViewport({ scale: 2.0 });
        const baseCanvas = document.createElement('canvas');
        const baseCtx = baseCanvas.getContext('2d');
        baseCanvas.width = viewport.width;
        baseCanvas.height = viewport.height;
        await page.render({ canvasContext: baseCtx, viewport }).promise;
        
        // Try all 3 strategies, pick the one with highest confidence
        const strategies = ['grayscale', 'highContrast', 'adaptive'];
        let bestText = '', bestConf = 0, bestStrategy = '';
        
        for (const strat of strategies) {
          const processed = ocrPreprocess[strat](baseCanvas);
          const { data: { text, confidence } } = await worker.recognize(processed);
          console.log(`  ${strat}: confidence=${confidence.toFixed(1)}%, words=${text.split(/\s+/).length}`);
          if (confidence > bestConf) {
            bestConf = confidence;
            bestText = text;
            bestStrategy = strat;
          }
        }
        
        // Also try raw (unprocessed) image
        const { data: { text: rawText, confidence: rawConf } } = await worker.recognize(baseCanvas);
        console.log(`  raw: confidence=${rawConf.toFixed(1)}%, words=${rawText.split(/\s+/).length}`);
        if (rawConf > bestConf) {
          bestConf = rawConf;
          bestText = rawText;
          bestStrategy = 'raw';
        }
        
        console.log(`  ✓ Winner: ${bestStrategy} (${bestConf.toFixed(1)}%)`);
        allPageTexts.push(bestText);
      }
      
      await worker.terminate();
      fullText = allPageTexts.join('\n');
    }

    // Apply OCR text cleaning + spell correction
    const cleanText = cleanOcrText(fullText);
    console.log(`Final cleaned text (${cleanText.length} chars): ${cleanText.substring(0, 300)}...`);
    
    return {
      text: cleanText.slice(0, 60000),
      pageCount: pdf.numPages,
      wordCount: cleanText.split(/\s+/).filter(w => w.length > 0).length,
      diagrams: extractedDiagrams
    };
  } catch (err) {
    console.error("PDF Extraction Error:", err);
    throw err;
  }
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

const extractTxtText = async (file) => {
  const text = await file.text();
  return {
    text: text.slice(0, 60000),
    pageCount: 1,
    wordCount: text.split(/\s+/).length
  };
};

const extractDocxText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  const text = result.value;
  return {
    text: text.slice(0, 60000),
    pageCount: 1, // Mammoth doesn't easily give page counts for DOCX
    wordCount: text.split(/\s+/).length
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


const generateLocalQuestions = (text, count, types = ['mcq', 'fill_blank'], diagrams = []) => {
  const cleanedText = text.replace(/\n+/g, ' ').replace(/\s\s+/g, ' ').trim();
  const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [];
  
  // Filter sentences: must be long enough AND readable (no OCR garbage)
  const filtered = sentences
    .map(s => s.trim())
    .filter(s => s.split(' ').length > 6 && s.length < 300)
    .filter(s => isSentenceReadable(s));
  
  let sources = filtered;
  if (sources.length < count) {
    // Try splitting by line breaks too, but still filter for readability
    const lineSources = cleanedText.split(/[.!?\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 20)
      .filter(s => isSentenceReadable(s));
    sources = [...new Set([...sources, ...lineSources])];
  }

  if (sources.length === 0) {
    // Last resort: use whatever we have, but at least filter short lines
    sources = cleanedText.split(/[.!?\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.split(' ').length > 3);
  }

  const shuffled = shuffle(sources).slice(0, count);
  const allWords = cleanedText.replace(/[.!?(),;:"']/g, '').split(/\s+/);
  // Only keep key terms that look like real words (alphabetic, 4+ chars)
  const keyTerms = [...new Set(allWords.filter(w => 
    w.length > 5 && /^[a-zA-Z]+$/.test(w)
  ))];
  
  let diagramIndex = 0;

  return {
    quiz_title: "Intelligent Document Quiz",
    topics_covered: ["Key Concepts", "Visual Analysis"],
    questions: shuffled.map((s, i) => {
      const type = types[i % types.length];
      const words = s.replace(/[.!?(),;:"']/g, '').split(/\s+/);
      const candidates = words.filter(w => w.length > 5);
      const target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : words[0];

      if (type === 'diagram' && diagrams.length > 0 && diagramIndex < diagrams.length) {
        const diag = diagrams[diagramIndex++];
        return {
          id: `q-${i}`,
          type: 'diagram',
          topic_tag: 'Visual Analysis',
          difficulty: 'hard',
          page_ref: `Page ${diag.page}`,
          question: 'Identify the correct labels on the diagram below by dragging them to their correct locations.',
          image: diag.src,
          drop_zones: diag.labels.map((l, idx) => ({
            id: `z-${idx}`,
            node_id: `n-${idx}`,
            number: idx + 1,
            correct_chip_id: `c-${idx}`,
            bbox: l.bbox
          })),
          answer_chips: shuffle(diag.labels.map((l, idx) => ({
            id: `c-${idx}`,
            label: l.text,
            correct_zone_id: `z-${idx}`
          }))),
          explanation: `This diagram from page ${diag.page} contains key terminology and structural relationships discussed in the text.`
        };
      }

      if (type === 'fill_blank') {
        const decoys = shuffle(keyTerms.filter(t => t.toLowerCase() !== target.toLowerCase())).slice(0, 3);
        while (decoys.length < 3) decoys.push(["Term", "Concept", "Context"][decoys.length]);
        return {
          id: `q-${i}`,
          type: 'fill_blank',
          topic_tag: 'Key Terms',
          difficulty: 'medium',
          page_ref: 'Contextual',
          question: 'Complete the sentence with the correct term:',
          sentence: s.replace(new RegExp(`\\b${target}\\b`, 'i'), '___'),
          correct_answer: target,
          options: shuffle([target, ...decoys]),
          explanation: `Full context: "${s}"`
        };
      } else if (type === 'true_false') {
        const isTrue = Math.random() > 0.5;
        let questionText = s;
        let correctAnswer = "True";
        if (!isTrue) {
          const wordsToChange = words.filter(w => w.length > 5);
          if (wordsToChange.length > 0) {
            const wordToReplace = wordsToChange[Math.floor(Math.random() * wordsToChange.length)];
            const replacement = keyTerms.find(t => t !== wordToReplace) || "alternative concept";
            questionText = s.replace(new RegExp(`\\b${wordToReplace}\\b`, 'i'), replacement);
            correctAnswer = "False";
          }
        }
        return {
          id: `q-${i}`,
          type: 'true_false',
          topic_tag: 'Fact Verification',
          difficulty: 'easy',
          page_ref: 'Contextual',
          question: `Based on the text, is this statement true? "${questionText}"`,
          correct_answer: correctAnswer,
          explanation: `The original text states: "${s}"`
        };
      } else if (type === 'diagram') {
        // Fallback for synthetic diagram if no extracted diagrams exist
        const slideTerms = shuffle(candidates).slice(0, 3);
        while (slideTerms.length < 3) slideTerms.push(keyTerms[Math.floor(Math.random() * keyTerms.length)] || "Concept");
        const [term1, term2, term3] = slideTerms;
        const decoys = shuffle(keyTerms.filter(t => !slideTerms.includes(t))).slice(0, 2);
        return {
          id: `q-${i}`,
          type: 'diagram',
          topic_tag: 'Process Flow',
          difficulty: 'hard',
          page_ref: 'Visual Logic',
          question: 'Drag the correct terms into the process sequence described in the text:',
          nodes: [
            { id: 'n1', type: 'start', display_text: term1, position: { row: 1, col: 1 }, connects_to: ['n2'] },
            { id: 'n2', type: 'process', display_text: '___', position: { row: 2, col: 1 }, connects_to: ['n3'] },
            { id: 'n3', type: 'end', display_text: '___', position: { row: 3, col: 1 }, connects_to: [] }
          ],
          drop_zones: [
            { id: 'z1', node_id: 'n2', number: 1, correct_chip_id: 'c1' },
            { id: 'z2', node_id: 'n3', number: 2, correct_chip_id: 'c2' }
          ],
          answer_chips: shuffle([
            { id: 'c1', label: term2, correct_zone_id: 'z1' },
            { id: 'c2', label: term3, correct_zone_id: 'z2' },
            ...decoys.map((d, di) => ({ id: `d${di}`, label: d, correct_zone_id: null }))
          ]),
          explanation: `This sequence is derived from the following context: "${s}"`
        };
      } else if (type === 'short_answer') {
        return {
          id: `q-${i}`,
          type: 'short_answer',
          topic_tag: 'Conceptual',
          difficulty: 'hard',
          page_ref: 'Contextual',
          question: `Explain the following concept based on the document: "${s}"`,
          model_answer: s,
          key_points: candidates.slice(0, 3),
          explanation: `The text discusses this as follows: "${s}"`
        };
      } else {
        const decoys = shuffle(keyTerms.filter(t => t.toLowerCase() !== target.toLowerCase())).slice(0, 3);
        return {
          id: `q-${i}`,
          type: 'mcq',
          topic_tag: 'Comprehension',
          difficulty: 'medium',
          page_ref: 'Contextual',
          question: `Which term correctly completes this statement: "${s.replace(new RegExp(`\\b${target}\\b`, 'i'), '___')}"?`,
          options: shuffle([target, ...decoys]),
          correct_answer: target,
          explanation: `Source text: "${s}"`
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

export default function RawPrep() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [screen, setScreen] = useState('upload'); // 'upload' | 'loading' | 'quiz' | 'results'
  

  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [pdfMeta, setPdfMeta] = useState({ pageCount: 0, wordCount: 0 });
  const [extractedDiagrams, setExtractedDiagrams] = useState([]);
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

  const [pdfjsReady, setPdfjsReady] = useState(false);
  const [jszipReady, setJszipReady] = useState(false);
  const [mammothReady, setMammothReady] = useState(false);
  const [tesseractReady, setTesseractReady] = useState(false);

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
    zipScript.onload = () => setJszipReady(true);
    document.head.appendChild(zipScript);

    // Load Mammoth (for DOCX)
    const mammothScript = document.createElement('script');
    mammothScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    mammothScript.onload = () => setMammothReady(true);
    document.head.appendChild(mammothScript);

    // Load Tesseract.js (for OCR)
    const tesseractScript = document.createElement('script');
    tesseractScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.3/tesseract.min.js';
    tesseractScript.onload = () => setTesseractReady(true);
    document.head.appendChild(tesseractScript);
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
          jszipReady={jszipReady}
          mammothReady={mammothReady}
          tesseractReady={tesseractReady}
          uploadedFile={uploadedFile} setUploadedFile={setUploadedFile}
          pdfText={pdfText} setPdfText={setPdfText}
          pdfMeta={pdfMeta} setPdfMeta={setPdfMeta}
          extractedDiagrams={extractedDiagrams} setExtractedDiagrams={setExtractedDiagrams}
          config={config} setConfig={setConfig}
          showError={showError}
          onGenerate={async () => {
            setScreen('loading');
            setError(null);
            setLoadingMessage("Analyzing document...");
            
            setTimeout(async () => {
              try {
                let processedDiagrams = [];
                if (extractedDiagrams.length > 0 && window.Tesseract) {
                  setLoadingMessage("Scanning diagrams for interactive labels...");
                  const worker = await window.Tesseract.createWorker('eng', 1);
                  const diagsToProcess = extractedDiagrams.slice(0, 3);
                  for (const diag of diagsToProcess) {
                    const { data } = await worker.recognize(diag.src);
                    const labels = data.words.filter(w => w.confidence > 65 && w.text.length > 2 && w.text.length < 15).slice(0, 5);
                    if (labels.length >= 2) {
                      processedDiagrams.push({ ...diag, labels: labels.map((l, idx) => ({ id: `l-${idx}`, text: l.text, bbox: l.bbox })) });
                    }
                  }
                  await worker.terminate();
                }

                const parsed = generateLocalQuestions(pdfText, config.questionCount, config.types, processedDiagrams);
                if (!parsed || !parsed.questions || parsed.questions.length === 0) {
                  throw new Error("No questions could be generated. Try different settings.");
                }
                setQuestions(parsed.questions);
                setQuizTitle(parsed.quiz_title);
                setStartTime(Date.now());
                setCurrentIndex(0);
                setAnswers({});
                setSubmitted({});
                setScreen('quiz');
              } catch (err) {
                showError('local_error', 'Generation failed: ' + err.message);
                setScreen('upload');
              }
            }, 100);
          }} />
      )}

      {screen === 'loading' && (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center card" style={{ padding: '4rem', minWidth: '300px' }}>
            <div style={{ width: 64, height: 64, border: '6px solid #000', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite', margin: '0 auto 2rem' }} />
            <div style={{ fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{loadingMessage}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '1rem', textTransform: 'uppercase', opacity: 0.7 }}>Analyzing document offline...</div>
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
function UploadScreen({ pdfjsReady, jszipReady, mammothReady, tesseractReady, uploadedFile, setUploadedFile, pdfText, setPdfText, pdfMeta, setPdfMeta, extractedDiagrams, setExtractedDiagrams, config, setConfig, showError, onGenerate }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrActive, setOcrActive] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['pdf', 'pptx', 'txt', 'docx', 'doc'];
    if (!validExts.includes(ext)) { showError('wrong_file', 'Please upload a PDF, PPTX, TXT, or Word document.'); return; }
    if (file.size > 20 * 1024 * 1024) { showError('file_too_large', 'File too large. Use a file under 20MB.'); return; }
    if (ext === 'pdf' && !pdfjsReady) { showError('loading', 'PDF engine still loading...'); return; }
    if (ext === 'pptx' && !jszipReady) { showError('loading', 'PowerPoint engine still loading...'); return; }
    if ((ext === 'docx' || ext === 'doc') && !mammothReady) { showError('loading', 'Word engine still loading...'); return; }
    
    setUploadedFile(file);
    setIsExtracting(true);
    setOcrActive(false);
    try {
      let result;
      if (ext === 'pdf') result = await extractPdfText(file, () => setOcrActive(true), () => {});
      else if (ext === 'pptx') result = await extractPptxText(file);
      else if (ext === 'docx' || ext === 'doc') result = await extractDocxText(file);
      else result = await extractTxtText(file);
      
      if (!result.text || result.text.trim().length < 30) {
        showError('no_text', 'Could not extract readable text from this file. If it is handwritten, the writing may be too unclear for OCR. Try a clearer scan.');
        setUploadedFile(null);
        return;
      }
      setPdfText(result.text);
      setPdfMeta({ pageCount: result.pageCount, wordCount: result.wordCount });
      if (result.diagrams) setExtractedDiagrams(result.diagrams);
    } catch (err) {
      showError('extract_error', 'Could not read file: ' + err.message);
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
      setOcrActive(false);
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
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card fade-in-up" style={{ maxWidth: 680, width: '100%', margin: '0 auto', padding: '2.5rem', border: '4px solid #000', boxShadow: '16px 16px 0px #000' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 42, letterSpacing: '-0.04em', margin: 0, fontWeight: 900, textTransform: 'none' }}>RawPrep</h1>
        </div>

        {(!uploadedFile || isExtracting) ? (
          <div className="mb-4">
            <div className="upload-zone"
              style={{ border: `4px dashed #000`, padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: (isExtracting) ? 'default' : 'pointer', transition: 'all 0.1s ease' }}
              onDragOver={(e) => { e.preventDefault(); if(!isExtracting) setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(!isExtracting) handleFileSelect(e.dataTransfer.files[0]); }}
              onClick={() => !isExtracting && fileInputRef.current?.click()}
            >
              <input type="file" accept=".pdf,.pptx,.txt,.docx,.doc" ref={fileInputRef} hidden onChange={e => handleFileSelect(e.target.files[0])} />
              {isExtracting ? (
                <div className="text-center">
                  <div style={{ width: 48, height: 48, border: '4px solid #000', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite', margin: '0 auto 1.5rem' }} />
                  <p style={{ fontWeight: 900, fontSize: 16 }}>{ocrActive ? 'HANDWRITING OCR ACTIVE...' : 'READING DOCUMENT...'}</p>
                  <p style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>THIS MAY TAKE A MOMENT</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 64, marginBottom: 20 }}>📁</div>
                  <p style={{ fontWeight: 900, fontSize: 18 }}>UPLOAD PDF, PPTX, DOCX OR TXT</p>
                  <p style={{ fontSize: 14, marginTop: 8, opacity: 0.6 }}>DRAG & DROP OR CLICK TO BROWSE</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="fade-in-up">
            <div style={{ background: '#000', padding: '16px 20px', border: '2px solid #000', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFile.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: '0.1em' }}>
                  {uploadedFile.name.endsWith('.txt') || uploadedFile.name.endsWith('.docx') || uploadedFile.name.endsWith('.doc') 
                    ? '' 
                    : `${pdfMeta.pageCount} SLIDES/PAGES · `}
                  {pdfMeta.wordCount} WORDS
                </div>
              </div>
              <button 
                onClick={() => { setUploadedFile(null); setPdfText(''); setPdfMeta({ pageCount: 0, wordCount: 0 }); }}
                style={{ background: 'transparent', color: '#FFF', border: '2px solid #FFF', padding: '8px 12px', fontSize: 14, fontWeight: 900, cursor: 'pointer', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.target.style.background = '#FFF'; e.target.style.color = '#000'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#FFF'; }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="grid-2" style={{ gap: '1.5rem' }}>
                <div>
                  <label style={{ fontWeight: 900, fontSize: 12, display: 'block', marginBottom: 6 }}>QUESTIONS: {config.questionCount}</label>
                  <input type="range" min={5} max={30} step={1} value={config.questionCount} onChange={e => setConfig({ ...config, questionCount: Number(e.target.value) })} style={{ height: 10, cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 900, fontSize: 12, display: 'block', marginBottom: 6 }}>DIFFICULTY</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '2px solid #000', background: '#000', gap: 2 }}>
                    {['easy', 'medium', 'hard'].map(lvl => (
                      <button key={lvl} style={{ border: 'none', padding: '10px 0', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', background: config.difficulty === lvl ? '#000' : '#FFF', color: config.difficulty === lvl ? '#FFF' : '#000' }} onClick={() => setConfig({ ...config, difficulty: lvl })}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 900, fontSize: 12, display: 'block', marginBottom: 6 }}>SESSION MODE</label>
                <div className="grid-2" style={{ gap: 12 }}>
                  <button className={`btn ${config.mode === 'exam' ? 'btn-primary' : ''}`} style={{ flex: 1, minHeight: 48, fontSize: 14 }} onClick={() => setConfig({ ...config, mode: 'exam' })}>📝 EXAM</button>
                  <button className={`btn ${config.mode === 'interview' ? 'btn-primary' : ''}`} style={{ flex: 1, minHeight: 48, fontSize: 14 }} onClick={() => setConfig({ ...config, mode: 'interview' })}>💬 INTERVIEW</button>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 900, fontSize: 12, display: 'block', marginBottom: 6 }}>QUESTION TYPES</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'mcq', label: 'MCQ' },
                    { id: 'true_false', label: 'T/F' },
                    { id: 'fill_blank', label: 'FILL' },
                    { id: 'short_answer', label: 'SHORT' },
                    { id: 'diagram', label: 'DIAGRAM' }
                  ].map(t => {
                    const active = config.types.includes(t.id);
                    return (
                      <button key={t.id} onClick={() => toggleType(t.id)} style={{ flex: '1 1 auto', padding: '10px 14px', border: '2px solid #000', background: active ? '#000' : '#FFF', color: active ? '#FFF' : '#000', fontSize: 11, fontWeight: 900, cursor: 'pointer' }}>
                        {active ? '✓ ' : ''}{t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button className="btn btn-primary w-full" style={{ height: 60, fontSize: 18, border: '4px solid #000' }} disabled={!pdfText || config.types.length === 0} onClick={onGenerate}>
              START SESSION ⚡
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
  if (!q) return <div className="container" style={{padding: '4rem', textAlign: 'center'}}><h2>Loading question...</h2></div>;
  
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
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#FFFFFF', borderBottom: '4px solid #000', padding: '1.5rem 0' }}>
        <div className="container flex justify-between items-center" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 900, fontSize: 24, textTransform: 'none', letterSpacing: '-0.02em' }}>RawPrep</div>
          <div style={{ fontSize: 13, fontWeight: 900, background: '#000', color: '#FFF', padding: '6px 12px', textTransform: 'uppercase' }}>Q {currentIndex + 1} / {questions.length}</div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{width: 12, height: 12, background: '#000', border: '1px solid #000'}}/> {correctCount}
              </span>
              <span style={{ color: '#888', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{width: 12, height: 12, border: '2px solid #000'}}/> {wrongCount}
              </span>
            </div>
            {config.mode === 'exam' && (
              <div style={{ fontSize: 14, fontWeight: 900, background: '#F0F0F0', padding: '6px 12px', border: '2px solid #000' }}>
                {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>
        <div style={{ width: '100%', height: 8, background: '#F0F0F0', marginTop: '1.5rem', position: 'relative' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#000', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} role="progressbar" />
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
          {q.type === 'fill_blank' && <FillBlankQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} isMobile={isMobile} />}
          {q.type === 'short_answer' && <ShortAnswerQuestion question={q} submitted={qSubmitted} answer={qAnswer} onAnswer={(r) => handleAnswerSubmit(q.id, r)} />}
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
          } else if (answer && opt === answer.value) {
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
      {submitted && answer && !answer.skipped && <ExplanationBox question={question} isCorrect={answer.isCorrect} />}
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
            else if (answer && opt === answer.value) { style.background = 'var(--wrong-bg)'; style.color = 'var(--wrong)'; style.borderColor = 'var(--wrong)'; style.animation = 'shake 0.4s ease'; }
            else { style.opacity = 0.3; }
          }
          return <button key={opt} style={style} onClick={() => handleClick(opt)} onMouseEnter={e => { if(!submitted) { e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.borderColor='var(--primary)'; } }} onMouseLeave={e => { if(!submitted) { e.currentTarget.style.background='var(--bg-surface)'; e.currentTarget.style.borderColor='var(--border)'; } }}>{opt}</button>;
        })}
      </div>
      {submitted && answer && !answer.skipped && <ExplanationBox question={question} isCorrect={answer.isCorrect} />}
    </div>
  );
}

function FillBlankQuestion({ question, submitted, answer, onAnswer, isMobile }) {
  const [isOver, setIsOver] = useState(false);
  const [tapSelection, setTapSelection] = useState(null);

  const handleDrop = (val) => {
    if (submitted) return;
    onAnswer({ value: val, isCorrect: val.toLowerCase() === question.correct_answer.toLowerCase() });
  };

  const handleTapSelect = (val) => {
    if (submitted) return;
    if (isMobile) {
      if (tapSelection === val) setTapSelection(null);
      else setTapSelection(val);
    }
  };

  const handleBlankClick = () => {
    if (submitted || !isMobile || !tapSelection) return;
    handleDrop(tapSelection);
  };

  return (
    <div>
      <p style={{ fontSize: 20, lineHeight: 2, marginBottom: '3rem', color: 'var(--text-primary)', textAlign: 'center', padding: '1.5rem', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 0 }}>
        {question.sentence.split('___').map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <span 
                onClick={handleBlankClick}
                onDragOver={e => { e.preventDefault(); setIsOver(true); }}
                onDragLeave={() => setIsOver(false)}
                onDrop={e => { e.preventDefault(); setIsOver(false); handleDrop(e.dataTransfer.getData('text')); }}
                style={{ 
                  display: 'inline-flex', 
                  minWidth: 160, 
                  height: 44,
                  borderBottom: '4px solid var(--primary)', 
                  margin: '0 12px', 
                  padding: '0 12px', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  verticalAlign: 'middle',
                  color: (submitted && answer) ? (answer.isCorrect ? 'var(--correct)' : 'var(--wrong)') : 'var(--primary)', 
                  fontWeight: 900, 
                  background: isOver ? 'var(--primary-light)' : 'var(--bg-surface)',
                  transition: 'all 0.2s',
                  cursor: !submitted && isMobile && tapSelection ? 'pointer' : 'default',
                  boxShadow: isOver ? 'var(--shadow-glow)' : 'none',
                  borderRadius: 0
                }}
              >
                {(submitted && answer) ? answer.value : (isMobile && tapSelection ? '???' : 'DRAG HERE')}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>

      {!submitted && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {question.options.map(opt => (
            <div
              key={opt}
              draggable={!isMobile}
              onDragStart={e => e.dataTransfer.setData('text', opt)}
              onClick={() => handleTapSelect(opt)}
              style={{
                padding: '12px 24px',
                background: tapSelection === opt ? 'var(--primary)' : 'var(--bg-card)',
                color: tapSelection === opt ? 'var(--text-inverse)' : 'var(--text-primary)',
                border: '2px solid #000',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: tapSelection === opt ? 'none' : '4px 4px 0px #000',
                transition: 'all 0.1s',
                transform: tapSelection === opt ? 'translate(2px, 2px)' : 'none'
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {submitted && answer && !answer.skipped && !answer.isCorrect && (
        <div style={{ marginTop: '2rem', color: 'var(--wrong)', background: 'var(--wrong-bg)', padding: '16px', border: '2px solid var(--wrong)', fontWeight: 700 }}>
          ✗ Incorrect. The correct term was: <span style={{ textDecoration: 'underline' }}>{question.correct_answer}</span>
        </div>
      )}
      {submitted && answer && !answer.skipped && <ExplanationBox question={question} isCorrect={answer.isCorrect} />}
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
          <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="Type your comprehensive explanation here..." style={{ width: '100%', minHeight: '200px', padding: '1.5rem', border: '2px solid #000', fontSize: 16, lineHeight: 1.6, borderRadius: 0, outline: 'none', background: 'var(--bg-surface)' }} />
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
  const containerRef = useRef(null);

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
    
    const targetZone = dropZones.find(z => z.id === targetZoneId);
    const existingChipId = targetZone?.placedChipId;

    setDropZones(prev => prev.map(z => {
      if (z.id === targetZoneId) return { ...z, placedChipId: chipId };
      if (z.id === fromZoneId) return { ...z, placedChipId: null };
      return z;
    }));

    setChipBank(prev => prev.map(c => {
      if (c.id === chipId) return { ...c, placedInZoneId: targetZoneId };
      if (c.id === existingChipId) return { ...c, placedInZoneId: null };
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
    const targetZone = dropZones.find(z => z.id === zoneId);
    const existingChipId = targetZone?.placedChipId;

    setDropZones(prev => prev.map(z => {
      if (z.id === zoneId) return { ...z, placedChipId: chipId };
      if (z.placedChipId === chipId) return { ...z, placedChipId: null };
      return z;
    }));
    setChipBank(prev => prev.map(c => {
      if (c.id === chipId) return { ...c, placedInZoneId: zoneId };
      if (c.id === existingChipId) return { ...c, placedInZoneId: null };
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

  // Render Image-based diagram
  if (question.image) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>DRAG LABELS TO THE CORRECT POSITIONS</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, background: '#F0F0F0', padding: '1rem', border: '2px solid #000' }}>
            {(submitted && answer?.chipBank ? answer.chipBank : chipBank).map(chip => {
              const isUsed = chip.placedInZoneId !== null;
              const isSelected = chip.id === selectedChipId;
              const style = { padding: '8px 14px', background: isUsed ? '#DDD' : isSelected ? '#000' : '#FFF', color: isUsed ? '#888' : isSelected ? '#FFF' : '#000', border: '2px solid #000', fontWeight: 900, fontSize: 12, cursor: isUsed || submitted ? 'default' : 'pointer', opacity: isUsed ? 0.5 : 1 };
              return (
                <div key={chip.id} style={style} draggable={!isUsed && !submitted && !isMobile} 
                  onDragStart={(e) => !isMobile && handleChipDragStart(e, chip.id, 'bank')}
                  onClick={() => isMobile && !isUsed && !submitted && handleChipTap(chip.id)}
                >
                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', border: '4px solid #000', background: '#FFF' }}>
          <img src={question.image} style={{ width: '100%', display: 'block' }} alt="Diagram" />
          
          {/* Drop Zones / Masks */}
          {dropZones.map((zone, i) => {
            const bbox = zone.bbox;
            // Calculate position percentages. Bbox is from Tesseract (pixel coordinates)
            // We assume the image is rendered full width.
            const style = {
              position: 'absolute',
              left: `${(bbox.x0 / 10).toFixed(2)}%`, // This is a fallback if we don't have natural size
              top: `${(bbox.y0 / 10).toFixed(2)}%`,
              width: `${((bbox.x1 - bbox.x0) / 10).toFixed(2)}%`,
              height: `${((bbox.y1 - bbox.y0) / 10).toFixed(2)}%`,
            };
            
            // Re-calculate based on a 1000-unit coordinate system for simplicity
            // or we can just use the raw bbox if we know the source resolution.
            // Actually, Tesseract's bbox is relative to the input image size.
            // Let's use a more robust way to scale them.
            // For now, I'll use a trick: place them using style based on image natural size vs current size
            
            return <SmartDropZone 
              key={zone.id} 
              zone={zone} 
              bbox={bbox}
              submitted={submitted}
              answer={answer}
              zr={zoneResults.find(r => r.zoneId === zone.id)}
              chipBank={submitted && answer?.chipBank ? answer.chipBank : chipBank}
              isMobile={isMobile}
              selectedChipId={selectedChipId}
              dragState={dragState}
              onDrop={handleDrop}
              onTap={handleZoneTap}
              onRemove={handleRemoveFromZone}
            />;
          })}
        </div>

        {!submitted && (
          <div className="mt-8">
            <button className="btn btn-primary w-full" disabled={!allFilled} onClick={submit} style={{ height: 56, fontSize: 16 }}>Check Answers ({placed}/{total} Placed)</button>
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

  // Fallback to original node-based diagram
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
                    {submitted && zr && !zr.isCorrect && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: 'max-content', textAlign: 'center', fontSize: 12, color: '#000', background: 'var(--correct-bg)', padding: '2px 8px', border: '1px solid var(--correct)', fontWeight: 700, zIndex: 20 }}>
                        Ans: {zr.correctLabel}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <React.Fragment key={node.id}>
                  {node.type === 'start' || node.type === 'end' ? (
                    <div style={{ background: '#000000', color: 'white', borderRadius: 0, padding: DropZoneCmp ? '20px 24px' : '10px 24px', fontSize: 14, fontWeight: 600, boxShadow: 'none', position: 'relative', marginBottom: (submitted && !DropZoneCmp === false) ? 20 : 0 }}>
                      {DropZoneCmp || node.display_text}
                    </div>
                  ) : node.type === 'decision' ? (
                    <div style={{ width: 130, height: 130, transform: 'rotate(45deg)', background: 'var(--bg-card)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0, boxShadow: 'none' }}>
                      <div style={{ transform: 'rotate(-45deg)', padding: 12, fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
                        {DropZoneCmp || node.display_text}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 0, padding: DropZoneCmp ? '20px' : '12px 20px', minWidth: 160, textAlign: 'center', fontSize: 14, fontWeight: 500, boxShadow: 'none', position: 'relative', marginBottom: (submitted && DropZoneCmp) ? 20 : 0 }}>
                      {DropZoneCmp || node.display_text}
                    </div>
                  )}
                  {i < question.nodes.length - 1 && (
                    <div style={{ width: 2, height: 60, background: 'var(--border-strong)', margin: '0 auto', position: 'relative' }}>
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

function SmartDropZone({ zone, bbox, submitted, answer, zr, chipBank, isMobile, selectedChipId, dragState, onDrop, onTap, onRemove }) {
  const [parentSize, setParentSize] = useState({ w: 1, h: 1 });
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.parentElement) {
      const img = ref.current.parentElement.querySelector('img');
      if (img) {
        const update = () => {
          setParentSize({ w: img.clientWidth, h: img.clientHeight });
        };
        img.addEventListener('load', update);
        window.addEventListener('resize', update);
        update();
        return () => {
          img.removeEventListener('load', update);
          window.removeEventListener('resize', update);
        };
      }
    }
  }, []);

  const filledChip = chipBank.find(c => c.id === zone.placedChipId);
  
  // Tesseract bbox is relative to the original image size.
  // We need to calculate percentages.
  // But we don't know the original image size easily without loading it.
  // A better way: Tesseract provides normalized coordinates or we can just use the img.naturalWidth/Height.
  
  const img = ref.current?.parentElement?.querySelector('img');
  const nw = img?.naturalWidth || 1000;
  const nh = img?.naturalHeight || 1000;

  const style = {
    position: 'absolute',
    left: `${(bbox.x0 / nw * 100).toFixed(2)}%`,
    top: `${(bbox.y0 / nh * 100).toFixed(2)}%`,
    width: `${((bbox.x1 - bbox.x0) / nw * 100).toFixed(2)}%`,
    height: `${((bbox.y1 - bbox.y0) / nh * 100).toFixed(2)}%`,
    border: '1px solid #000',
    background: '#FFF', // Masking the original text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'min(1.5vw, 12px)',
    fontWeight: 900,
    cursor: 'pointer',
    transition: 'all 0.1s',
    zIndex: 5,
    overflow: 'hidden',
    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)'
  };

  if (dragState.overZoneId === zone.id || (isMobile && selectedChipId)) {
    style.background = '#000'; style.color = '#FFF';
  } else if (filledChip) {
    style.background = '#000'; style.color = '#FFF';
  }

  if (submitted && zr) {
    style.background = zr.isCorrect ? 'var(--correct-bg)' : 'var(--wrong-bg)';
    style.color = zr.isCorrect ? 'var(--correct)' : 'var(--wrong)';
    style.borderColor = zr.isCorrect ? 'var(--correct)' : 'var(--wrong)';
    style.zIndex = 10;
  }

  return (
    <div ref={ref} style={style}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={e => onDrop(e, zone.id)}
      onClick={() => onTap(zone.id)}
    >
      {filledChip ? filledChip.label : (submitted ? 'Empty' : '')}
      {filledChip && !submitted && <div style={{position:'absolute', top:0, right:0, background:'#F00', color:'#FFF', padding:'0 2px', fontSize:8}} onClick={(e)=>{e.stopPropagation(); onRemove(zone.id);}}>✕</div>}
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
      <div className="card text-center mb-8 fade-in-up" style={{ padding: '4rem 2rem', background: '#FFFFFF', border: '4px solid #000', boxShadow: '12px 12px 0px #000' }}>
        <h1 style={{ fontSize: 48, marginBottom: '2rem' }}>SESSION COMPLETE</h1>
        
        <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto' }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="90" stroke="#F0F0F0" strokeWidth="20" fill="none" />
            <circle cx="110" cy="110" r="90" stroke="#000" strokeWidth="20" fill="none" strokeDasharray="565" strokeDashoffset={565 - (scorePct / 100 * 565)} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: '#000' }}>{scorePct}%</span>
          </div>
        </div>
        
        <p style={{ color: '#000', marginTop: 32, fontSize: 24, fontWeight: 900, textTransform: 'uppercase' }}>{msg}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '3rem', background: '#000', padding: '2rem', color: '#FFF' }}>
          <div><div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 900, marginBottom: 8 }}>Correct</div><div style={{ fontSize: 32, fontWeight: 900 }}>{correct}</div></div>
          <div><div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 900, marginBottom: 8 }}>Wrong</div><div style={{ fontSize: 32, fontWeight: 900 }}>{wrong}</div></div>
          <div><div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 900, marginBottom: 8 }}>Skipped</div><div style={{ fontSize: 32, fontWeight: 900 }}>{skipped}</div></div>
          <div><div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 900, marginBottom: 8 }}>Time</div><div style={{ fontSize: 32, fontWeight: 900 }}>{Math.floor(timeTaken/60)}m {timeTaken%60}s</div></div>
        </div>
      </div>

      {/* SECTION B — STUDY RECOMMENDATIONS (MOVED UP FOR BETTER UX) */}
      <h2 className="mb-4" style={{ fontSize: 28, fontWeight: 900 }}>AI STUDY PLAN</h2>
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
