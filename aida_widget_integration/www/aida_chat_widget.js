/**
 * AIDA Chat Widget for Mocxha
 * Floating chat widget that connects to AIDA API server
 */

class AidaChatWidget {
    constructor() {
        this.isOpen = false;
        this.sessionId = null;
        this.userHash = null;
        this.chatHistory = [];
        this.settings = this.loadSettings();
        this.widgetSettings = null;
        
        this.init();
    }

    async init() {
        // Load widget settings from backend
        await this.loadWidgetSettings();
        
        // Only initialize if widget is enabled
        if (this.widgetSettings && this.widgetSettings.widget_enabled) {
            this.createWidget();
            this.bindEvents();
            this.generateUserHash();
            this.loadChatHistory();
            
            // Auto-open if configured
            if (this.widgetSettings.auto_open) {
                setTimeout(() => this.openWidget(), 1000);
            }
        }
    }

    async loadWidgetSettings() {
        try {
            const response = await new Promise((resolve, reject) => {
                frappe.call({
                    method: 'aida_widget_integration.aida_widget_integration.doctype.aida_widget_settings.aida_widget_settings.get_settings',
                    callback: (r) => {
                        if (r.message) {
                            resolve(r.message);
                        } else {
                            reject(new Error('No settings received'));
                        }
                    },
                    error: reject
                });
            });
            
            this.widgetSettings = response;
        } catch (error) {
            console.warn('Failed to load widget settings, using defaults:', error);
            // Use default settings
            this.widgetSettings = {
                widget_enabled: true,
                auto_open: false,
                api_server_url: 'https://aida.mocxha.com',
                welcome_message: "Hello! I'm AIDA, your AI assistant. How can I help you today?",
                widget_position: 'Bottom Right',
                widget_theme: 'Default'
            };
        }
    }

    generateUserHash() {
        // Create unique user hash from Mocxha URL and username
        const erpUrl = window.location.origin;
        const username = frappe.session.user;
        const hashString = `${erpUrl}:${username}`;
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < hashString.length; i++) {
            const char = hashString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        this.userHash = Math.abs(hash).toString(36);
        console.log('Generated user hash:', this.userHash);
    }

    loadSettings() {
        const saved = localStorage.getItem('aida_widget_settings');
        return saved ? JSON.parse(saved) : {
            erpUrl: window.location.origin,
            username: frappe.session.user || '',
            password: '',
            user_avatar_url: '',
            sound_notifications: false,
            conversation_logging: true
        };
    }

    saveSettings() {
        localStorage.setItem('aida_widget_settings', JSON.stringify(this.settings));
    }

    loadChatHistory() {
        const saved = localStorage.getItem(`aida_chat_history_${this.userHash}`);
        if (saved) {
            this.chatHistory = JSON.parse(saved);
            this.renderChatHistory();
        }
    }

    saveChatHistory() {
        localStorage.setItem(`aida_chat_history_${this.userHash}`, JSON.stringify(this.chatHistory));
    }

