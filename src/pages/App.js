import React, { useState, useEffect } from "react";
import concepts from "../data/concepts.json";
import LearningModule from "../components/LearningModule";
import ProgressTracker from "../components/ProgressTracker";
import Navigation from "../components/Navigation";
import Settings from "../components/Settings";
import Chat from "../components/Chat";
import MockTest from "../components/MockTest";
import aiService from "../services/aiService";
import './App.css';

function App() {
  const [subject, setSubject] = useState(null);
  const [category, setCategory] = useState(null);
  const [concept, setConcept] = useState(null);
  const [progress, setProgress] = useState({});
  const [currentPage, setCurrentPage] = useState('home');
  const [showChat, setShowChat] = useState(false);
  const [aiConnected, setAiConnected] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('elevenPlusProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('elevenPlusProgress', JSON.stringify(progress));
  }, [progress]);

  // Check AI connection status
  useEffect(() => {
    const checkAIConnection = async () => {
      const result = await aiService.testConnection();
      setAiConnected(result.success);
    };

    checkAIConnection();
    // Check every 30 seconds
    const interval = setInterval(checkAIConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reset deeper selections if subject/category changes
  const handleSubject = (subj) => {
    setSubject(subj);
    setCategory(null);
    setConcept(null);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setConcept(null);
  };

  const handleConcept = (cpt) => setConcept(cpt);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === 'home') {
      setSubject(null);
      setCategory(null);
      setConcept(null);
    }
  };

  const handleChatToggle = () => {
    if (aiConnected) {
      setShowChat(!showChat);
    } else {
      setCurrentPage('settings');
    }
  };

  const getChatContext = () => {
    if (subject && category && concept) {
      return {
        subject,
        category,
        concept,
        studentProgress: getConceptProgress(subject, category, concept)
      };
    }
    return null;
  };

  const updateProgress = (subject, category, concept, score) => {
    setProgress(prev => ({
      ...prev,
      [`${subject}-${category}-${concept}`]: {
        completed: true,
        score: score,
        lastAttempt: new Date().toISOString()
      }
    }));
  };

  const getConceptProgress = (subj, cat, cpt) => {
    return progress[`${subj}-${cat}-${cpt}`] || { completed: false, score: 0 };
  };

  const renderContent = () => {
    if (currentPage === 'settings') {
      return <Settings />;
    }

    if (currentPage === 'mock-tests') {
      return <MockTest />;
    }

    // Home page content
    if (!subject) {
      return (
        <div className="subject-selection">
          <h2>Choose Your Subject</h2>
          <div className="subject-cards">
            {Object.keys(concepts).map((subj) => (
              <div
                key={subj}
                className={`subject-card ${subj}`}
                onClick={() => handleSubject(subj)}
              >
                <div className="subject-icon">
                  {subj === 'mathematics' ? '📊' : '📚'}
                </div>
                <h3>{subj.charAt(0).toUpperCase() + subj.slice(1)}</h3>
                <p>
                  {subj === 'mathematics'
                    ? 'Numbers, shapes, and problem solving'
                    : 'Reading, writing, and comprehension'}
                </p>
                <ProgressTracker
                  subject={subj}
                  concepts={concepts[subj]}
                  progress={progress}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (subject && !category) {
      return (
        <div className="category-selection">
          <button className="back-button" onClick={() => setSubject(null)}>
            ← Back to Subjects
          </button>
          <h2>{subject.charAt(0).toUpperCase() + subject.slice(1)} Categories</h2>
          <div className="category-grid">
            {Object.keys(concepts[subject]).map((cat) => (
              <div
                key={cat}
                className="category-card"
                onClick={() => handleCategory(cat)}
              >
                <h3>{cat}</h3>
                <p>{concepts[subject][cat].length} concepts</p>
                <div className="concept-progress">
                  {concepts[subject][cat].map((cpt, idx) => (
                    <div
                      key={idx}
                      className={`progress-dot ${getConceptProgress(subject, cat, cpt).completed ? 'completed' : ''}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (subject && category && !concept) {
      return (
        <div className="concept-selection">
          <button className="back-button" onClick={() => setCategory(null)}>
            ← Back to Categories
          </button>
          <h2>{category}</h2>
          <div className="concept-list">
            {concepts[subject][category].map((cpt) => {
              const conceptProgress = getConceptProgress(subject, category, cpt);
              return (
                <div
                  key={cpt}
                  className={`concept-item ${conceptProgress.completed ? 'completed' : ''}`}
                  onClick={() => handleConcept(cpt)}
                >
                  <div className="concept-info">
                    <h3>{cpt}</h3>
                    {conceptProgress.completed && (
                      <span className="completion-badge">
                        ✓ Score: {conceptProgress.score}%
                      </span>
                    )}
                  </div>
                  <div className="concept-arrow">→</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (subject && category && concept) {
      return (
        <div className="learning-module">
          <button className="back-button" onClick={() => setConcept(null)}>
            ← Back to Concepts
          </button>
          <LearningModule
            subject={subject}
            category={category}
            concept={concept}
            onProgress={updateProgress}
          />
        </div>
      );
    }
  };

  return (
    <div className="app">
      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onChatToggle={handleChatToggle}
        aiConnected={aiConnected}
      />

      {currentPage === 'home' && (
        <header className="app-header">
          <h1>🎓 11+ Sutton S.E.T. Core Concepts</h1>
          <p className="app-subtitle">Master the fundamentals for success</p>
        </header>
      )}

      <div className="app-content">
        {renderContent()}
      </div>

      {showChat && (
        <Chat
          context={getChatContext()}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

export default App;
