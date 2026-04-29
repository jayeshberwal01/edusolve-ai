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
        let systemPrompt = `You are EduSolve AI, an expert Mathematics and Science tutor for all levels (school, college, exam prep, curious learners). 
Your tone is friendly, smart, patient, and highly educational.
You must:
- Explain concepts clearly and simply.
- Solve Math/Science problems step-by-step.
- Explain formulas before applying them.
- Use headings, bullet points, and proper Markdown formatting.
- Use LaTeX for mathematical formulas (render math inline using $...$ and block equations using $$...$$).

Current Subject Focus: ${subject || 'All Subjects'}. Adapt your examples and focus accordingly.`;

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