    createWidget() {
        // Create floating button
        this.floatingBtn = document.createElement('div');
        this.floatingBtn.id = 'aida-floating-btn';
        this.floatingBtn.className = this.getPositionClass();
        this.floatingBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L2 22L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C10.74 20 9.54 19.75 8.46 19.3L6 20L6.7 17.54C6.25 16.46 6 15.26 6 14C6 8.48 8.48 6 12 6C15.52 6 18 8.48 18 12C18 15.52 15.52 18 12 18Z" fill="white"/>
                <circle cx="9" cy="12" r="1" fill="white"/>
                <circle cx="12" cy="12" r="1" fill="white"/>
                <circle cx="15" cy="12" r="1" fill="white"/>
            </svg>
        `;

        // Create widget container
        this.widget = document.createElement('div');
        this.widget.id = 'aida-chat-widget';
        this.widget.className = this.getPositionClass();
        this.widget.innerHTML = `
            <div class="aida-widget-header">
                <div class="aida-widget-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L2 22L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#4F46E5"/>
                        <circle cx="9" cy="12" r="1" fill="white"/>
                        <circle cx="12" cy="12" r="1" fill="white"/>
                        <circle cx="15" cy="12" r="1" fill="white"/>
                    </svg>
                    <span>AIDA Assistant</span>
                </div>
                <div class="aida-widget-controls">
                    <button id="aida-settings-btn" class="aida-control-btn" title="Settings">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM21.83 12L23 10.83C23 10.83 23 10.83 23 10.83C23 10.83 23 10.83 23 10.83L21.83 9.66C21.83 9.66 21.83 9.66 21.83 9.66L20.66 10.83L19.49 9.66L18.32 10.83L19.49 12L18.32 13.17L19.49 14.34L20.66 13.17L21.83 14.34L23 13.17L21.83 12Z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button id="aida-close-btn" class="aida-control-btn" title="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="aida-widget-content">
                <div id="aida-chat-container" class="aida-chat-container">
                    <div id="aida-chat-messages" class="aida-chat-messages"></div>
                    <div class="aida-chat-input-container">
                        <div class="aida-input-wrapper">
                            <textarea id="aida-chat-input" placeholder="Type your message..." rows="1"></textarea>
                            <button id="aida-send-btn" class="aida-send-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="aida-settings-panel" class="aida-settings-panel" style="display: none;">
                    <h3>Settings</h3>
                    <div class="aida-form-group">
                        <label for="aida-erp-url">Mocxha URL:</label>
                        <input type="text" id="aida-erp-url" value="${this.settings.erpUrl}" readonly>
                    </div>
                    <div class="aida-form-group">
                        <label for="aida-username">Username:</label>
                        <input type="text" id="aida-username" value="${this.settings.username}">
                    </div>
                    <div class="aida-form-group">
                        <label for="aida-password">Password:</label>
                        <input type="password" id="aida-password" value="${this.settings.password}">
                    </div>
                    <div class="aida-form-group">
                        <label for="aida-api-url">API Server URL:</label>
                        <input type="text" id="aida-api-url" value="${this.widgetSettings.api_server_url}" readonly>
                        <button type="button" id="aida-test-connection" class="aida-test-btn">Test Connection</button>
                        <div class="aida-session-controls">
                            <button type="button" id="aida-connect-session" class="aida-btn aida-btn-primary">Connect</button>
                            <button type="button" id="aida-disconnect-session-new" class="aida-btn aida-btn-warning">Disconnect</button>
                        </div>
                        <div id="aida-connection-status" class="aida-connection-status"></div>
                        <div id="aida-session-status" class="aida-session-status"></div>
                    </div>
                    <div class="aida-form-actions">
                        <button id="aida-save-settings" class="aida-btn aida-btn-primary">Save Settings</button>
                        <button id="aida-clear-history" class="aida-btn aida-btn-secondary">Clear Chat History</button>
                        <button id="aida-disconnect-session" class="aida-btn aida-btn-warning">Disconnect Session</button>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        document.body.appendChild(this.floatingBtn);
        document.body.appendChild(this.widget);
        
        // Add welcome message if chat history is empty
        if (this.chatHistory.length === 0 && this.widgetSettings.welcome_message) {
            setTimeout(() => {
                this.addMessage('assistant', this.widgetSettings.welcome_message);
            }, 500);
        }
    }

    getPositionClass() {
        if (!this.widgetSettings) return 'aida-position-bottom-right';
        
        switch (this.widgetSettings.widget_position) {
            case 'Bottom Left':
                return 'aida-position-bottom-left';
            case 'Top Right':
                return 'aida-position-top-right';
            case 'Top Left':
                return 'aida-position-top-left';
            default:
                return 'aida-position-bottom-right';
        }
    }

