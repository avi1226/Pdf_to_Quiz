# RawPrep

A 100% offline, browser-based quiz generator that turns your study documents into interactive quizzes. Upload a file, configure your session, and start practising — no server, no API keys, no data ever leaving your machine.

---

## Features

- **Multi-format document support** — PDF, PPTX (PowerPoint), DOCX (Word), and plain text files.
- **OCR for scanned / handwritten PDFs** — Powered by Tesseract.js with multi-strategy image preprocessing (grayscale, high-contrast, adaptive threshold) and a built-in spell-correction engine tuned for common OCR mis-reads.
- **Five question types**
  - Multiple Choice (MCQ)
  - True / False
  - Fill-in-the-Blank
  - Short Answer
  - Diagram (drag-and-drop label matching)
- **Diagram extraction** — Automatically pulls images from PDFs and scans them for labels to create interactive diagram questions.
- **Configurable quizzes** — Choose question count, difficulty level, quiz mode, and which question types to include.
- **Performance analytics** — Session summary with score, time tracking, topic heatmaps, and a generated study plan.
- **Brutalist design** — High-contrast black-and-white UI built for focus (Inter + Space Grotesk typography, hard shadows, zero border-radius).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| PDF parsing | PDF.js |
| PPTX parsing | JSZip |
| DOCX parsing | Mammoth.js |
| OCR | Tesseract.js |
| Styling | Vanilla CSS (Brutalist system) |

All libraries are loaded from CDN at runtime — the only npm dependencies are React and Vite.

---

## Getting Started

```bash
# 1. Clone the repo
git clone <repository-url>
cd QuizApp

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open the URL printed in your terminal (usually `http://localhost:5173`), upload a document, and start your quiz.

### Production build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
QuizApp/
├── index.html          # Entry HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        # React mount point
    ├── App.jsx         # Entire application (single-file component)
    ├── App.css
    └── index.css
```

The app is intentionally kept as a single large component (`App.jsx`) for portability — no routing, no external state management.

---

## How It Works

1. **Upload** — Drop a PDF, PPTX, DOCX, or TXT file.
2. **Extract** — The app parses text client-side. Scanned PDFs trigger OCR automatically when digital text is sparse.
3. **Generate** — Questions are generated locally by analysing sentences, extracting key terms, and building plausible distractors — no LLM required.
4. **Quiz** — Answer questions one at a time with instant feedback.
5. **Review** — See your score, time spent, and a personalised study plan.

---

## Privacy

Everything runs in your browser. Documents are never uploaded to any server, quiz results are never tracked, and no API keys are needed.

---

## License

This project is provided as-is for personal and educational use.
