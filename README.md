<div align="center">
  <h1>✨ EduSolve AI</h1>
  <p><strong>A Premium, AI-Powered Math & Science Tutor for Everyone</strong></p>
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjayeshberwal01%2Fedusolve-ai)
  
  <p>EduSolve AI is an intelligent, accessible, and beautifully designed web application that helps students of all ages master complex Math and Science concepts. It features step-by-step problem solving, interactive textbook (PDF) querying, and seamless voice integration.</p>
</div>

---

## 🚀 Features

- **🧠 Intelligent AI Tutoring:** Powered by advanced LLMs (GPT-4o-mini via OpenRouter), optimized specifically for clear, step-by-step educational breakdowns.
- **📚 Chat with Your Textbooks:** Upload any PDF (syllabus, notes, books). The app extracts the text entirely locally in your browser and uses it as context to answer your specific questions.
- **🎙️ Voice Enabled (Speech-to-Text):** Tired of typing? Use the continuous dictation feature to speak your complex doubts naturally.
- **🔊 Read Aloud (Text-to-Speech):** Perfect for auditory learners. The AI will strip out messy math syntax and read the explanations aloud to you in plain English.
- **📐 Pristine Math Rendering:** Complex calculus and algebra are rendered beautifully in high-definition using **KaTeX**, ensuring zero messy raw LaTeX output.
- **🎨 Premium UI/UX:** A stunning, modern interface featuring **Glassmorphism**, smooth animations, a dedicated landing page, and a seamless Dark/Light mode toggle.
- **🔒 Secure Architecture:** Uses a Vercel Serverless Function as a secure proxy to ensure your API keys are never exposed to the client browser.

---

## 🛠️ Technology Stack

**Frontend:**
- HTML5, Vanilla CSS3 (Custom Glassmorphism Design System)
- Vanilla JavaScript (ES6+)
- **KaTeX:** High-performance math typesetting
- **Marked.js:** Markdown parsing
- **PDF.js:** Client-side secure PDF text extraction

**Backend & Deployment:**
- **Vercel Serverless Functions:** (`api/chat.js`) Node.js backend to securely route requests to the OpenRouter API.
- **GitHub & Vercel Integration:** Zero-configuration continuous deployment.

---

## 💻 Local Setup & Installation

If you want to run or modify this project on your local machine, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your computer.
- An [OpenRouter](https://openrouter.ai/) API key.

### 1. Clone the Repository
```bash
git clone https://github.com/jayeshberwal01/edusolve-ai.git
cd edusolve-ai
```

### 2. Install Dependencies
This project uses the Vercel CLI for local testing of serverless functions.
```bash
npm install
```

### 3. Set Up Environment Variables
Create a file named `.env` in the root folder of the project and add your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_api_key_here
```

### 4. Run the Local Server
Run the project using the Vercel CLI to simulate the production environment:
```bash
npx vercel dev
```
Your app will now be running at `http://localhost:3000`.

---

## ☁️ Deployment

This project is configured to deploy seamlessly on **Vercel**.

1. Push your code to a GitHub repository.
2. Log in to Vercel and click **Add New Project**.
3. Import your GitHub repository.
4. **CRITICAL:** Before clicking Deploy, go to **Environment Variables** in the Vercel dashboard and add:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** `your_api_key_here`
5. Click **Deploy**. Vercel will handle the rest!

---

## 📂 Project Structure

```text
edusolve-ai/
│
├── api/
│   └── chat.js          # Vercel Serverless function (Secure API proxy)
│
├── index.html           # Main HTML structure (Landing page & Chat view)
├── style.css            # Complete styling (Glassmorphism, responsive, themes)
├── script.js            # Core application logic, DOM manipulation, APIs
├── config.js            # Global configuration (Models, subjects)
│
├── package.json         # Node dependencies (Vercel CLI)
├── vercel.json          # Vercel deployment and routing configuration
└── README.md            # You are here!
```

---

## 💡 How It Works Under the Hood

1. **Math Protection Algorithm:** Before Markdown is parsed, a custom regex algorithm scans the text for `$$` and `\[` tags, extracting them and replacing them with safe placeholders (`@@@MATH_BLOCK_X@@@`). This prevents the Markdown engine from corrupting the equations. Once parsed, KaTeX renders the HTML, and it is safely injected back into the document.
2. **Local PDF Processing:** When a user uploads a PDF, the file is never sent to a server. Mozilla's `pdf.js` parses the document directly in the browser's memory, ensuring total privacy. The extracted text is then passed along with the user's prompt to the LLM.
3. **Secure API Proxy:** The frontend `fetch` request calls `/api/chat`. The Vercel Serverless Function receives this, attaches the hidden `OPENROUTER_API_KEY` from the environment variables, and forwards the secure request to OpenRouter.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is open-source and available under the MIT License.
