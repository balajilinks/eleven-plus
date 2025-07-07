import React, { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
import './Chat.css';

function Chat({ context = null, onClose = null }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Add welcome message
        if (messages.length === 0) {
            const welcomeMessage = {
                id: Date.now(),
                type: 'ai',
                content: getWelcomeMessage(),
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
        }
    }, [context]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getWelcomeMessage = () => {
        if (context) {
            return `Hi! I'm your AI tutor assistant. I can help you with ${context.concept || 'this topic'} in ${context.subject || 'your studies'}. 

What would you like to know? I can:
• Explain concepts in simple terms
• Help with practice questions
• Provide study tips
• Answer any questions you have

Just ask me anything!`;
        }
        return `Hi! I'm your AI tutor assistant for 11+ preparation. I can help you with mathematics and English concepts. What would you like to learn about today?`;
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await aiService.sendMessage(inputMessage, context);

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.success ? response.message : `I'm sorry, I encountered an error: ${response.error}`,
                timestamp: new Date(),
                error: !response.success
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "I'm sorry, I'm having trouble connecting right now. Please check your AI settings and try again.",
                timestamp: new Date(),
                error: true
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([{
            id: Date.now(),
            type: 'ai',
            content: getWelcomeMessage(),
            timestamp: new Date()
        }]);
    };

    const quickActions = [
        { label: 'Explain this concept', action: () => setInputMessage('Please explain this concept in simple terms') },
        { label: 'Give me practice questions', action: () => setInputMessage('Can you give me some practice questions?') },
        { label: 'Study tips', action: () => setInputMessage('What are some good study tips for this topic?') },
        { label: 'Common mistakes', action: () => setInputMessage('What are common mistakes students make with this topic?') }
    ];

    if (isMinimized) {
        return (
            <div className="chat-minimized">
                <button
                    className="chat-restore-btn"
                    onClick={() => setIsMinimized(false)}
                >
                    🤖 AI Tutor
                </button>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-title">
                    <span className="chat-icon">🤖</span>
                    <h3>AI Tutor</h3>
                    {context && (
                        <span className="chat-context">
                            {context.concept || 'General Help'}
                        </span>
                    )}
                </div>
                <div className="chat-controls">
                    <button
                        className="chat-btn"
                        onClick={clearChat}
                        title="Clear chat"
                    >
                        🗑️
                    </button>
                    <button
                        className="chat-btn"
                        onClick={() => setIsMinimized(true)}
                        title="Minimize"
                    >
                        ➖
                    </button>
                    {onClose && (
                        <button
                            className="chat-btn"
                            onClick={onClose}
                            title="Close"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((message) => (
                    <div key={message.id} className={`message ${message.type}`}>
                        <div className="message-avatar">
                            {message.type === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                            <div className={`message-bubble ${message.error ? 'error' : ''}`}>
                                {message.content}
                            </div>
                            <div className="message-timestamp">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message ai">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="message-bubble loading">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
                <div className="quick-actions">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className="quick-action-btn"
                            onClick={action.action}
                            disabled={isLoading}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="chat-input">
                <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about 11+ preparation..."
                    rows="2"
                    disabled={isLoading}
                />
                <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                >
                    {isLoading ? '⏳' : '➤'}
                </button>
            </div>
        </div>
    );
}

export default Chat;
