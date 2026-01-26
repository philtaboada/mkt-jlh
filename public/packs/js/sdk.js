(function() {
  'use strict';

  class MktChatSDK {
    constructor(token, options = {}) {
      this.token = token;
      this.options = options;
      this.settings = {};
      this.isOpen = false;
      this.messages = [];
      this.container = null;
      this.iframe = null;
      this.launcher = null;
      this.unreadCount = 0;
      this.configLoaded = false;
      this.conversationId = null;
      this.lastMessageId = null;
      this.eventSource = null;
      this.connectionStatus = 'checking';
      this.connectionCheckInterval = null;
    }

    async run() {
      await this.checkConnection();
      await this.loadConfig();
      this.injectStyles();
      this.createLauncher();
      this.createChatWindow();
      this.setupEventListeners();
      this.updateConnectionStatus();
      this.startConnectionMonitoring();
      await this.restoreConversation();
    }

    async restoreConversation() {
      const savedConversationId = localStorage.getItem(`mkt_conversation_${this.token}`);
      
      if (savedConversationId) {
        const valid = await this.validateAndLoadConversation(savedConversationId);
        if (valid) {
          this.conversationId = savedConversationId;
          this.connectToStream();
          return;
        } else {
          localStorage.removeItem(`mkt_conversation_${this.token}`);
        }
      }

      const visitorId = this.getVisitorId();
      const existingConversation = await this.findConversationByVisitor(visitorId);
      
      if (existingConversation) {
        this.conversationId = existingConversation;
        localStorage.setItem(`mkt_conversation_${this.token}`, this.conversationId);
        await this.loadMessages();
        this.connectToStream();
      } else if (this.settings.welcome_message) {
        this.addMessage({
          type: 'bot',
          text: this.settings.welcome_message,
          timestamp: new Date()
        });
      }
    }

    async validateAndLoadConversation(conversationId) {
      try {
        const response = await fetch(
          `${this.getBaseUrl()}/api/chat/widget/messages?token=${this.token}&conversation_id=${conversationId}`,
          { cache: 'no-cache' }
        );
        
        if (response.ok) {
          const data = await response.json();
          this.connectionStatus = 'online';
          if (data.messages !== undefined) {
            const messagesContainer = this.container ? this.container.querySelector('#mkt-messages') : null;
            if (messagesContainer) {
              messagesContainer.innerHTML = '';
              
              if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                  const isResponse = msg.sender_type === 'agent' || msg.sender_type === 'bot';
                  this.addMessage({
                    id: msg.id,
                    type: isResponse ? 'bot' : 'user',
                    text: msg.body,
                    timestamp: this.parseServerDate(msg.created_at),
                    senderType: msg.sender_type
                  }, false);
                  this.lastMessageId = msg.id;
                });
                this.scrollToBottom(false);
              }
            }
            return true;
          }
        }
        
        if (response.status === 404) {
          this.connectionStatus = 'online';
          return false;
        }
        
        this.connectionStatus = response.status >= 500 ? 'error' : 'online';
        return false;
      } catch (error) {
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        if (isNetworkError) {
          this.connectionStatus = 'offline';
          if (this.container) {
            this.updateConnectionStatus();
          }
        } else {
          this.connectionStatus = 'online';
        }
        return false;
      }
    }

    async findConversationByVisitor(visitorId) {
      try {
        const response = await fetch(
          `${this.getBaseUrl()}/api/chat/widget/conversation?token=${this.token}&visitor_id=${visitorId}`,
          { cache: 'no-cache' }
        );
        
        if (response.ok) {
          const data = await response.json();
          this.connectionStatus = 'online';
          return data.conversation_id || null;
        }
        
        if (response.status === 404) {
          this.connectionStatus = 'online';
          return null;
        }
        
        this.connectionStatus = response.status >= 500 ? 'error' : 'online';
        return null;
      } catch (error) {
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        if (isNetworkError) {
          this.connectionStatus = 'offline';
          if (this.container) {
            this.updateConnectionStatus();
          }
        } else {
          this.connectionStatus = 'online';
        }
        return null;
      }
    }

    async loadConfig() {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/chat/widget/config?token=${this.token}`, {
          cache: 'no-cache'
        });
        if (response.ok) {
          const serverConfig = await response.json();
          console.log('MktChat: Config loaded', serverConfig);
          this.settings = { ...serverConfig, ...this.options };
          this.configLoaded = true;
          this.connectionStatus = 'online';
        } else {
          console.warn('MktChat: Could not load config, using defaults');
          this.settings = this.getDefaultSettings();
          this.connectionStatus = response.status >= 500 ? 'error' : 'online';
        }
      } catch (error) {
        console.warn('MktChat: Could not load config', error);
        this.settings = this.getDefaultSettings();
        this.connectionStatus = 'offline';
      }
    }

    getDefaultSettings() {
      return {
        welcome_title: 'Chatea con nosotros',
        welcome_message: '¡Hola! 👋 ¿En qué podemos ayudarte?',
        widget_color: '#3B82F6',
        position: 'right',
        reply_time: 'few_minutes',
        online_status: 'auto',
        pre_chat_form_enabled: true,
        locale: 'es',
        ...this.options
      };
    }

    getReplyTimeText() {
      const times = {
        'few_minutes': 'Responde en minutos',
        'few_hours': 'Responde en horas',
        'one_day': 'Responde en un día'
      };
      return times[this.settings.reply_time] || times['few_minutes'];
    }

    getOnlineStatusText() {
      if (this.settings.online_status === 'offline') {
        return 'Fuera de línea';
      }
      return 'En línea';
    }

    isOnline() {
      return this.settings.online_status !== 'offline';
    }

    getBaseUrl() {
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.includes('sdk.js')) {
          return scripts[i].src.replace('/packs/js/sdk.js', '');
        }
      }
      return window.location.origin;
    }

    async checkConnection() {
      try {
        this.connectionStatus = 'checking';
        const baseUrl = this.getBaseUrl();
        const testUrl = `${baseUrl}/api/chat/widget/config?token=${this.token}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(testUrl, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        
        if (response.status >= 200 && response.status < 600) {
          this.connectionStatus = response.status >= 500 ? 'error' : 'online';
          return this.connectionStatus === 'online';
        } else {
          this.connectionStatus = 'error';
          return false;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('MktChat: Connection check timeout');
          this.connectionStatus = 'offline';
        } else {
          console.warn('MktChat: Connection check failed', error);
          this.connectionStatus = 'offline';
        }
        return false;
      }
    }

    startConnectionMonitoring() {
      this.connectionCheckInterval = setInterval(async () => {
        const wasOnline = this.connectionStatus === 'online';
        await this.checkConnection();
        const isOnline = this.connectionStatus === 'online';
        
        if (wasOnline !== isOnline && this.container) {
          this.updateConnectionStatus();
        }
      }, 30000);
    }

    stopConnectionMonitoring() {
      if (this.connectionCheckInterval) {
        clearInterval(this.connectionCheckInterval);
        this.connectionCheckInterval = null;
      }
    }

    updateConnectionStatus() {
      if (!this.container) return;
      
      const statusElement = this.container.querySelector('.mkt-chat-header-status');
      if (!statusElement) return;
      
      const statusText = this.getOnlineStatusText();
      const replyTimeText = this.getReplyTimeText();
      const connectionIndicator = this.getConnectionIndicator();
      
      statusElement.innerHTML = `
        <span class="mkt-connection-indicator ${this.connectionStatus}" title="${connectionIndicator}"></span>
        ${connectionIndicator} · ${statusText} · ${replyTimeText}
      `;
    }

    getConnectionIndicator() {
      switch (this.connectionStatus) {
        case 'online':
          return 'Conectado';
        case 'offline':
          return 'Sin conexión';
        case 'error':
          return 'Error de conexión';
        case 'checking':
        default:
          return 'Verificando...';
      }
    }

    injectStyles() {
      const position = this.settings.position || 'right';
      const primaryColor = this.settings.widget_color || '#3B82F6';
      
      const styles = `
        :root {
          --mkt-primary: ${primaryColor};
          --mkt-primary-hover: ${this.darkenColor(primaryColor, 10)};
          --mkt-primary-light: ${this.lightenColor(primaryColor, 45)};
          --mkt-primary-glow: ${primaryColor}40;
          --mkt-bg: #ffffff;
          --mkt-bg-secondary: #f8fafc;
          --mkt-bg-tertiary: #f1f5f9;
          --mkt-text: #0f172a;
          --mkt-text-secondary: #64748b;
          --mkt-text-muted: #94a3b8;
          --mkt-border: #e2e8f0;
          --mkt-border-light: #f1f5f9;
          --mkt-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          --mkt-shadow-sm: 0 4px 6px -1px rgba(0,0,0,0.1);
          --mkt-shadow-glow: 0 0 40px var(--mkt-primary-glow);
          --mkt-radius: 20px;
          --mkt-radius-sm: 12px;
        }

        /* Launcher Button */
        .mkt-chat-launcher {
          position: fixed;
          ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
          bottom: 24px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--mkt-primary) 0%, var(--mkt-primary-hover) 100%);
          border: none;
          cursor: pointer;
          box-shadow: var(--mkt-shadow), var(--mkt-shadow-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2147483646;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mkt-chat-launcher:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: var(--mkt-shadow), 0 0 60px var(--mkt-primary-glow);
        }

        .mkt-chat-launcher:active {
          transform: scale(0.95);
        }

        .mkt-chat-launcher svg {
          width: 28px;
          height: 28px;
          stroke: white;
          fill: none;
          transition: transform 0.3s ease;
        }

        .mkt-chat-launcher:hover svg {
          transform: rotate(-8deg);
        }

        .mkt-chat-launcher-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-size: 11px;
          font-weight: 700;
          min-width: 22px;
          height: 22px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          animation: mkt-badge-pulse 2s infinite;
        }

        @keyframes mkt-badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Chat Container */
        .mkt-chat-container {
          position: fixed;
          ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
          bottom: 100px;
          width: 400px;
          height: 640px;
          max-height: calc(100vh - 130px);
          background: var(--mkt-bg);
          border-radius: var(--mkt-radius);
          box-shadow: var(--mkt-shadow);
          z-index: 2147483647;
          display: none;
          flex-direction: column;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          border: 1px solid var(--mkt-border-light);
        }

        .mkt-chat-container.open {
          display: flex;
          animation: mkt-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes mkt-slide-up {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header */
        .mkt-chat-header {
          background: linear-gradient(135deg, var(--mkt-primary) 0%, var(--mkt-primary-hover) 100%);
          color: white;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .mkt-chat-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .mkt-chat-header::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .mkt-chat-header-info {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .mkt-chat-header-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .mkt-chat-header-avatar svg {
          width: 26px;
          height: 26px;
          stroke: white;
          fill: none;
        }

        .mkt-chat-header-title {
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.3px;
        }

        .mkt-chat-header-status {
          font-size: 13px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .mkt-chat-header-status::before {
          content: '';
          width: 8px;
          height: 8px;
          background: ${this.isOnline() ? '#4ade80' : '#9ca3af'};
          border-radius: 50%;
          box-shadow: ${this.isOnline() ? '0 0 8px #4ade80' : 'none'};
          animation: ${this.isOnline() ? 'mkt-pulse-online 2s infinite' : 'none'};
        }

        .mkt-connection-indicator {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 4px;
          vertical-align: middle;
        }

        .mkt-connection-indicator.online {
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
          animation: mkt-pulse-online 2s infinite;
        }

        .mkt-connection-indicator.offline {
          background: #ef4444;
          box-shadow: 0 0 6px #ef4444;
        }

        .mkt-connection-indicator.error {
          background: #f59e0b;
          box-shadow: 0 0 6px #f59e0b;
          animation: mkt-pulse-error 2s infinite;
        }

        .mkt-connection-indicator.checking {
          background: #94a3b8;
          animation: mkt-pulse-checking 1.5s infinite;
        }

        @keyframes mkt-pulse-error {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes mkt-pulse-checking {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes mkt-pulse-online {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .mkt-chat-close {
          background: rgba(255,255,255,0.1);
          border: none;
          cursor: pointer;
          padding: 10px;
          border-radius: var(--mkt-radius-sm);
          transition: all 0.2s ease;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(10px);
        }

        .mkt-chat-close:hover {
          background: rgba(255,255,255,0.2);
          transform: rotate(90deg);
        }

        .mkt-chat-close svg {
          width: 18px;
          height: 18px;
          stroke: white;
          fill: none;
          display: block;
        }

        /* Messages Area */
        .mkt-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: linear-gradient(180deg, var(--mkt-bg-secondary) 0%, var(--mkt-bg) 100%);
          scroll-behavior: smooth;
          position: relative;
        }

        /* Subtle pattern overlay for messages area */
        .mkt-chat-messages::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0);
          background-size: 20px 20px;
          pointer-events: none;
          opacity: 0.5;
        }

        .mkt-chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .mkt-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .mkt-chat-messages::-webkit-scrollbar-thumb {
          background: var(--mkt-border);
          border-radius: 3px;
        }

        .mkt-chat-messages::-webkit-scrollbar-thumb:hover {
          background: var(--mkt-text-muted);
        }

        /* Message Bubbles */
        .mkt-chat-message {
          max-width: 70%;
          padding: 14px 18px;
          font-size: 14px;
          line-height: 1.6;
          word-wrap: break-word;
          animation: mkt-message-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .mkt-chat-message-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Markdown Styles */
        .mkt-chat-message-content.mkt-markdown {
          line-height: 1.7;
        }

        .mkt-chat-message-content.mkt-markdown h1,
        .mkt-chat-message-content.mkt-markdown h2,
        .mkt-chat-message-content.mkt-markdown h3 {
          margin: 12px 0 8px 0;
          font-weight: 700;
          line-height: 1.3;
        }

        .mkt-chat-message-content.mkt-markdown h1 {
          font-size: 18px;
          border-bottom: 2px solid rgba(255,255,255,0.2);
          padding-bottom: 6px;
        }

        .mkt-chat-message-content.mkt-markdown h2 {
          font-size: 16px;
        }

        .mkt-chat-message-content.mkt-markdown h3 {
          font-size: 15px;
        }

        .mkt-chat-message-content.mkt-markdown p {
          margin: 4px 0;
          line-height: 1.6;
        }

        .mkt-chat-message-content.mkt-markdown p:first-child {
          margin-top: 0;
        }

        .mkt-chat-message-content.mkt-markdown p:last-child {
          margin-bottom: 0;
        }

        .mkt-chat-message-content.mkt-markdown br {
          line-height: 1.6;
        }

        /* Reducir espacio entre elementos */
        .mkt-chat-message-content.mkt-markdown p + p {
          margin-top: 6px;
        }

        .mkt-chat-message-content.mkt-markdown p + h1,
        .mkt-chat-message-content.mkt-markdown p + h2,
        .mkt-chat-message-content.mkt-markdown p + h3 {
          margin-top: 12px;
        }

        .mkt-chat-message-content.mkt-markdown ul,
        .mkt-chat-message-content.mkt-markdown ol {
          margin: 10px 0;
          padding-left: 24px;
        }

        .mkt-chat-message-content.mkt-markdown li {
          margin: 6px 0;
          line-height: 1.6;
        }

        .mkt-chat-message-content.mkt-markdown code {
          background: rgba(0,0,0,0.15);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          font-weight: 500;
        }

        .mkt-chat-message-content.mkt-markdown pre {
          background: rgba(0,0,0,0.2);
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 10px 0;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .mkt-chat-message-content.mkt-markdown pre code {
          background: transparent;
          padding: 0;
          font-size: 12px;
          display: block;
          white-space: pre-wrap;
        }

        .mkt-chat-message-content.mkt-markdown a {
          color: inherit;
          text-decoration: underline;
          text-decoration-color: rgba(255,255,255,0.5);
          transition: text-decoration-color 0.2s;
        }

        .mkt-chat-message-content.mkt-markdown a:hover {
          text-decoration-color: rgba(255,255,255,0.9);
        }

        .mkt-chat-message-content.mkt-markdown blockquote {
          border-left: 3px solid rgba(255,255,255,0.3);
          padding-left: 14px;
          margin: 10px 0;
          font-style: italic;
          opacity: 0.9;
        }

        .mkt-chat-message-content.mkt-markdown strong {
          font-weight: 700;
        }

        .mkt-chat-message-content.mkt-markdown em {
          font-style: italic;
        }

        /* Markdown styles for bot messages (light background) */
        .mkt-chat-message.bot .mkt-chat-message-content.mkt-markdown code {
          background: rgba(0,0,0,0.08);
          color: var(--mkt-text);
        }

        .mkt-chat-message.bot .mkt-chat-message-content.mkt-markdown pre {
          background: var(--mkt-bg-secondary);
          border-color: var(--mkt-border);
        }

        .mkt-chat-message.bot .mkt-chat-message-content.mkt-markdown a {
          color: var(--mkt-primary);
          text-decoration-color: var(--mkt-primary);
        }

        .mkt-chat-message.bot .mkt-chat-message-content.mkt-markdown a:hover {
          color: var(--mkt-primary-hover);
        }

        .mkt-chat-message.bot .mkt-chat-message-content.mkt-markdown h1 {
          border-bottom-color: var(--mkt-border);
        }

        .mkt-chat-message.bot .mkt-chat-message-content.mkt-markdown blockquote {
          border-left-color: var(--mkt-primary);
          color: var(--mkt-text-secondary);
        }

        @keyframes mkt-message-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .mkt-chat-message.user {
          background: linear-gradient(135deg, var(--mkt-primary) 0%, var(--mkt-primary-hover) 100%);
          color: white;
          align-self: flex-end;
          border-radius: 20px 20px 6px 20px;
          box-shadow: 0 4px 12px var(--mkt-primary-glow), 0 2px 4px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
        }

        .mkt-chat-message.bot {
          background: var(--mkt-bg);
          color: var(--mkt-text);
          align-self: flex-start;
          border-radius: 20px 20px 20px 6px;
          box-shadow: var(--mkt-shadow-sm);
          border: 1px solid var(--mkt-border-light);
          backdrop-filter: blur(10px);
        }

        .mkt-chat-message.user:hover {
          box-shadow: 0 6px 16px var(--mkt-primary-glow), 0 2px 6px rgba(0,0,0,0.15);
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        .mkt-chat-message.bot:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: var(--mkt-border);
          transition: all 0.2s ease;
        }

        .mkt-chat-message-time {
          font-size: 11px;
          opacity: 0.65;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .mkt-chat-message.user .mkt-chat-message-time {
          justify-content: flex-end;
        }

        /* Typing Indicator */
        .mkt-chat-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 16px 20px;
          background: var(--mkt-bg);
          border-radius: 20px 20px 20px 6px;
          align-self: flex-start;
          box-shadow: var(--mkt-shadow-sm);
          border: 1px solid var(--mkt-border-light);
        }

        .mkt-chat-typing span {
          width: 8px;
          height: 8px;
          background: var(--mkt-primary);
          border-radius: 50%;
          animation: mkt-typing 1.4s infinite ease-in-out;
        }

        .mkt-chat-typing span:nth-child(1) { animation-delay: 0s; }
        .mkt-chat-typing span:nth-child(2) { animation-delay: 0.15s; }
        .mkt-chat-typing span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes mkt-typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* Input Area */
        .mkt-chat-input-container {
          padding: 16px 20px 20px;
          background: var(--mkt-bg);
          border-top: 1px solid var(--mkt-border-light);
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .mkt-chat-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          background: var(--mkt-bg-secondary);
          border: 2px solid var(--mkt-border);
          border-radius: 28px;
          padding: 4px 6px 4px 18px;
          transition: all 0.2s ease;
        }

        .mkt-chat-input-wrapper:focus-within {
          border-color: var(--mkt-primary);
          background: var(--mkt-bg);
          box-shadow: 0 0 0 4px var(--mkt-primary-light);
        }

        .mkt-chat-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 12px 0;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          color: var(--mkt-text);
        }

        .mkt-chat-input::placeholder {
          color: var(--mkt-text-muted);
        }

        .mkt-chat-send {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--mkt-primary) 0%, var(--mkt-primary-hover) 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .mkt-chat-send:hover:not(:disabled) {
          transform: scale(1.08);
          box-shadow: 0 4px 16px var(--mkt-primary-glow);
        }

        .mkt-chat-send:active:not(:disabled) {
          transform: scale(0.95);
        }

        .mkt-chat-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: var(--mkt-border);
        }

        .mkt-chat-send svg {
          width: 18px;
          height: 18px;
          stroke: white;
          fill: none;
          transition: transform 0.2s ease;
        }

        .mkt-chat-send:hover:not(:disabled) svg {
          transform: translateX(2px);
        }

        /* Emoji Button */
        .mkt-chat-emoji {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .mkt-chat-emoji:hover {
          background: var(--mkt-bg-tertiary);
        }

        .mkt-chat-emoji svg {
          width: 20px;
          height: 20px;
          stroke: var(--mkt-text-muted);
          fill: none;
        }

        /* Pre-chat Form */
        .mkt-chat-prechat {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: linear-gradient(180deg, var(--mkt-bg-secondary) 0%, var(--mkt-bg) 100%);
        }

        .mkt-chat-prechat h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--mkt-text);
          margin: 0;
          letter-spacing: -0.4px;
        }

        .mkt-chat-prechat p {
          font-size: 14px;
          color: var(--mkt-text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .mkt-chat-prechat-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mkt-chat-prechat-field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--mkt-text);
          letter-spacing: -0.2px;
        }

        .mkt-chat-prechat-field input {
          border: 2px solid var(--mkt-border);
          border-radius: var(--mkt-radius-sm);
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          background: var(--mkt-bg);
        }

        .mkt-chat-prechat-field input:focus {
          border-color: var(--mkt-primary);
          box-shadow: 0 0 0 4px var(--mkt-primary-light);
        }

        .mkt-chat-prechat-submit {
          background: linear-gradient(135deg, var(--mkt-primary) 0%, var(--mkt-primary-hover) 100%);
          color: white;
          border: none;
          border-radius: var(--mkt-radius-sm);
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          letter-spacing: -0.2px;
        }

        .mkt-chat-prechat-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px var(--mkt-primary-glow);
        }

        .mkt-chat-prechat-submit:active {
          transform: translateY(0);
        }

        /* Powered By */
        .mkt-chat-powered {
          text-align: center;
          padding: 12px 16px;
          font-size: 11px;
          color: var(--mkt-text-muted);
          background: var(--mkt-bg-secondary);
          border-top: 1px solid var(--mkt-border-light);
        }

        .mkt-chat-powered a {
          color: var(--mkt-primary);
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        .mkt-chat-powered a:hover {
          opacity: 0.8;
        }

        /* Welcome Message Styling */
        .mkt-chat-welcome {
          text-align: center;
          padding: 40px 24px;
        }

        .mkt-chat-welcome-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: var(--mkt-primary-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mkt-chat-welcome-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--mkt-primary);
        }

        .mkt-chat-welcome h4 {
          font-size: 18px;
          font-weight: 700;
          color: var(--mkt-text);
          margin: 0 0 8px;
        }

        .mkt-chat-welcome p {
          font-size: 14px;
          color: var(--mkt-text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .mkt-chat-container {
            width: calc(100vw - 16px);
            height: calc(100vh - 90px);
            ${position === 'left' ? 'left: 8px;' : 'right: 8px;'}
            bottom: 80px;
            border-radius: 16px;
          }

          .mkt-chat-launcher {
            ${position === 'left' ? 'left: 16px;' : 'right: 16px;'}
            bottom: 16px;
            width: 56px;
            height: 56px;
          }

          .mkt-chat-header {
            padding: 16px 20px;
          }

          .mkt-chat-messages {
            padding: 16px;
          }

          .mkt-chat-input-container {
            padding: 12px 16px 16px;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .mkt-chat-container {
            --mkt-bg: #1e293b;
            --mkt-bg-secondary: #0f172a;
            --mkt-bg-tertiary: #334155;
            --mkt-text: #f1f5f9;
            --mkt-text-secondary: #94a3b8;
            --mkt-text-muted: #64748b;
            --mkt-border: #334155;
            --mkt-border-light: #1e293b;
          }

          .mkt-chat-message.bot {
            background: var(--mkt-bg-tertiary);
            border-color: var(--mkt-border);
          }
        }
      `;

      const styleEl = document.createElement('style');
      styleEl.id = 'mkt-chat-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }

    darkenColor(hex, percent) {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max((num >> 16) - amt, 0);
      const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
      const B = Math.max((num & 0x0000FF) - amt, 0);
      return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    lightenColor(hex, percent) {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min((num >> 16) + amt, 255);
      const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
      const B = Math.min((num & 0x0000FF) + amt, 255);
      return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    createLauncher() {
      this.launcher = document.createElement('button');
      this.launcher.className = 'mkt-chat-launcher';
      this.launcher.setAttribute('aria-label', this.settings.welcome_title || 'Abrir chat');
      this.launcher.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      `;

      if (!this.settings.hideMessageBubble) {
        document.body.appendChild(this.launcher);
      }
    }

    createChatWindow() {
      const statusText = this.getOnlineStatusText();
      const replyTimeText = this.getReplyTimeText();
      
      this.container = document.createElement('div');
      this.container.className = 'mkt-chat-container';
      this.container.innerHTML = `
        <div class="mkt-chat-header">
          <div class="mkt-chat-header-info">
            <div class="mkt-chat-header-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            </div>
            <div>
              <div class="mkt-chat-header-title">${this.escapeHtml(this.settings.welcome_title || 'Chatea con nosotros')}</div>
              <div class="mkt-chat-header-status">${statusText} · ${replyTimeText}</div>
            </div>
          </div>
          <button class="mkt-chat-close" aria-label="Cerrar chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="mkt-chat-messages" id="mkt-messages"></div>
        <div class="mkt-chat-input-container">
          <div class="mkt-chat-input-wrapper">
            <input type="text" class="mkt-chat-input" placeholder="Escribe tu mensaje..." aria-label="Mensaje">
            <button class="mkt-chat-emoji" aria-label="Emojis" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
          </div>
          <button class="mkt-chat-send" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div class="mkt-chat-powered">
          Powered by <a href="#" target="_blank">JLH Chat</a>
        </div>
      `;

      document.body.appendChild(this.container);
    }

    setupEventListeners() {
      this.launcher.addEventListener('click', () => this.toggle());

      const closeBtn = this.container.querySelector('.mkt-chat-close');
      closeBtn.addEventListener('click', () => this.close());

      const input = this.container.querySelector('.mkt-chat-input');
      const sendBtn = this.container.querySelector('.mkt-chat-send');
      const emojiBtn = this.container.querySelector('.mkt-chat-emoji');

      sendBtn.addEventListener('click', () => this.sendMessage(input.value));
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage(input.value);
        }
      });

      if (emojiBtn) {
        emojiBtn.addEventListener('click', () => {
          const emojis = ['😊', '👍', '❤️', '🙏', '👋', '🎉', '✨', '🔥'];
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          input.value += randomEmoji;
          input.focus();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.container.classList.add('open');
      this.launcher.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      this.unreadCount = 0;
      this.updateBadge();
      
      setTimeout(() => {
        this.scrollToBottom();
        const input = this.container.querySelector('.mkt-chat-input');
        input.focus();
      }, 100);
    }

    close() {
      this.isOpen = false;
      this.container.classList.remove('open');
      this.launcher.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      `;
    }

    async sendMessage(text) {
      text = text.trim();
      if (!text) return;

      const input = this.container.querySelector('.mkt-chat-input');
      input.value = '';

      this.addMessage({
        type: 'user',
        text: text,
        timestamp: new Date()
      });

      this.showTyping();

      if (this.connectionStatus === 'offline' || this.connectionStatus === 'error') {
        const wasOffline = this.connectionStatus === 'offline';
        const connectionOk = await this.checkConnection();
        
        if (!connectionOk) {
          this.hideTyping();
          this.addMessage({
            type: 'bot',
            text: 'No hay conexión con el servidor. Por favor verifica tu conexión a internet e intenta de nuevo.',
            timestamp: new Date()
          });
          if (this.container) {
            this.updateConnectionStatus();
          }
          return;
        }
      }

      try {
        const response = await fetch(`${this.getBaseUrl()}/api/chat/widget/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.token,
            message: text,
            visitor_id: this.getVisitorId(),
            conversation_id: this.conversationId
          }),
          cache: 'no-cache'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        this.hideTyping();
        this.connectionStatus = 'online';
        if (this.container) {
          this.updateConnectionStatus();
        }
        
        if (data.conversation_id && !this.conversationId) {
          this.conversationId = data.conversation_id;
          localStorage.setItem(`mkt_conversation_${this.token}`, this.conversationId);
          this.connectToStream();
        }
      } catch (error) {
        console.error('MktChat: Error sending message', error);
        this.hideTyping();
        this.connectionStatus = error.name === 'TypeError' && error.message.includes('fetch') ? 'offline' : 'error';
        if (this.container) {
          this.updateConnectionStatus();
        }
        
        let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';
        if (this.connectionStatus === 'offline') {
          errorMessage = 'No hay conexión con el servidor. Por favor verifica tu conexión a internet e intenta de nuevo.';
        } else if (this.connectionStatus === 'error') {
          errorMessage = 'Error de conexión con el servidor. Por favor intenta de nuevo en unos momentos.';
        }
        
        this.addMessage({
          type: 'bot',
          text: errorMessage,
          timestamp: new Date()
        });
      }
    }

    async loadMessages() {
      if (!this.conversationId) return;

      try {
        const response = await fetch(
          `${this.getBaseUrl()}/api/chat/widget/messages?token=${this.token}&conversation_id=${this.conversationId}`,
          { cache: 'no-cache' }
        );
        
        if (response.ok) {
          const data = await response.json();
          this.connectionStatus = 'online';
          const messagesContainer = this.container.querySelector('#mkt-messages');
          messagesContainer.innerHTML = '';
          
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
              const isResponse = msg.sender_type === 'agent' || msg.sender_type === 'bot';
              this.addMessage({
                id: msg.id,
                type: isResponse ? 'bot' : 'user',
                text: msg.body,
                timestamp: this.parseServerDate(msg.created_at),
                senderType: msg.sender_type
              }, false);
              this.lastMessageId = msg.id;
            });
            this.scrollToBottom(false);
          } else if (this.settings.welcome_message) {
            this.addMessage({
              type: 'bot',
              text: this.settings.welcome_message,
              timestamp: new Date()
            });
          }
          if (this.container) {
            this.updateConnectionStatus();
          }
        } else {
          this.connectionStatus = response.status >= 500 ? 'error' : 'online';
          if (this.container) {
            this.updateConnectionStatus();
          }
        }
      } catch (error) {
        console.error('MktChat: Error loading messages', error);
        this.connectionStatus = 'offline';
        if (this.container) {
          this.updateConnectionStatus();
        }
      }
    }

    connectToStream() {
      if (!this.conversationId) return;
      
      this.disconnectFromStream();
      
      const url = `${this.getBaseUrl()}/api/chat/widget/stream?token=${this.token}&conversation_id=${this.conversationId}`;
      
      this.eventSource = new EventSource(url);
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message') {
            console.log('MktChat: Received message via SSE:', data);
            const existingMsg = this.container.querySelector(`[data-message-id="${data.message.id}"]`);
            if (!existingMsg) {
              console.log('MktChat: Adding new message to UI');
              this.addMessage({
                id: data.message.id,
                type: 'bot',
                text: data.message.body,
                timestamp: this.parseServerDate(data.message.created_at),
                senderType: data.message.sender_type
              });
            } else {
              console.log('MktChat: Message already exists, skipping');
            }
          } else if (data.type === 'connected') {
            console.log('MktChat: Connected to realtime stream');
          } else if (data.type === 'ping') {
            // Heartbeat, ignore
          } else {
            console.log('MktChat: Unknown SSE event type:', data.type);
          }
        } catch (error) {
          console.error('MktChat: Error parsing SSE message', error, 'Raw data:', event.data);
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('MktChat: SSE connection error', error);
        setTimeout(() => {
          if (this.conversationId) {
            this.connectToStream();
          }
        }, 5000);
      };
    }
    
    disconnectFromStream() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    }

    addMessage(message, updateBadge = true) {
      const messagesContainer = this.container.querySelector('#mkt-messages');
      
      const messageEl = document.createElement('div');
      messageEl.className = `mkt-chat-message ${message.type}`;
      if (message.id) {
        messageEl.dataset.messageId = message.id;
      }
      
      const isMarkdownContent = message.type === 'bot' && this.isMarkdown(message.text);
      const messageContent = isMarkdownContent 
        ? this.renderMarkdown(message.text)
        : this.escapeHtml(message.text);
      
      messageEl.innerHTML = `
        <div class="mkt-chat-message-content ${isMarkdownContent ? 'mkt-markdown' : ''}">
          ${messageContent}
        </div>
        <div class="mkt-chat-message-time">${this.formatTime(message.timestamp)}</div>
      `;
      
      messagesContainer.appendChild(messageEl);
      
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });

      if (updateBadge && !this.isOpen && message.type === 'bot') {
        this.unreadCount++;
        this.updateBadge();
      }
    }

    showTyping() {
      const messagesContainer = this.container.querySelector('#mkt-messages');
      const typingEl = document.createElement('div');
      typingEl.className = 'mkt-chat-typing';
      typingEl.id = 'mkt-typing';
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      messagesContainer.appendChild(typingEl);
      this.scrollToBottom();
    }

    hideTyping() {
      const typingEl = this.container.querySelector('#mkt-typing');
      if (typingEl) {
        typingEl.remove();
      }
    }

    scrollToBottom(smooth = true) {
      const messagesContainer = this.container.querySelector('#mkt-messages');
      if (messagesContainer) {
        if (smooth) {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    }

    updateBadge() {
      let badge = this.launcher.querySelector('.mkt-chat-launcher-badge');
      
      if (this.unreadCount > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'mkt-chat-launcher-badge';
          this.launcher.appendChild(badge);
        }
        badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
      } else if (badge) {
        badge.remove();
      }
    }

    getVisitorId() {
      let visitorId = localStorage.getItem('mkt_visitor_id');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('mkt_visitor_id', visitorId);
      }
      return visitorId;
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    isMarkdown(text) {
      if (!text || typeof text !== 'string') return false;
      
      const markdownPatterns = [
        /#{1,6}\s+.+/,
        /\*\*.*?\*\*/,
        /\*.*?\*/,
        /_.*?_/,
        /`.*?`/,
        /```[\s\S]*?```/,
        /\[.*?\]\(.*?\)/,
        /^\s*[-*+]\s+/,
        /^\s*\d+\.\s+/,
        />\s+/,
        /\n\n/,
      ];
      
      return markdownPatterns.some(pattern => pattern.test(text));
    }

    renderMarkdown(text) {
      if (!text) return '';
      
      let html = text;
      
      const codeBlockPlaceholders = [];
      html = html.replace(/```[\s\S]*?```/g, (match) => {
        const idx = codeBlockPlaceholders.length;
        codeBlockPlaceholders.push(match);
        return `__CODEBLOCK${idx}__`;
      });
      
      const inlineCodePlaceholders = [];
      html = html.replace(/`[^`\n]+`/g, (match) => {
        const idx = inlineCodePlaceholders.length;
        inlineCodePlaceholders.push(match);
        return `__INLINECODE${idx}__`;
      });
      
      const processInlineMarkdown = (text) => {
        let result = text;
        result = result.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
        result = result.replace(/(?<!\*)\*([^*\s][^*]*?[^*\s])\*(?!\*)/g, '<em>$1</em>');
        result = result.replace(/(?<!_)_([^_\s][^_]*?[^_\s])_(?!_)/g, '<em>$1</em>');
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        return result;
      };
      
      const lines = html.split('\n');
      const processed = [];
      let inUl = false, inOl = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        if (trimmed.match(/^###\s+/)) {
          if (inUl) { processed.push('</ul>'); inUl = false; }
          if (inOl) { processed.push('</ol>'); inOl = false; }
          const content = trimmed.replace(/^###\s+/, '');
          processed.push(`<h3>${processInlineMarkdown(content)}</h3>`);
          continue;
        }
        if (trimmed.match(/^##\s+/)) {
          if (inUl) { processed.push('</ul>'); inUl = false; }
          if (inOl) { processed.push('</ol>'); inOl = false; }
          const content = trimmed.replace(/^##\s+/, '');
          processed.push(`<h2>${processInlineMarkdown(content)}</h2>`);
          continue;
        }
        if (trimmed.match(/^#\s+/)) {
          if (inUl) { processed.push('</ul>'); inUl = false; }
          if (inOl) { processed.push('</ol>'); inOl = false; }
          const content = trimmed.replace(/^#\s+/, '');
          processed.push(`<h1>${processInlineMarkdown(content)}</h1>`);
          continue;
        }
        
        if (trimmed.match(/^>\s+/)) {
          if (inUl) { processed.push('</ul>'); inUl = false; }
          if (inOl) { processed.push('</ol>'); inOl = false; }
          const content = trimmed.replace(/^>\s+/, '');
          processed.push(`<blockquote>${processInlineMarkdown(content)}</blockquote>`);
          continue;
        }
        
        const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
        if (ulMatch) {
          if (!inUl) {
            if (inOl) { processed.push('</ol>'); inOl = false; }
            processed.push('<ul>');
            inUl = true;
          }
          const itemContent = processInlineMarkdown(ulMatch[1]);
          processed.push(`<li>${itemContent}</li>`);
          continue;
        }
        
        const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
        if (olMatch) {
          if (!inOl) {
            if (inUl) { processed.push('</ul>'); inUl = false; }
            processed.push('<ol>');
            inOl = true;
          }
          const itemContent = processInlineMarkdown(olMatch[2]);
          processed.push(`<li>${itemContent}</li>`);
          continue;
        }
        
        if (inUl) { processed.push('</ul>'); inUl = false; }
        if (inOl) { processed.push('</ol>'); inOl = false; }
        
        if (trimmed === '') {
          processed.push('');
        } else {
          processed.push(processInlineMarkdown(line));
        }
      }
      
      if (inUl) processed.push('</ul>');
      if (inOl) processed.push('</ol>');
      
      html = processed.join('\n');
      
      inlineCodePlaceholders.forEach((code, idx) => {
        const content = code.replace(/`/g, '');
        html = html.replace(`__INLINECODE${idx}__`, `<code>${this.escapeHtml(content)}</code>`);
      });
      
      codeBlockPlaceholders.forEach((block, idx) => {
        const content = block.replace(/```/g, '').trim();
        html = html.replace(`__CODEBLOCK${idx}__`, `<pre><code>${this.escapeHtml(content)}</code></pre>`);
      });
      
      html = html.replace(/(<[^>]+>)([^<]*)(<\/[^>]+>)/g, (match, openTag, content, closeTag) => {
        if (content.includes('<')) return match;
        return openTag + this.escapeHtml(content) + closeTag;
      });
      
      html = html.split(/(<[^>]+>)/g).map((part, idx) => {
        if (part.startsWith('<') && part.endsWith('>')) {
          return part;
        }
        return part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }).join('');
      
      html = html.replace(/\n{3,}/g, '\n\n');
      
      const paragraphs = html.split(/\n\n+/);
      html = paragraphs.map(p => {
        p = p.trim();
        if (!p) return '';
        
        if (p.match(/^<(h[1-6]|ul|ol|pre|blockquote|p)/)) {
          return p;
        }
        
        p = p.replace(/\n/g, '<br>');
        
        return p ? `<p>${p}</p>` : '';
      }).filter(p => p).join('');
      
      return html;
    }

    formatTime(date) {
      if (!(date instanceof Date) || isNaN(date)) {
        return '--:--';
      }
      
      return date.toLocaleTimeString(this.settings.locale || 'es', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    parseServerDate(dateString) {
      if (!dateString) return new Date();
      
      let isoString = dateString;
      if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.match(/[-+]\d{2}:\d{2}$/)) {
        isoString = dateString + 'Z';
      }
      
      return new Date(isoString);
    }
  }

  window.MktChatSDK = MktChatSDK;
})();
