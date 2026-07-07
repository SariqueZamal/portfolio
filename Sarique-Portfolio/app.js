// Sarique Zamal - Portfolio Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initSpotlight();
    initHeaderScroll();
    initMobileNav();
    initTechStack();
    initTerminal();
    initProjectModals();
    initEmailCopy();
    initContactForm();
    initFooterYear();
});

/* 1. Spotlight Tracking */
function initSpotlight() {
    const spotlight = document.querySelector('.spotlight');
    if (!spotlight) return;

    // Set initial spotlight coordinates
    document.documentElement.style.setProperty('--x', '50%');
    document.documentElement.style.setProperty('--y', '50%');

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        document.documentElement.style.setProperty('--x', `${x}px`);
        document.documentElement.style.setProperty('--y', `${y}px`);
    });
}

/* 2. Header Scroll Effect */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* 3. Mobile Navigation Toggle */
function initMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close menu when a navigation link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });
}

/* 4. Tech Stack Cards Hover and Expansion */
function initTechStack() {
    const cards = document.querySelectorAll('.tech-card');
    cards.forEach(card => {
        // Spotlight effect within the bounds of individual cards
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);
        });

        // Expand details on click
        card.addEventListener('click', () => {
            // Close other active cards in the same group to keep layout clean
            const group = card.closest('.tech-group');
            const siblingCards = group.querySelectorAll('.tech-card');
            siblingCards.forEach(c => {
                if (c !== card) c.classList.remove('active');
            });
            card.classList.toggle('active');
        });
    });
}

