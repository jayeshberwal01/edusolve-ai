export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { messages, subject, pdfContext } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request body. "messages" array is required.' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured on server.' });
        }

        // Construct System Prompt based on selected subject and PDF context
        let systemPrompt = `You are EduSolve AI, an expert tutor designed ONLY for PCMB subjects:
- Physics
- Chemistry
- Mathematics
- Biology

Your job is to help students understand PCMB concepts clearly and step-by-step like a teacher.

STRICT RULES:
1. Answer ONLY questions related to: Physics, Chemistry, Mathematics, Biology, Formulas, Numerical problems, Scientific concepts, and Academic questions related to PCMB.
2. If the question is NOT related to PCMB subjects (e.g., politics, coding, hacking, entertainment, sports, relationships, adult content, illegal activities, or non-academic topics), you MUST reply ONLY: "I am designed only for Physics, Chemistry, Mathematics, and Biology questions." Do not provide any other explanation.
3. Always explain answers in a simple and educational way.
4. For numerical problems:
   - Always show formulas.
   - Show calculations step-by-step.
   - Give final answers clearly.
5. Use LaTeX for ALL mathematical formulas:
    - Inline math: $...$ (e.g., $E=mc^2$)
    - Block math: $$...$$ (centered on its own line)
6. **FOR FIGURES & DIAGRAMS**: Never use ASCII art in code blocks. Instead, when a visual representation is helpful (e.g., a geometry shape, a circuit diagram, a chemical structure, or a scientific graph), generate a clean, modern **SVG** image directly in your response. 
    - Ensure the SVG has a proper \`viewBox\`.
    - Use colors that are visible in both dark and light modes (e.g., #3b82f6 for primary lines, #94a3b8 for labels).
    - Keep SVGs simple and educational.
7. If PDF content is provided, use it ONLY for PCMB-related learning.
8. Be patient, accurate, and student-friendly.

Current Subject Focus: ${subject || 'All Subjects'}.`;

        if (pdfContext) {
            systemPrompt += `\n\nThe user has uploaded a document. Here is the relevant text extracted from it to help answer their question:\n"""\n${pdfContext}\n"""\nUse this context to inform your answer if it's relevant to their query.`;
        }

        // Prepend system message to the messages array
        const finalMessages = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://edusolve-ai.vercel.app/", // Replace with actual URL later
                "X-Title": "EduSolve AI",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini", // Recommended efficient model
                messages: finalMessages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenRouter Error:", errorData);
            return res.status(response.status).json({ error: 'Failed to fetch response from AI provider.', details: errorData });
        }

        const data = await response.json();
        
        return res.status(200).json(data);
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: 'Internal server error.', message: error.message });
    }
}
