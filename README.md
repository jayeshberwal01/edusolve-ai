# EduSolve AI

A complete, production-ready AI-powered educational web application focused on Mathematics and Science for all students. It features an intelligent chatbot tutor, PDF upload with knowledge base extraction, voice input, text-to-speech, and full Markdown + Math rendering support.

## Features
- **AI Chatbot Tutor**: Instant doubt resolution for Math and Science.
- **Subject Modes**: Switch between All Subjects, Mathematics, Physics, Chemistry, Biology, and General Science.
- **PDF Upload & RAG**: Upload textbooks or notes to get context-aware answers.
- **Voice Input & Read Aloud**: Speak your questions and listen to the answers.
- **Markdown & Math**: Beautifully rendered LaTeX formulas and code blocks.
- **Chat History**: Save and manage your past study sessions locally.
- **Themes**: Dark and Light modes with smooth transitions.
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop.

## Technologies Used
- HTML, CSS (Vanilla, Glassmorphism), JavaScript (Vanilla)
- Marked.js (Markdown rendering)
- KaTeX (Math rendering)
- PDF.js (Client-side PDF text extraction)
- Vercel Serverless Functions (Backend API)
- OpenRouter API (AI Model)

---

## GitHub Deployment Steps

1. Create a new repository on GitHub.
2. Upload all files from this folder.
3. Commit the changes.
4. Push to the `main` branch.

## Vercel Deployment Steps

1. Login to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Go to **Environment Variables** and add:
   - `OPENROUTER_API_KEY` = `your_openrouter_api_key_here`
5. Click **Deploy**.
6. Wait for the build to finish and get your live URL.

## Local Development
To run this project locally, you can use Vercel CLI:
```bash
npm i -g vercel
vercel dev
```
Make sure you have a `.env` file locally with `OPENROUTER_API_KEY`.
