# PrepAI — Brutalist PDF/PPTX Quizzer

**PrepAI** is a high-performance, 100% local-first web application designed for students and professionals to transform their study materials into interactive quizzes. Built with a bold **Brutalist** aesthetic, PrepAI prioritizes privacy, speed, and focus.

---

## ⚡ Key Features

- **100% Offline Processing**: All document parsing and quiz generation happens directly in your browser. No data is ever sent to a server.
- **Multi-Format Support**: Upload `.pdf` or `.pptx` (PowerPoint) files and start studying instantly.
- **Smart Question Generator**:
  - **Multiple Choice (MCQ)**: Context-aware questions with plausible decoys.
  - **True/False**: Verifies factual accuracy of document statements.
  - **Fill-in-the-Blank**: Tests vocabulary and key concept recall.
  - **Short Answer**: Deep comprehension checks with model-answer comparisons.
  - **Diagrams**: Interactive flowchart and sequence reordering.
- **Brutalist Design System**: A high-contrast, black-and-white UI designed for maximum focus and zero distractions.
- **Advanced Performance Analytics**:
  - **Session Summary**: Instant scoring and time tracking.
  - **Topic Heatmaps**: Visualize which areas of the document you need to review.
  - **AI Study Plan**: Actionable recommendations based on your quiz performance.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Parsing Engines**: 
  - `PDF.js` for robust PDF text extraction.
  - `JSZip` for parsing PowerPoint XML structures.
- **Styling**: Pure CSS with a Brutalist philosophy (thick 2px/4px borders, zero radius, heavy Inter/Space Grotesk typography).
- **No API Required**: Zero dependencies on external AI providers (Anthropic/OpenAI), ensuring a completely free and private experience.

---

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Upload a file** and start your session!

---

## 🛡️ Privacy & Security

PrepAI is designed with **Privacy-by-Design**. Since all processing occurs client-side:
- Your documents are never uploaded.
- Your quiz results are never tracked.
- No API keys are needed.

---

**PrepAI — Prepare smarter, locally.**
