import React, { useState } from 'react';
import './Navigation.css';

function Navigation({ currentPage, onPageChange, onChatToggle, aiConnected }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'mock-tests', label: 'Mock Tests', icon: '📝' },
        { id: 'settings', label: 'AI Settings', icon: '⚙️' },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navigation">
            <div className="nav-brand">
                <span className="nav-logo">🎓</span>
                <span className="nav-title">11+ Tutor</span>
            </div>

            <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => {
                            onPageChange(item.id);
                            setIsMenuOpen(false);
                        }}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="nav-actions">
                <button
                    className={`chat-toggle-btn ${aiConnected ? 'connected' : 'disconnected'}`}
                    onClick={onChatToggle}
                    title={aiConnected ? 'Open AI Tutor' : 'Configure AI first'}
                >
                    <span className="chat-icon">🤖</span>
                    <span className="chat-label">AI Tutor</span>
                    <span className={`connection-status ${aiConnected ? 'connected' : 'disconnected'}`}>
                        {aiConnected ? '●' : '○'}
                    </span>
                </button>

                <button className="menu-toggle" onClick={toggleMenu}>
                    <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>
        </nav>
    );
}

export default Navigation;