/* 5. Custom Interactive Bio Terminal */
function initTerminal() {
    const terminalBody = document.getElementById('terminal-body');
    const interactiveLine = document.getElementById('terminal-interactive-line');
    if (!terminalBody || !interactiveLine) return;

    const inputSpan = interactiveLine.querySelector('.terminal-input-span');
    let currentInput = '';
    let isAutotyping = true;

    // Command Library
    const COMMAND_RESPONSES = {
        help: `AVAILABLE COMMANDS:<br>
          - <strong>bio</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Get Sarique's founder background<br>
          - <strong>tech</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Print full core technology arsenal<br>
          - <strong>projects</strong>&nbsp;&nbsp;: List current active projects<br>
          - <strong>system</strong>&nbsp;&nbsp;&nbsp;&nbsp;: Query system specs and connection latency<br>
          - <strong>clear</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Flush console history`,
        bio: `FOUNDER BIOLOGY:<br>
          Sarique Zamal is a Technical Founder & Full-Stack Architect. He bridges the gap between deep code execution and business growth metrics. Currently presiding as Founder of Digital Cron, an automation agency.`,
        tech: `CORE ARSENAL MAP:<br>
          {<br>
          &nbsp;&nbsp;"Frontend": ["React.js", "Virtual DOM optimization", "State virtualizations"],<br>
          &nbsp;&nbsp;"Backend": ["Node.js", "Express API routing", "Microservice architectures"],<br>
          &nbsp;&nbsp;"Database": ["MongoDB Atlas clusters", "Query caching", "Aggregation"],<br>
          &nbsp;&nbsp;"AI_Logic": ["VAPI Real-time Voice APIs", "OpenAI LLM embeddings", "Headless automation grids"]<br>
          }`,
        projects: `ACTIVE PIPELINES:<br>
          1. <strong>Voice AI Support Agent</strong> (Twilio / WebRTC Support)<br>
          2. <strong>Digital Cron Client Portal</strong> (Operations Dashboard)<br>
          3. <strong>Enterprise Inventory Sync Engine</strong> (E-commerce Lock Broker)<br>
          4. <strong>AI Lead Enrichment Agent</strong> (Headless Scraping Pipeline)<br>
          5. <strong>Workflow Orchestrator SaaS</strong> (Retry Webhook Dispatcher)`,
        system: `CRONOS ENVIRONMENT:<br>
          OS: DigitalCron OS v4.2<br>
          CPU: 64-Core Threadripper (AI Enrichment Optimized)<br>
          RAM: 256GB ECC Virtualized Frame Buffers<br>
          STATUS: OPERATIONAL (System Latency: 42ms)`,
    };

    // Preloaded terminal typing logic
    const startupSequence = [
        { type: 'command', text: 'cat welcome.txt' },
        { type: 'output', text: 'Initializing Sarique Zamal Runtime Shell... Done.<br>Type "help" to view custom commands.' }
    ];

    let sequenceIndex = 0;
    
    function runStartupSequence() {
        if (sequenceIndex >= startupSequence.length) {
            isAutotyping = false;
            // Listen for key presses once autotyping is done
            enableInteractiveTerminal();
            return;
        }

        const step = startupSequence[sequenceIndex];
        if (step.type === 'command') {
            typeCommand(step.text, () => {
                sequenceIndex++;
                setTimeout(runStartupSequence, 300);
            });
        } else {
            printOutput(step.text);
            sequenceIndex++;
            setTimeout(runStartupSequence, 300);
        }
    }

    function typeCommand(text, callback) {
        let index = 0;
        inputSpan.textContent = '';
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                inputSpan.textContent += text[index];
                index++;
                terminalBody.scrollTop = terminalBody.scrollHeight;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    executeAutotypedCommand(text);
                    callback();
                }, 400);
            }
        }, 60);
    }

    function executeAutotypedCommand(commandText) {
        // Create permanent line of the executed command
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="terminal-prompt">sarique$</span><span class="terminal-command">${commandText}</span>`;
        terminalBody.insertBefore(line, interactiveLine);
        inputSpan.textContent = '';
    }

    function printOutput(outputHtml, isSuccess = false) {
        const outputLine = document.createElement('div');
        outputLine.className = `terminal-output ${isSuccess ? 'success' : ''}`;
        outputLine.innerHTML = outputHtml;
        terminalBody.insertBefore(outputLine, interactiveLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function enableInteractiveTerminal() {
        window.addEventListener('keydown', handleTerminalKeydown);
        terminalBody.addEventListener('click', () => {
            // Focus trigger visualization
            interactiveLine.style.opacity = 1;
        });
    }

    function handleTerminalKeydown(e) {
        if (isAutotyping) return;

        // Only listen to inputs if focus is inside or viewport is looking near the bio section
        const bioSection = document.getElementById('bio');
        const rect = bioSection.getBoundingClientRect();
        const isInViewport = (rect.top < window.innerHeight && rect.bottom >= 0);
        if (!isInViewport) return;

        // Prevent browser scroll behaviors on Space or Backspace in this section
        if (e.key === 'Backspace') {
            e.preventDefault();
            currentInput = currentInput.slice(0, -1);
            inputSpan.textContent = currentInput;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = currentInput.trim().toLowerCase();
            executeCommand(cmd);
            currentInput = '';
            inputSpan.textContent = '';
        } else if (e.key.length === 1) {
            // Prevent printing special OS keys
            currentInput += e.key;
            inputSpan.textContent = currentInput;
        }
        
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function executeCommand(command) {
        // Append input line
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="terminal-prompt">sarique$</span><span class="terminal-command">${escapeHtml(command)}</span>`;
        terminalBody.insertBefore(line, interactiveLine);

        if (command === '') {
            // Do nothing
        } else if (command === 'clear') {
            const lines = terminalBody.querySelectorAll('.terminal-line:not(#terminal-interactive-line), .terminal-output');
            lines.forEach(l => l.remove());
        } else if (COMMAND_RESPONSES[command]) {
            printOutput(COMMAND_RESPONSES[command]);
        } else {
            printOutput(`bash: command not found: ${escapeHtml(command)}. Type "help" for a list of modules.`, false);
        }

        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Trigger autotyping sequence shortly after load
    setTimeout(runStartupSequence, 800);
}

