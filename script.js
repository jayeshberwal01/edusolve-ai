/**
 * EduSolve AI - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const elements = {
        sidebar: document.getElementById('sidebar'),
        menuBtn: document.getElementById('menu-btn'),
        closeSidebarBtn: document.getElementById('close-sidebar-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        themeLabel: document.getElementById('theme-label-text'),
        html: document.documentElement,
        subjectSelector: document.getElementById('subject-selector'),
        suggestedPromptsGrid: document.getElementById('suggested-prompts-grid'),
        landingPage: document.getElementById('landing-page'),
        appContainer: document.getElementById('app-container'),
        launchAppNavBtn: document.getElementById('launch-app-nav-btn'),
        launchAppHeroBtn: document.getElementById('launch-app-hero-btn'),
        preChatView: document.getElementById('pre-chat-view'),
        chatView: document.getElementById('chat-view'),
        chatBox: document.getElementById('chat-box'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        micBtn: document.getElementById('mic-btn'),
        newChatBtn: document.getElementById('new-chat-btn'),
        chatHistoryList: document.getElementById('chat-history-list'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        downloadHistoryBtn: document.getElementById('download-history-btn'),
        pdfUploadBtn: document.getElementById('pdf-upload-btn'),
        pdfInput: document.getElementById('pdf-input'),
        pdfStatusBanner: document.getElementById('pdf-status-banner'),
        pdfFileName: document.getElementById('pdf-file-name'),
        clearPdfBtn: document.getElementById('clear-pdf-btn')
    };

    // --- State Variables ---
    let currentSessionId = Date.now().toString();
    let chatHistory = JSON.parse(localStorage.getItem('edusolve_history')) || {};
    let messages = []; // Current session messages for API
    let isGenerating = false;
    let extractedPdfText = ""; // Holds text from uploaded PDF
    let speechRecognition = null;
    let isListening = false;

    // --- Initialization ---
    init();

    function init() {
        setupTheme();
        populateSubjects();
        populateSuggestedPrompts();
        renderHistorySidebar();
        setupEventListeners();
        setupSpeechRecognition();
        
        // Configure marked.js for secure markdown parsing
        marked.setOptions({
            breaks: true,
            gfm: true
        });
    }

    // --- Setup Functions ---
    function setupTheme() {
        const savedTheme = localStorage.getItem('theme') || CONFIG.UI.DEFAULT_THEME;
        applyTheme(savedTheme);
        elements.themeToggle.checked = savedTheme === 'dark';
        
        elements.themeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    function applyTheme(theme) {
        elements.html.setAttribute('data-theme', theme);
        elements.themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }

    function populateSubjects() {
        CONFIG.SUBJECTS.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            elements.subjectSelector.appendChild(option);
        });
    }

    function populateSuggestedPrompts() {
        CONFIG.SUGGESTED_PROMPTS.forEach(prompt => {
            const card = document.createElement('button');
            card.className = 'prompt-card';
            card.textContent = prompt;
            card.addEventListener('click', () => {
                elements.userInput.value = prompt;
                handleSend();
            });
            elements.suggestedPromptsGrid.appendChild(card);
        });
    }

    let originalInputText = "";
    const SVG_MIC = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg><span class="tooltip">Voice Input</span>`;
    const SVG_STOP = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg><span class="tooltip">Stop Recording</span>`;

    function setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            speechRecognition = new SpeechRecognition();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;

            speechRecognition.onstart = () => {
                isListening = true;
                elements.micBtn.classList.add('mic-active');
                elements.micBtn.innerHTML = SVG_STOP;
                originalInputText = elements.userInput.value;
                if (originalInputText && !originalInputText.endsWith(' ')) originalInputText += ' ';
            };

            speechRecognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        originalInputText += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                elements.userInput.value = originalInputText + interimTranscript;
                autoResizeTextarea();
                toggleSendButton();
            };

            speechRecognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                stopListening();
            };

            speechRecognition.onend = () => {
                stopListening();
            };
        } else {
            elements.micBtn.style.display = 'none'; // Hide if not supported
        }
    }

    function toggleListening() {
        if (!speechRecognition) return;
        
        if (isListening) {
            stopListening();
        } else {
            speechRecognition.start();
        }
    }

    function stopListening() {
        if (speechRecognition && isListening) {
            speechRecognition.stop();
            isListening = false;
            elements.micBtn.classList.remove('mic-active');
            elements.micBtn.innerHTML = SVG_MIC;
            autoResizeTextarea();
            toggleSendButton();
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Sidebar Mobile
        elements.menuBtn.addEventListener('click', () => elements.sidebar.classList.add('open'));
        elements.closeSidebarBtn.addEventListener('click', () => elements.sidebar.classList.remove('open'));
        
        // App Launch
        const launchApp = () => {
            elements.landingPage.classList.remove('active');
            elements.appContainer.classList.remove('hidden');
        };
        elements.launchAppNavBtn.addEventListener('click', launchApp);
        elements.launchAppHeroBtn.addEventListener('click', launchApp);
        
        // Input handling
        elements.userInput.addEventListener('input', () => {
            autoResizeTextarea();
            toggleSendButton();
        });

        elements.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        elements.sendBtn.addEventListener('click', handleSend);
        elements.micBtn.addEventListener('click', toggleListening);
        
        // PDF Handling
        elements.pdfUploadBtn.addEventListener('click', () => elements.pdfInput.click());
        elements.pdfInput.addEventListener('change', handlePdfUpload);
        elements.clearPdfBtn.addEventListener('click', clearPdf);

        // Chat controls
        elements.newChatBtn.addEventListener('click', startNewChat);
        elements.clearHistoryBtn.addEventListener('click', clearHistory);
        elements.downloadHistoryBtn.addEventListener('click', downloadHistory);
    }

    function autoResizeTextarea() {
        elements.userInput.style.height = 'auto';
        elements.userInput.style.height = (elements.userInput.scrollHeight) + 'px';
    }

    function toggleSendButton() {
        elements.sendBtn.disabled = elements.userInput.value.trim() === '' || isGenerating;
    }

    function switchToChatView() {
        if (elements.preChatView.classList.contains('active')) {
            elements.preChatView.classList.remove('active');
            elements.chatView.classList.add('active');
        }
    }

    // --- Core Logic ---

    async function handleSend() {
        const text = elements.userInput.value.trim();
        if (!text || isGenerating) return;

        // UI Reset
        elements.userInput.value = '';
        elements.userInput.style.height = 'auto';
        toggleSendButton();
        switchToChatView();

        // Add User Message
        appendMessage('user', text);
        messages.push({ role: "user", content: text });
        saveCurrentSession();

        // Prepare bot UI
        const botMessageId = 'msg-' + Date.now();
        appendTypingIndicator(botMessageId);
        isGenerating = true;
        toggleSendButton();

        // API Call
        try {
            const subject = elements.subjectSelector.value;
            
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    subject: subject,
                    pdfContext: extractedPdfText
                })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || data.error);
            }

            const aiReply = data.choices[0].message.content;
            
            removeTypingIndicator(botMessageId);
            appendMessage('bot', aiReply, botMessageId);
            messages.push({ role: "assistant", content: aiReply });
            saveCurrentSession();

        } catch (error) {
            console.error("Error communicating with AI:", error);
            removeTypingIndicator(botMessageId);
            appendMessage('bot', `⚠️ **Error:** Sorry, I encountered an error. Please try again later.\n\nDetails: ${error.message}`, botMessageId);
            // Don't save error to message history array to allow retry
        } finally {
            isGenerating = false;
            toggleSendButton();
        }
    }

    // --- UI Rendering ---

    function appendMessage(role, text, id = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        if (id) msgDiv.id = id;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = role === 'user' ? 'U' : 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (role === 'user') {
            contentDiv.textContent = text;
        } else {
            // --- Math Protection System ---
            const mathBlocks = [];
            let mathIndex = 0;

            // Protect block math ($$ ... $$ and \[ ... \])
            let processedText = text.replace(/(\$\$|\\\[)([\s\S]*?)(\$\$|\\\])/g, (match, left, content, right) => {
                const id = `___MATH_BLOCK_${mathIndex}___`;
                mathBlocks.push({ id, content, isBlock: true });
                mathIndex++;
                return id;
            });

            // Protect inline math ($ ... $ and \( ... \))
            // Only match if not preceded by a backslash, and don't match empty $$
            processedText = processedText.replace(/(?<!\\)(\$|\\\()([^\$\n]+?)(\$|\\\))/g, (match, left, content, right) => {
                const id = `___MATH_INLINE_${mathIndex}___`;
                mathBlocks.push({ id, content, isBlock: false });
                mathIndex++;
                return id;
            });

            // Render Markdown
            let htmlContent = marked.parse(processedText);

            // Render and Restore Math
            mathBlocks.forEach(block => {
                try {
                    const katexHtml = katex.renderToString(block.content, {
                        displayMode: block.isBlock,
                        throwOnError: false
                    });
                    htmlContent = htmlContent.replace(block.id, katexHtml);
                } catch (e) {
                    // Fallback to raw text if KaTeX fails
                    htmlContent = htmlContent.replace(block.id, block.content);
                }
            });

            contentDiv.innerHTML = htmlContent;

            // Add actions (TTS, Copy)
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'icon-btn small tooltip-container';
            copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span class="tooltip">Copy Text</span>`;
            copyBtn.onclick = () => navigator.clipboard.writeText(text);

            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'icon-btn small tooltip-container';
            ttsBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg><span class="tooltip">Read Aloud</span>`;
            ttsBtn.onclick = () => speakText(text, ttsBtn);

            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(ttsBtn);
            contentDiv.appendChild(actionsDiv);
        }

        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);
        
        elements.chatBox.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendTypingIndicator(id) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.id = id;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-indicator';
        contentDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);
        
        elements.chatBox.appendChild(msgDiv);
        scrollToBottom();
    }

    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        elements.chatView.scrollTop = elements.chatView.scrollHeight;
    }

    // --- PDF Handling ---

    async function handlePdfUpload(event) {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') return;

        elements.pdfFileName.textContent = `Loading ${file.name}...`;
        elements.pdfStatusBanner.classList.remove('hidden');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 10); // Limit to first 10 pages for client-side to prevent payload overload
            
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + "\n\n";
            }

            // Simple text chunking to keep payload size reasonable (approx 5000 chars)
            extractedPdfText = fullText.length > 5000 ? fullText.substring(0, 5000) + "... [truncated]" : fullText;
            
            elements.pdfFileName.textContent = file.name;
            elements.pdfStatusBanner.classList.remove('hidden');

        } catch (error) {
            console.error("PDF Parsing Error:", error);
            elements.pdfFileName.textContent = "Failed to read PDF";
            setTimeout(clearPdf, 3000);
        }
        
        // Reset input so same file can be uploaded again if needed
        elements.pdfInput.value = "";
    }

    function clearPdf() {
        extractedPdfText = "";
        elements.pdfStatusBanner.classList.add('hidden');
        elements.pdfFileName.textContent = "";
    }

    // --- Text to Speech ---
    
    let currentTtsBtn = null;
    const SVG_PLAY = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg><span class="tooltip">Read Aloud</span>`;
    const SVG_STOP_TTS = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg><span class="tooltip">Stop Reading</span>`;

    function speakText(text, btnElement) {
        if (!('speechSynthesis' in window)) {
            alert("Text-to-speech is not supported in this browser.");
            return;
        }

        // Cancel existing speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            if (currentTtsBtn) {
                currentTtsBtn.innerHTML = SVG_PLAY;
                currentTtsBtn.classList.remove('mic-active');
            }
            // If they clicked the same button, we just stop
            if (currentTtsBtn === btnElement) {
                currentTtsBtn = null;
                return;
            }
        }

        // Strip markdown and math syntax before speaking
        const plainText = text.replace(/[*_#`~>]/g, '').replace(/(\$\$|\\\[|\\\]|\$|\\\()/g, '');
        const utterance = new SpeechSynthesisUtterance(plainText);
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Natural')));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
            if (currentTtsBtn === btnElement) {
                btnElement.innerHTML = SVG_PLAY;
                btnElement.classList.remove('mic-active');
                currentTtsBtn = null;
            }
        };

        utterance.onerror = () => {
            if (currentTtsBtn === btnElement) {
                btnElement.innerHTML = SVG_PLAY;
                btnElement.classList.remove('mic-active');
                currentTtsBtn = null;
            }
        };

        // Start speaking and change UI to Stop state
        currentTtsBtn = btnElement;
        btnElement.innerHTML = SVG_STOP_TTS;
        btnElement.classList.add('mic-active');
        window.speechSynthesis.speak(utterance);
    }

    // --- History Management ---

    function startNewChat() {
        currentSessionId = Date.now().toString();
        messages = [];
        elements.chatBox.innerHTML = '';
        
        elements.chatView.classList.remove('active');
        elements.preChatView.classList.add('active');
        
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('open');
        }
    }

    function saveCurrentSession() {
        if (messages.length === 0) return;
        
        // Generate title from first user message
        const firstUserMsg = messages.find(m => m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '') : 'New Session';

        chatHistory[currentSessionId] = {
            title: title,
            timestamp: parseInt(currentSessionId),
            messages: [...messages]
        };

        // Enforce max history
        const sessionKeys = Object.keys(chatHistory).sort((a, b) => b - a);
        if (sessionKeys.length > CONFIG.UI.MAX_HISTORY) {
            const keysToRemove = sessionKeys.slice(CONFIG.UI.MAX_HISTORY);
            keysToRemove.forEach(k => delete chatHistory[k]);
        }

        localStorage.setItem('edusolve_history', JSON.stringify(chatHistory));
        renderHistorySidebar();
    }

    function renderHistorySidebar() {
        elements.chatHistoryList.innerHTML = '';
        const sessions = Object.values(chatHistory).sort((a, b) => b.timestamp - a.timestamp);
        
        sessions.forEach(session => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.textContent = session.title;
            if (session.timestamp.toString() === currentSessionId) {
                li.classList.add('active');
            }
            
            li.addEventListener('click', () => loadSession(session.timestamp.toString()));
            elements.chatHistoryList.appendChild(li);
        });
    }

    function loadSession(sessionId) {
        const session = chatHistory[sessionId];
        if (!session) return;

        currentSessionId = sessionId;
        messages = [...session.messages];
        
        elements.chatBox.innerHTML = '';
        switchToChatView();
        
        messages.forEach(msg => {
            appendMessage(msg.role, msg.content);
        });

        renderHistorySidebar();
        
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('open');
        }
    }

    function clearHistory() {
        if (confirm("Are you sure you want to clear all chat history?")) {
            chatHistory = {};
            localStorage.removeItem('edusolve_history');
            startNewChat();
            renderHistorySidebar();
        }
    }

    function downloadHistory() {
        if (Object.keys(chatHistory).length === 0) {
            alert("No history to download.");
            return;
        }

        let txtContent = "=== EduSolve AI Chat History ===\n\n";
        
        const sessions = Object.values(chatHistory).sort((a, b) => b.timestamp - a.timestamp);
        sessions.forEach(session => {
            txtContent += `--- Session: ${session.title} (${new Date(session.timestamp).toLocaleString()}) ---\n\n`;
            session.messages.forEach(msg => {
                const role = msg.role === 'user' ? 'You' : 'EduSolve AI';
                txtContent += `${role}:\n${msg.content}\n\n`;
            });
            txtContent += "========================================\n\n";
        });

        const blob = new Blob([txtContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "EduSolve_History.txt";
        a.click();
        URL.revokeObjectURL(url);
    }
});
