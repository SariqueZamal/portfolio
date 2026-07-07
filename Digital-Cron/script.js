document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mouse Spotlight Effect (Global and Card specific)
    const spotlight = document.getElementById('spotlight');
    const serviceCards = document.querySelectorAll('.service-card');
    const projectItems = document.querySelectorAll('.project-item');

    document.addEventListener('mousemove', (e) => {
        // Global spotlight background positioning
        const x = e.clientX;
        const y = e.clientY;
        spotlight.style.setProperty('--x', `${x}px`);
        spotlight.style.setProperty('--y', `${y}px`);

        // Update card hover spotlight variables
        serviceCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardX = x - rect.left;
            const cardY = y - rect.top;
            card.style.setProperty('--mx', `${cardX}px`);
            card.style.setProperty('--my', `${cardY}px`);
        });
    });

    // 2. Shrink Header on Scroll
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Typing Animation in Terminal
    const typingCode = document.getElementById('typing-code');
    const terminalBody = document.getElementById('terminal-body');
    
    const commands = [
        {
            input: 'node dc-system --optimize-web-vitals',
            output: [
                'Analyzing bundle metrics...',
                'Compressing SVG assets and static nodes...',
                '✓ Optimizing Server Side Rendering (SSR) cache...',
                '✓ Peak Lighthouse performance: 100/100',
                'Performance optimization routine COMPLETE.'
            ]
        },
        {
            input: 'cron-agent --connect-vapi --session-id=49221',
            output: [
                'Connecting to Twilio and WebRTC bridge...',
                'Streaming synthesized speech model (8kHz inflection)...',
                '✓ Agent status: ONLINE. Listening for user trigger event...'
            ]
        },
        {
            input: 'make deploy-crm-webhook --env=production',
            output: [
                'Reading schema for Salesforce & PostgreSQL connector...',
                'Binding webhooks for lead updates...',
                '✓ Success: ERP Pipeline integrated. Zero packet dropped.'
            ]
        }
    ];

    let currentCommandIndex = 0;
    let charIndex = 0;

    function typeCommand() {
        if (currentCommandIndex >= commands.length) {
            // Restart cycle from beginning
            currentCommandIndex = 0;
            terminalBody.innerHTML = `
                <div class="terminal-line">
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-code">ssh admin@digitalcron.agency</span>
                </div>
                <div class="terminal-output">Connecting to digitalcron.agency... Connection established.</div>
                <div class="terminal-line">
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-code">./deploy_site_infrastructure.sh</span>
                </div>
                <div class="terminal-output success">✓ Web Infrastructure: Running (React/MongoDB)</div>
                <div class="terminal-output success">✓ Conversational LLM Router: Active</div>
                <div class="terminal-output success">✓ Automated Call Dispatch System: Ready</div>
                <div class="terminal-line">
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-code" id="typing-code"></span><span class="terminal-cursor"></span>
                </div>
            `;
            // Re-fetch elements after reset
            const newTypingCode = document.getElementById('typing-code');
            charIndex = 0;
            setTimeout(() => runTypingCycle(newTypingCode), 1000);
            return;
        }

        const cmd = commands[currentCommandIndex];
        const activeTypingCode = document.getElementById('typing-code') || typingCode;
        
        if (charIndex < cmd.input.length) {
            activeTypingCode.textContent += cmd.input.charAt(charIndex);
            charIndex++;
            setTimeout(typeCommand, 60);
        } else {
            // Command fully typed, print outputs
            setTimeout(() => {
                printOutputs(cmd.output);
            }, 500);
        }
    }

    function printOutputs(outputList) {
        const activeTypingCode = document.getElementById('typing-code');
        
        // Remove cursor from current active typing line
        const cursor = document.querySelector('.terminal-cursor');
        if (cursor) cursor.remove();

        // Print outputs line by line
        let outputLineIndex = 0;
        
        function printNextLine() {
            if (outputLineIndex < outputList.length) {
                const lineContent = outputList[outputLineIndex];
                const isSuccess = lineContent.startsWith('✓');
                
                const outputDiv = document.createElement('div');
                outputDiv.className = isSuccess ? 'terminal-output success' : 'terminal-output';
                outputDiv.textContent = lineContent;
                
                terminalBody.appendChild(outputDiv);
                terminalBody.scrollTop = terminalBody.scrollHeight;
                
                outputLineIndex++;
                setTimeout(printNextLine, 350);
            } else {
                // Done printing outputs, make a new prompt line
                setTimeout(() => {
                    const promptLine = document.createElement('div');
                    promptLine.className = 'terminal-line';
                    promptLine.innerHTML = `
                        <span class="terminal-prompt">$</span>
                        <span class="terminal-code" id="typing-code"></span><span class="terminal-cursor"></span>
                    `;
                    terminalBody.appendChild(promptLine);
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                    
                    currentCommandIndex++;
                    charIndex = 0;
                    setTimeout(typeCommand, 1000);
                }, 1000);
            }
        }
        
        printNextLine();
    }

    function runTypingCycle(target) {
        typeCommand();
    }

    // Launch typing loop
    setTimeout(() => runTypingCycle(typingCode), 1200);

    // 4. Smooth Section Fade-In on Scroll (Reveal)
    const sections = document.querySelectorAll('section');
    
    // Set initial opacity to 0 and transition via JS/CSS class helper
    sections.forEach(sec => {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(30px)';
        sec.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const sectionObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(sec => sectionObserver.observe(sec));
});