/* 6. Dynamic Modal Builder for Live Demos and Repo Viewers */
function initProjectModals() {
    const demoTriggers = document.querySelectorAll('.demo-trigger');
    const codeTriggers = document.querySelectorAll('.code-trigger');
    
    const projectDetails = {
        voice: {
            title: "Voice AI Agent Pipeline",
            challenge: "Real-time streaming, latency limits, and Twilio socket coordination.",
            logs: [
                "API CONNECT: Initializing WebRTC endpoint [vapi-rachel-x]",
                "SOCKET BIND: Listening on ws://api.vapi.ai/stream/voice-agent-dialer",
                "DIAL HANDSHAKE: Twilio session established. Call status: CONNECTED",
                "LATENCY CALC: Audio packet round-trip: 42ms",
                "STT PARSER: User speech captured: 'I need to check the status of my shipment'",
                "LLM GENERATE: Parsing prompt mapping [Context: Logistics ERP Database]...",
                "TTS GENERATE: Synthesizing speech via ElevenLabs Neural Engine",
                "VOICE OUTPUT: Rachel agent speaking: 'Your package is on vehicle 4, arrival in 12 mins'",
                "METRICS STATUS: Active Call Duration: 1m 12s | Packet Loss: 0%"
            ],
            interactiveType: "voice"
        },
        cron: {
            title: "Digital Cron Client Portal Dashboard",
            challenge: "Virtualizing dense scroll areas and broadcasting live metrics sync streams.",
            logs: [
                "SYSTEM: Initializing web-socket gateway on port 8080",
                "DB_SYNC: Fetching MongoDB active client collections...",
                "RENDER: Mounting VirtualTable. Target node count: 12,400",
                "WS_BROADCAST: Streaming live event feed for user: DigitalCron_Admin",
                "PERF_AUDIT: React render cycle time: 1.4ms (Target: <16ms)",
                "WS_HEARTBEAT: Clients active: 82 | Connected: 100%"
            ],
            interactiveType: "dashboard"
        },
        broker: {
            title: "Enterprise Inventory Lock Sync Engine",
            challenge: "Preventing race conditions during checkout bursts across multiple APIs.",
            logs: [
                "REDIS_LOCK: Attempting lock acquisition on key: inventory:sku-77812",
                "LOCK_STATUS: Acquired lock by client-node-14. Expiring in 5000ms",
                "API_CALL: Fetching eBay Listing: SKU_77812 stock count: 14",
                "API_CALL: Fetching Amazon Stock listing... Success. Count: 14",
                "LOCK_RELEASE: Checkout complete. Releasing redis lock on inventory:sku-77812",
                "SYNC: Updating stock count -1. Multi-platform push complete."
            ],
            interactiveType: "sync"
        },
        lead: {
            title: "AI Headless Scraping Enrichment Agent",
            challenge: "Bypassing bot mitigations and parsing semi-structured text nodes.",
            logs: [
                "BROWSER_INIT: Launching headless Chrome cluster (Puppeteer worker-3)",
                "PROXY: Routing connection through residential gateway block [US-EAST]",
                "NAVIGATE: Loading target DOM URL... Status: 200 OK",
                "SCRAPE: Extracting body raw HTML node. Size: 182KB",
                "AI_PROMPT: Running Claude StructuredParser. Model response time: 2.1s",
                "DB_SAVE: Success. Inserted enriched lead object (Founder/Digital Cron) into DB."
            ],
            interactiveType: "enrichment"
        },
        orchestrator: {
            title: "Workflow Orchestrator Task Queue Coordinator",
            challenge: "Exponential back-off retry logic and queue safety during traffic spikes.",
            logs: [
                "QUEUE: Initializing BullMQ client. Host: redis://127.0.0.1:6379/1",
                "DISPATCH: Fetching job: invoice-automation-trigger. JobID: 1029",
                "EXECUTE: Running webhook action node. URL: https://api.digitalcron.com/webhooks/invoice",
                "RESPONSE: Webhook target unreachable. Status: 503 Service Unavailable",
                "RETRY: Job failed. Re-queueing with exponential back-off (Retry #1 in 2000ms)",
                "SUCCESS: Retry #1 succeeded. Task status: COMPLETED. Execution time: 12ms"
            ],
            interactiveType: "queue"
        }
    };

    demoTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-project');
            const data = projectDetails[key];
            if (data) {
                openModal(data.title, data.logs, data.interactiveType);
            }
        });
    });

    codeTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-project');
            const data = projectDetails[key];
            if (data) {
                // Show architectural breakdown instead
                const codeBreakdown = [
                    `ARCHITECTURAL OVERVIEW: ${data.title.toUpperCase()}`,
                    `======================================================`,
                    `Solving: ${data.challenge}`,
                    `Status: Verified in Production. Uptime: 99.98%`,
                    ``,
                    `CORE COMPONENT NODES:`,
                    `  [Client Gateway (React)] --> [Routing API Broker (Node.js/Express)]`,
                    `                                      |`,
                    `                                      +--> [Task Queue (Redis)]`,
                    `                                      |`,
                    `                                      +--> [AI Processors (LLMs / WebRTC Voice)]`,
                    `                                      |`,
                    `                                      +--> [Sync Connectors (Shopify/eBay/External APIs)]`,
                    `                                      |`,
                    `                                      +--> [State Storage (MongoDB Atlas)]`,
                    ``,
                    `SYSTEM BENCHMARKS:`,
                    `  - Latency: <150ms on REST APIs, <600ms on Voice Synthesizers`,
                    `  - Database transaction integrity: ACID compliance verified`,
                    `  - Automatic recovery limits: Infinite horizontal scaling via PM2 clusters`
                ];
                openModal(`Architecture: ${data.title}`, codeBreakdown, 'code');
            }
        });
    });

    function openModal(title, logs, type) {
        // Create Modal Overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Modal styling block injected dynamically to maintain portability
        const styleId = 'modal-dynamic-styles';
        if (!document.getElementById(styleId)) {
            const styles = document.createElement('style');
            styles.id = styleId;
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(9, 9, 11, 0.85);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.25s ease;
                    animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .modal-container {
                    width: 90%;
                    max-width: 650px;
                    background: rgba(18, 18, 20, 0.95);
                    border: 1px solid var(--border-focus);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.03);
                }
                .modal-header {
                    background: rgba(9, 9, 11, 0.9);
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--border-muted);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-title {
                    font-family: var(--font-display);
                    font-size: 1.1rem;
                    letter-spacing: -0.01em;
                }
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--transition-smooth);
                }
                .modal-close:hover {
                    color: var(--text-primary);
                }
                .modal-body {
                    padding: 24px;
                    max-height: 450px;
                    overflow-y: auto;
                }
                .modal-log-terminal {
                    background: #000;
                    border: 1px solid var(--border-muted);
                    border-radius: 6px;
                    padding: 18px;
                    font-family: var(--font-mono);
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    min-height: 250px;
                }
                .log-line {
                    margin-bottom: 8px;
                    opacity: 0;
                    transform: translateY(4px);
                    animation: printLog 0.2s ease forwards;
                }
                .log-prompt {
                    color: #71717a;
                    margin-right: 8px;
                }
                .log-text.highlight {
                    color: #fff;
                    font-weight: 500;
                }
                .log-success {
                    color: #22c55e;
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes printLog {
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(styles);
        }

        overlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <span class="modal-title">${title}</span>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-log-terminal" id="modal-logs"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const logsBox = overlay.querySelector('#modal-logs');
        const closeBtn = overlay.querySelector('.modal-close');

        // Play/Simulate log output sequence
        logs.forEach((text, i) => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'log-line';
                
                // Color codes
                let formattedText = text;
                if (text.includes('✓') || text.includes('Success') || text.includes('succeeded') || text.includes('CONNECTED')) {
                    formattedText = `<span class="log-success">${text}</span>`;
                } else if (text.includes('CRITICAL') || text.includes('failed') || text.includes('Service Unavailable')) {
                    formattedText = `<span style="color: #ef4444">${text}</span>`;
                } else if (text.includes('LOCK_RELEASE') || text.includes('DIAL HANDSHAKE')) {
                    formattedText = `<span class="log-text highlight">${text}</span>`;
                }

                line.innerHTML = `<span class="log-prompt">[SYSTEM@CRON_NET]</span><span>${formattedText}</span>`;
                logsBox.appendChild(line);
                logsBox.scrollTop = logsBox.scrollHeight;
            }, i * 250);
        });

        // Close event
        const closeModal = () => {
            overlay.classList.add('closing');
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 250);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        // Escape key binds
        const escapeBind = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                window.removeEventListener('keydown', escapeBind);
            }
        };
        window.addEventListener('keydown', escapeBind);
    }
}