    bindEvents() {
        // Floating button click
        this.floatingBtn.addEventListener('click', () => this.toggleWidget());

        // Close button
        document.getElementById('aida-close-btn').addEventListener('click', () => this.closeWidget());

        // Settings button
        document.getElementById('aida-settings-btn').addEventListener('click', () => this.toggleSettings());

        // Send button
        document.getElementById('aida-send-btn').addEventListener('click', () => this.sendMessage());

        // Enter key in input
        const input = document.getElementById('aida-chat-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => this.autoResizeTextarea(input));
        
        // Mobile keyboard handling removed to prevent positioning issues

        // Save settings
        document.getElementById('aida-save-settings').addEventListener('click', () => this.saveSettingsHandler());

        // Clear history
        document.getElementById('aida-clear-history').addEventListener('click', () => this.clearChatHistory());
        
        // Test connection button
        document.getElementById('aida-test-connection').addEventListener('click', () => {
            this.testConnection();
        });
        
        // Connect session button
        document.getElementById('aida-connect-session').addEventListener('click', () => {
            this.connectSession();
        });
        
        // Disconnect session button (new)
        document.getElementById('aida-disconnect-session-new').addEventListener('click', () => {
            this.disconnectSessionNew();
        });
        
        // Disconnect session button (old)
        document.getElementById('aida-disconnect-session').addEventListener('click', () => {
            this.disconnectSession();
        });
    }

    toggleWidget() {
        if (this.isOpen) {
            this.closeWidget();
        } else {
            this.openWidget();
        }
    }

    openWidget() {
        this.isOpen = true;
        this.widget.classList.add('aida-widget-open');
        this.floatingBtn.style.display = 'none';
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('aida-chat-input').focus();
        }, 300);
    }

    closeWidget() {
        this.isOpen = false;
        this.widget.classList.remove('aida-widget-open');
        this.floatingBtn.style.display = 'flex';
        
        // Hide settings if open
        document.getElementById('aida-settings-panel').style.display = 'none';
        document.getElementById('aida-chat-container').style.display = 'block';
    }

    toggleSettings() {
        const settingsPanel = document.getElementById('aida-settings-panel');
        const chatContainer = document.getElementById('aida-chat-container');
        
        if (settingsPanel.style.display === 'none') {
            settingsPanel.style.display = 'block';
            chatContainer.style.display = 'none';
        } else {
            settingsPanel.style.display = 'none';
            chatContainer.style.display = 'block';
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    // Mobile keyboard handling removed to prevent positioning issues
    
    // Mobile detection removed as keyboard handling is disabled

    async sendMessage() {
        const input = document.getElementById('aida-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Check if credentials are configured
        if (!this.settings.username || !this.settings.password || !this.settings.erpUrl) {
            this.addMessage('error', 'Please configure your Mocxha settings to use AIDA. Click the settings icon to get started.');
            return;
        }

        // Add user message to chat
        this.addMessage('user', message);
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Initialize session if not already done
            if (!this.sessionId) {
                await this.initializeSession();
            }
            
            const response = await this.callAidaAPI(message);
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
            console.error('AIDA API Error:', error);
        }
    }
    
    async initializeSession() {
        if (!this.settings.username || !this.settings.password) {
            throw new Error('Please configure your credentials in settings first.');
        }
        
        // Try to restore existing session first
        const savedSessionId = localStorage.getItem(`aida_session_id_${this.userHash}`);
        if (savedSessionId) {
            try {
                const isValid = await this.checkSessionStatus(savedSessionId);
                if (isValid) {
                    this.sessionId = savedSessionId;
                    console.log('Session restored:', this.sessionId);
                    return;
                }
            } catch (error) {
                console.log('Failed to restore session, creating new one:', error);
                localStorage.removeItem(`aida_session_id_${this.userHash}`);
            }
        }
        
        // Create new session if restoration failed
        try {
            const response = await new Promise((resolve, reject) => {
                frappe.call({
                    method: 'aida_widget_integration.api.initialize_session',
                    args: {
                        erpnext_url: this.settings.erpUrl,
                        username: this.settings.username,
                        password: this.settings.password,
                        user_hash: this.userHash
                    },
                    callback: (r) => {
                        if (r.message && !r.message.error) {
                            resolve(r.message);
                        } else {
                            reject(new Error(r.message?.message || 'Session initialization failed'));
                        }
                    },
                    error: reject
                });
            });
            
            this.sessionId = response.session_id;
            // Save session ID for future restoration
            localStorage.setItem(`aida_session_id_${this.userHash}`, this.sessionId);
            console.log('New session initialized:', this.sessionId);
        } catch (error) {
            console.error('Session initialization failed:', error);
            throw error;
        }
    }

    async checkSessionStatus(sessionId) {
        try {
            const response = await new Promise((resolve, reject) => {
                frappe.call({
                    method: 'aida_widget_integration.api.check_session_status',
                    args: {
                        session_id: sessionId
                    },
                    callback: (r) => {
                        if (r.message && !r.message.error) {
                            resolve(r.message);
                        } else {
                            reject(new Error(r.message?.message || 'Session check failed'));
                        }
                    },
                    error: reject
                });
            });
            
            return response.active === true;
        } catch (error) {
            console.error('Session status check failed:', error);
            return false;
        }
    }

    async callAidaAPI(message) {
        const payload = {
            message: message,
            session_id: this.sessionId,
            user_hash: this.userHash,
            erp_credentials: JSON.stringify({
                url: this.settings.erpUrl,
                username: this.settings.username,
                password: this.settings.password
            })
        };

        // Use Frappe's API call method
        return new Promise((resolve, reject) => {
            frappe.call({
                method: 'aida_widget_integration.api.chat_with_aida',
                args: payload,
                callback: (response) => {
                    if (response.message) {
                        if (response.message.error) {
                            reject(new Error(response.message.message || 'API Error'));
                        } else {
                            // Update session ID if provided
                            if (response.message.session_id) {
                                this.sessionId = response.message.session_id;
                            }
                            resolve(response.message.response || response.message.message || 'No response received');
                        }
                    } else {
                        reject(new Error('No response received'));
                    }
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    addMessage(type, content) {
        const messagesContainer = document.getElementById('aida-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `aida-message aida-message-${type}`;
        
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="aida-message-content">
                    <div class="aida-message-text">${this.escapeHtml(content)}</div>
                    <div class="aida-message-time">${timestamp}</div>
                </div>
                <div class="aida-message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                    </svg>
                </div>
            `;
        } else if (type === 'assistant') {
            messageDiv.innerHTML = `
                <div class="aida-message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L2 22L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#4F46E5"/>
                        <circle cx="9" cy="12" r="1" fill="white"/>
                        <circle cx="12" cy="12" r="1" fill="white"/>
                        <circle cx="15" cy="12" r="1" fill="white"/>
                    </svg>
                </div>
                <div class="aida-message-content">
                    <div class="aida-message-text">${this.formatMessage(content)}</div>
                    <div class="aida-message-time">${timestamp}</div>
                </div>
            `;
        } else if (type === 'error') {
            messageDiv.innerHTML = `
                <div class="aida-message-avatar aida-error-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#EF4444"/>
                    </svg>
                </div>
                <div class="aida-message-content">
                    <div class="aida-message-text aida-error-text">${this.escapeHtml(content)}</div>
                    <div class="aida-message-time">${timestamp}</div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        
        // Enhanced auto-scroll with forced scrolling
        this.forceScrollToBottom();

        // Save to history
        this.chatHistory.push({
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        });
        this.saveChatHistory();
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('aida-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'aida-typing-indicator';
        typingDiv.className = 'aida-message aida-message-assistant';
        typingDiv.innerHTML = `
            <div class="aida-message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L2 22L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#4F46E5"/>
                    <circle cx="9" cy="12" r="1" fill="white"/>
                    <circle cx="12" cy="12" r="1" fill="white"/>
                    <circle cx="15" cy="12" r="1" fill="white"/>
                </svg>
            </div>
            <div class="aida-message-content">
                <div class="aida-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        
        // Enhanced auto-scroll with forced scrolling
        this.forceScrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('aida-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    forceScrollToBottom() {
        const messagesContainer = document.getElementById('aida-chat-messages');
        if (!messagesContainer) return;
        
        // Force container to be scrollable
        messagesContainer.style.overflowY = 'auto';
        messagesContainer.style.scrollBehavior = 'auto'; // Disable smooth for immediate effect
        
        // Multiple scroll attempts with increasing delays
        const scrollToBottom = () => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };
        
        // Immediate scroll
        scrollToBottom();
        
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
            scrollToBottom();
            
            // Additional delayed attempts
            setTimeout(scrollToBottom, 10);
            setTimeout(scrollToBottom, 50);
            setTimeout(scrollToBottom, 100);
            
            // Re-enable smooth scrolling after forced scroll
            setTimeout(() => {
                messagesContainer.style.scrollBehavior = 'smooth';
            }, 150);
        });
    }

    renderChatHistory() {
        const messagesContainer = document.getElementById('aida-chat-messages');
        messagesContainer.innerHTML = '';
        
        this.chatHistory.forEach(msg => {
            if (msg.type !== 'error') {
                this.addMessageToDOM(msg.type, msg.content, new Date(msg.timestamp));
            }
        });
        
        // Scroll to bottom after rendering history
        setTimeout(() => {
            this.forceScrollToBottom();
        }, 100);
    }

    addMessageToDOM(type, content, timestamp) {
        const messagesContainer = document.getElementById('aida-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `aida-message aida-message-${type}`;
        
        const timeString = timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="aida-message-content">
                    <div class="aida-message-text">${this.escapeHtml(content)}</div>
                    <div class="aida-message-time">${timeString}</div>
                </div>
                <div class="aida-message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                    </svg>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="aida-message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L2 22L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#4F46E5"/>
                        <circle cx="9" cy="12" r="1" fill="white"/>
                        <circle cx="12" cy="12" r="1" fill="white"/>
                        <circle cx="15" cy="12" r="1" fill="white"/>
                    </svg>
                </div>
                <div class="aida-message-content">
                    <div class="aida-message-text">${this.formatMessage(content)}</div>
                    <div class="aida-message-time">${timeString}</div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
    }

    formatMessage(content) {
        // Enhanced formatting that preserves HTML buttons while adding markdown support
        let formatted = content;
        
        // First preserve existing HTML buttons and other HTML elements
        formatted = formatted.replace(/(<button[^>]*>.*?<\/button>)/g, '$1');
        formatted = formatted.replace(/(<h[1-6][^>]*>.*?<\/h[1-6]>)/g, '$1');
        formatted = formatted.replace(/(<a[^>]*>.*?<\/a>)/g, '$1');
        formatted = formatted.replace(/(<div[^>]*>.*?<\/div>)/g, '$1');
        formatted = formatted.replace(/(<span[^>]*>.*?<\/span>)/g, '$1');
        
        // Convert markdown tables to HTML tables
        formatted = this.convertMarkdownTables(formatted);
        
        // Then apply other markdown formatting to non-HTML content
        // Split by HTML tags to avoid formatting inside them
        const htmlTagRegex = /<[^>]+>/g;
        const parts = formatted.split(htmlTagRegex);
        const tags = formatted.match(htmlTagRegex) || [];
        
        // Apply markdown formatting to text parts only
        for (let i = 0; i < parts.length; i++) {
            if (parts[i]) {
                parts[i] = parts[i]
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    // Convert markdown links to HTML (but skip if already HTML)
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                    // Convert line breaks (but not inside tables)
                    .replace(/\n(?![\s]*\|)/g, '<br>');
            }
        }
        
        // Reconstruct the string
        let result = '';
        for (let i = 0; i < parts.length; i++) {
            result += parts[i];
            if (tags[i]) {
                result += tags[i];
            }
        }
        
        return result;
    }
    
    convertMarkdownTables(content) {
        // Split content by double line breaks to handle tables separately
        const sections = content.split(/\n\s*\n/);
        
        return sections.map(section => {
            // Check if this section contains a markdown table
            const lines = section.split('\n');
            const tableLines = lines.filter(line => line.trim().includes('|'));
            
            if (tableLines.length >= 2) {
                // This looks like a table
                let tableHtml = '<table class="aida-markdown-table">';
                let isHeader = true;
                
                for (let line of lines) {
                    line = line.trim();
                    if (!line) continue;
                    
                    if (line.includes('|')) {
                        // Skip separator lines (lines with only |, -, and spaces)
                        if (/^[\s\|\-]+$/.test(line)) {
                            isHeader = false;
                            continue;
                        }
                        
                        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                        const tag = isHeader ? 'th' : 'td';
                        
                        tableHtml += '<tr>';
                        cells.forEach(cell => {
                            tableHtml += `<${tag}>${cell}</${tag}>`;
                        });
                        tableHtml += '</tr>';
                        
                        if (isHeader) isHeader = false;
                    }
                }
                
                tableHtml += '</table>';
                return tableHtml;
            }
            
            return section;
        }).join('<br><br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveSettingsHandler() {
        this.settings.username = document.getElementById('aida-username').value;
        this.settings.password = document.getElementById('aida-password').value;
        this.saveSettings();
        
        // Show success message
        frappe.show_alert({
            message: 'Settings saved successfully!',
            indicator: 'green'
        });
    }

    clearChatHistory() {
        frappe.confirm(
            'Are you sure you want to clear all chat history?',
            () => {
                this.chatHistory = [];
                this.saveChatHistory();
                document.getElementById('aida-chat-messages').innerHTML = '';
                
                frappe.show_alert({
                    message: 'Chat history cleared!',
                    indicator: 'green'
                });
            }
        );
    }
    
    disconnectSession() {
        frappe.confirm(
            'Are you sure you want to disconnect the current session? This will create a new session when you send your next message.',
            () => {
                // Clear current session ID
                this.sessionId = null;
                
                // Remove saved session from localStorage
                if (this.userHash) {
                    localStorage.removeItem(`aida_session_id_${this.userHash}`);
                }
                
                frappe.show_alert({
                    message: 'Session disconnected! A new session will be created when you send your next message.',
                    indicator: 'green'
                });
                
                console.log('Session disconnected by user');
            }
        );
    }
    
    async testConnection() {
        const statusDiv = document.getElementById('aida-connection-status');
        const testBtn = document.getElementById('aida-test-connection');
        
        // Show loading state
        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';
        statusDiv.innerHTML = '<span class="aida-status-loading">Testing connection...</span>';
        
        try {
            const response = await new Promise((resolve, reject) => {
                 frappe.call({
                     method: 'aida_widget_integration.api.test_connection',
                     args: {
                         api_server_url: this.widgetSettings.api_server_url
                     },
                    callback: (r) => {
                        if (r.message) {
                            resolve(r.message);
                        } else {
                            reject(new Error('No response received'));
                        }
                    },
                    error: reject
                });
            });
            
            if (response.success) {
                statusDiv.innerHTML = '<span class="aida-status-success">✓ Connection successful</span>';
            } else {
                statusDiv.innerHTML = `<span class="aida-status-error">✗ Connection failed: ${response.message}</span>`;
            }
        } catch (error) {
            statusDiv.innerHTML = `<span class="aida-status-error">✗ Connection failed: ${error.message}</span>`;
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'Test Connection';
        }
    }

    disconnectSession() {
        // Remove sessionId from memory and localStorage
        this.sessionId = null;
        if (this.userHash) {
            localStorage.removeItem(`aida_session_id_${this.userHash}`);
        }
        frappe.show_alert({
            message: 'Disconnected from backend. A new session will be created on next message.',
            indicator: 'orange'
        });
    }
    
    async connectSession() {
        const statusDiv = document.getElementById('aida-session-status');
        const connectBtn = document.getElementById('aida-connect-session');
        
        // Show loading state
        connectBtn.disabled = true;
        connectBtn.textContent = 'Connecting...';
        statusDiv.innerHTML = '<span class="aida-status-loading">Initializing session...</span>';
        
        try {
            // Check if we already have a session
            if (this.sessionId) {
                statusDiv.innerHTML = '<span class="aida-status-success">✓ Already connected</span>';
                return;
            }
            
            // Initialize a new session
            await this.initializeSession();
            
            statusDiv.innerHTML = `<span class="aida-status-success">✓ Connected (Session: ${this.sessionId.substring(0, 8)}...)</span>`;
            
            frappe.show_alert({
                message: 'Session connected successfully!',
                indicator: 'green'
            });
            
        } catch (error) {
            statusDiv.innerHTML = `<span class="aida-status-error">✗ Connection failed: ${error.message}</span>`;
            
            frappe.show_alert({
                message: 'Failed to connect session: ' + error.message,
                indicator: 'red'
            });
        } finally {
            connectBtn.disabled = false;
            connectBtn.textContent = 'Connect';
        }
    }
    
    disconnectSessionNew() {
        const statusDiv = document.getElementById('aida-session-status');
        const disconnectBtn = document.getElementById('aida-disconnect-session-new');
        
        // Check if there's a session to disconnect
        if (!this.sessionId) {
            statusDiv.innerHTML = '<span class="aida-status-info">No active session to disconnect</span>';
            frappe.show_alert({
                message: 'No active session found',
                indicator: 'orange'
            });
            return;
        }
        
        // Show loading state
        disconnectBtn.disabled = true;
        disconnectBtn.textContent = 'Disconnecting...';
        statusDiv.innerHTML = '<span class="aida-status-loading">Disconnecting session...</span>';
        
        try {
            // Clear current session ID
            this.sessionId = null;
            
            // Remove saved session from localStorage
            if (this.userHash) {
                localStorage.removeItem(`aida_session_id_${this.userHash}`);
            }
            
            statusDiv.innerHTML = '<span class="aida-status-info">Disconnected</span>';
            
            frappe.show_alert({
                message: 'Session disconnected successfully!',
                indicator: 'green'
            });
            
            console.log('Session disconnected by user');
            
        } catch (error) {
            statusDiv.innerHTML = `<span class="aida-status-error">✗ Disconnect failed: ${error.message}</span>`;
            
            frappe.show_alert({
                message: 'Failed to disconnect session: ' + error.message,
                indicator: 'red'
            });
        } finally {
            disconnectBtn.disabled = false;
            disconnectBtn.textContent = 'Disconnect';
        }
    }
}

// Initialize widget when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aidaChatWidget = new AidaChatWidget();
    });
} else {
    window.aidaChatWidget = new AidaChatWidget();
}