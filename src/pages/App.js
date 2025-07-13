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
  const [conceptFeatures, setConceptFeatures] = useState({});

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

  // Check which concepts have examiner insights and question formations
  const checkConceptFeatures = async (conceptName) => {
    try {
      const fileName = conceptName.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[(),.]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        + ".json";

      const module = await import(`../data/content/${fileName}`);
      return {
        hasExaminerInsights: !!module.examinerInsights,
        hasQuestionFormations: !!module.questionFormations,
        hasExamTips: !!(module.questionFormations?.examTips),
        hasTimeManagement: !!(module.examinerInsights?.timeManagement),
        hasCommonTraps: !!(module.examinerInsights?.commonTraps)
      };
    } catch (error) {
      return {
        hasExaminerInsights: false,
        hasQuestionFormations: false,
        hasExamTips: false,
        hasTimeManagement: false,
        hasCommonTraps: false
      };
    }
  };

  // Load concept features when navigating to categories
  useEffect(() => {
    if (subject && !category && concepts[subject]) {
      const loadCategoryFeatures = async () => {
        const categoryFeatures = {};
        for (const cat of Object.keys(concepts[subject])) {
          let enhancedCount = 0;
          for (const conceptName of concepts[subject][cat]) {
            const features = await checkConceptFeatures(conceptName);
            if (features.hasExaminerInsights || features.hasQuestionFormations) {
              enhancedCount++;
            }
          }
          categoryFeatures[cat] = enhancedCount;
        }
        setConceptFeatures(categoryFeatures);
      };
      loadCategoryFeatures();
    }
  }, [subject, category]);

  // Load concept features when navigating to specific category
  useEffect(() => {
    if (subject && category && concepts[subject] && concepts[subject][category]) {
      const loadFeatures = async () => {
        const features = {};
        for (const conceptName of concepts[subject][category]) {
          features[conceptName] = await checkConceptFeatures(conceptName);
        }
        setConceptFeatures(features);
      };
      loadFeatures();
    }
  }, [subject, category]);

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

  // Category descriptions for better understanding
  const getCategoryDescription = (subject, category) => {
    const descriptions = {
      mathematics: {
        // Math descriptions remain the same
      },
      english: {
        "Reading & Comprehension": "Master strategic reading techniques for fiction, non-fiction, and poetry",
        "Creative Writing": "Develop compelling storytelling abilities with advanced narrative techniques",
        "Technical Writing": "Perfect formal writing skills for essays, reports, and structured responses",
        "Exam Strategies": "Learn time management and strategic approaches specific to English exams",
        "Language Tools": "Build vocabulary, grammar, and expression skills systematically",
        "Genre Mastery": "Develop specialized skills for different text types and writing styles"
      }
    };
    return descriptions[subject]?.[category] || `Master the essential skills in ${category}`;
  };

  // Check if a category is skill-based (English) or concept-based (Math)
  const isSkillBased = (subject) => subject === 'english';

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
                    : 'Strategic skills for reading, writing, and exam success'}
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
          <h2>{subject.charAt(0).toUpperCase() + subject.slice(1)} {isSkillBased(subject) ? 'Skills' : 'Categories'}</h2>
          <div className="category-grid">
            {Object.keys(concepts[subject]).map((cat) => {
              const enhancedCount = conceptFeatures[cat] || 0;
              const itemCount = concepts[subject][cat].length;
              const skillOrConcept = isSkillBased(subject) ? 'skills' : 'concepts';

              return (
                <div
                  key={cat}
                  className={`category-card ${isSkillBased(subject) ? 'skill-based' : 'concept-based'}`}
                  onClick={() => handleCategory(cat)}
                >
                  <div className="category-header">
                    <h3>{cat}</h3>
                    {isSkillBased(subject) && (
                      <span className="skill-badge">✨ Skills</span>
                    )}
                  </div>
                  <p className="category-description">{getCategoryDescription(subject, cat)}</p>
                  <p className="item-count">{itemCount} {skillOrConcept}</p>
                  {enhancedCount > 0 && (
                    <div className="enhanced-indicator">
                      ⭐ {enhancedCount} exam-ready {skillOrConcept}
                    </div>
                  )}
                  <div className="concept-progress">
                    {concepts[subject][cat].map((cpt, idx) => (
                      <div
                        key={idx}
                        className={`progress-dot ${getConceptProgress(subject, cat, cpt).completed ? 'completed' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (subject && category && !concept) {
      return (<div className="concept-selection">
        <button className="back-button" onClick={() => setCategory(null)}>
          ← Back to {isSkillBased(subject) ? 'Skills' : 'Categories'}
        </button>
        <div className="category-intro">
          <h2>{category}</h2>
          <p className="category-description">{getCategoryDescription(subject, category)}</p>
        </div>

        {!isSkillBased(subject) && (
          <div className="exam-features-guide">
            <h4>🎓 Enhanced Learning Features</h4>
            <div className="features-legend">
              <span className="legend-item">
                <span className="feature-badge question-strategies">🎯 Exam Strategies</span>
                Question types & solving strategies
              </span>
              <span className="legend-item">
                <span className="feature-badge examiner-insights">🔍 Examiner Insights</span>
                How examiners create questions
              </span>
              <span className="legend-item">
                <span className="feature-badge common-traps">⚠️ Trap Alerts</span>
                Common mistakes to avoid
              </span>
              <span className="legend-item">
                <span className="feature-badge time-management">⏱️ Time Tips</span>
                Time management strategies
              </span>
            </div>
          </div>
        )}

        {isSkillBased(subject) && (
          <div className="skill-features-guide">
            <h4>🎯 Skill-Based Learning Features</h4>
            <div className="features-legend">
              <span className="legend-item">
                <span className="feature-badge skill-techniques">🛠️ Techniques</span>
                Practical methods and approaches
              </span>
              <span className="legend-item">
                <span className="feature-badge skill-examples">📝 Examples</span>
                Real examples and demonstrations
              </span>
              <span className="legend-item">
                <span className="feature-badge skill-practice">🎯 Practice</span>
                Interactive exercises and activities
              </span>
              <span className="legend-item">
                <span className="feature-badge skill-mastery">⭐ Mastery</span>
                Advanced applications and tips
              </span>
            </div>
          </div>
        )}

        <div className="concept-list">
          {concepts[subject][category].map((cpt) => {
            const conceptProgress = getConceptProgress(subject, category, cpt);
            const features = conceptFeatures[cpt] || {};
            const itemType = isSkillBased(subject) ? 'skill' : 'concept';

            return (
              <div
                key={cpt}
                className={`concept-item ${conceptProgress.completed ? 'completed' : ''} ${isSkillBased(subject) ? 'skill-item' : 'concept-item'}`}
                onClick={() => handleConcept(cpt)}
              >
                <div className="concept-info">
                  <h3>{cpt}</h3>
                  <div className="concept-features">
                    {!isSkillBased(subject) && (
                      <>
                        {features.hasQuestionFormations && (
                          <span className="feature-badge question-strategies" title="Question Types & Strategies">
                            🎯 Exam Strategies
                          </span>
                        )}
                        {features.hasExaminerInsights && (
                          <span className="feature-badge examiner-insights" title="Examiner's Perspective">
                            🔍 Examiner Insights
                          </span>
                        )}
                        {features.hasCommonTraps && (
                          <span className="feature-badge common-traps" title="Common Traps & Mistakes">
                            ⚠️ Trap Alerts
                          </span>
                        )}
                        {features.hasTimeManagement && (
                          <span className="feature-badge time-management" title="Time Management Strategy">
                            ⏱️ Time Tips
                          </span>
                        )}
                      </>
                    )}
                    {isSkillBased(subject) && (
                      <>
                        <span className="feature-badge skill-techniques" title="Practical Techniques">
                          🛠️ Techniques
                        </span>
                        <span className="feature-badge skill-examples" title="Real Examples">
                          📝 Examples
                        </span>
                        <span className="feature-badge skill-practice" title="Interactive Practice">
                          🎯 Practice
                        </span>
                      </>
                    )}
                  </div>
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
