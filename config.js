const CONFIG = {
    APP_NAME: "EduSolve AI",
    MODEL: "openai/gpt-4o-mini", // Or you can let the backend decide
    API_URL: "/api/chat",
    SUBJECTS: [
        "All Subjects",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "General Science"
    ],
    SUGGESTED_PROMPTS: [
        "Explain the Pythagorean theorem with examples.",
        "How does photosynthesis work?",
        "Solve this algebraic equation: 2x + 5 = 15",
        "What are Newton's three laws of motion?"
    ],
    UI: {
        DEFAULT_THEME: "dark",
        MAX_HISTORY: 50
    }
};

// Prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.SUBJECTS);
Object.freeze(CONFIG.SUGGESTED_PROMPTS);
Object.freeze(CONFIG.UI);