/* 7. Email Address Copy Functionality */
function initEmailCopy() {
    const card = document.getElementById('copy-email-card');
    const emailVal = document.getElementById('email-value');
    const copyBtn = document.getElementById('copy-email-btn');
    if (!card || !emailVal || !copyBtn) return;

    const emailStr = emailVal.textContent.trim();

    card.addEventListener('click', () => {
        navigator.clipboard.writeText(emailStr).then(() => {
            // Success Feedback Animation
            const originalIcon = copyBtn.innerHTML;
            
            // Checkmark Icon
            copyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            `;
            
            const originalLabel = card.querySelector('.contact-label').textContent;
            card.querySelector('.contact-label').textContent = 'Copied to Clipboard!';
            card.querySelector('.contact-label').style.color = '#22c55e';

            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                card.querySelector('.contact-label').textContent = originalLabel;
                card.querySelector('.contact-label').style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy email: ', err);
        });
    });
}

/* 8. Contact Form Handling */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status-msg');
    const submitBtn = document.getElementById('form-submit-btn');
    if (!form || !statusMsg || !submitBtn) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get Input Details
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const company = document.getElementById('form-company').value;
        const msg = document.getElementById('form-message').value;

        // Visual loading trigger
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'CONNECTING PROTOCOLS...';
        submitBtn.disabled = true;

        // Simulate secure SMTP post
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Simple Success logic
            statusMsg.textContent = `[✓] Secure pipeline connection opened. Thank you, ${name}. I will contact you shortly at ${email}.`;
            statusMsg.className = 'form-submit-msg success';
            statusMsg.style.display = 'block';

            // Reset inputs
            form.reset();
            
            // Clear message after 6s
            setTimeout(() => {
                statusMsg.style.display = 'none';
            }, 6000);

        }, 1500);
    });
}

/* 9. Set current dynamic year in Footer */
function initFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}
