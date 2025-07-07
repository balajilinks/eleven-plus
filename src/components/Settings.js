import React, { useState, useEffect } from 'react';
import aiService from '../services/aiService';
import aiTestResultsManager from '../services/aiTestResultsManager';
import NewTopicsSummary from './NewTopicsSummary';
import './Settings.css';

function Settings() {
    const [config, setConfig] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showNewTopics, setShowNewTopics] = useState(false);
    const [showDataManagement, setShowDataManagement] = useState(false);
    const [exportStatus, setExportStatus] = useState(null);
    const [importStatus, setImportStatus] = useState(null);

    useEffect(() => {
        setConfig(aiService.getConfig());
    }, []);

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        aiService.saveConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);

        // Save current config temporarily for testing
        aiService.saveConfig(config);

        const result = await aiService.testConnection();
        setTestResult(result);
        setTesting(false);
    };

    const presetConfigs = {
        lmstudio: {
            provider: 'lmstudio',
            apiUrl: 'http://localhost:1234/v1',
            apiKey: '',
            model: 'local-model'
        },
        openai: {
            provider: 'openai',
            apiUrl: 'https://api.openai.com/v1',
            apiKey: '',
            model: 'gpt-3.5-turbo'
        },
        ollama: {
            provider: 'ollama',
            apiUrl: 'http://localhost:11434/v1',
            apiKey: '',
            model: 'llama2'
        }
    };

    const loadPreset = (preset) => {
        setConfig(prev => ({
            ...prev,
            ...presetConfigs[preset]
        }));
    };

    const handleExportData = () => {
        try {
            const data = aiTestResultsManager.exportAllData();
            setExportStatus(`Successfully exported ${data.testResults?.length || 0} test results and settings`);
            setTimeout(() => setExportStatus(null), 3000);
        } catch (error) {
            setExportStatus(`Export failed: ${error.message}`);
            setTimeout(() => setExportStatus(null), 3000);
        }
    };

    const handleImportData = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await aiTestResultsManager.importData(file);
            setImportStatus(`Successfully imported data from ${data.exportDate}`);
            setTimeout(() => setImportStatus(null), 3000);
        } catch (error) {
            setImportStatus(`Import failed: ${error.message}`);
            setTimeout(() => setImportStatus(null), 3000);
        }

        // Clear the file input
        event.target.value = '';
    };

    const handleExportAnalytics = () => {
        try {
            const report = aiTestResultsManager.generateAnalyticsReport();
            setExportStatus(`Analytics report generated with ${report.summary.totalTests} tests analyzed`);
            setTimeout(() => setExportStatus(null), 3000);
        } catch (error) {
            setExportStatus(`Analytics export failed: ${error.message}`);
            setTimeout(() => setExportStatus(null), 3000);
        }
    };

    const handleClearData = () => {
        const confirmed = window.confirm(
            'Are you sure you want to clear all data? This action cannot be undone.\n\n' +
            'This will remove:\n' +
            '• All test results\n' +
            '• AI settings\n' +
            '• Student progress\n' +
            '• Generation statistics'
        );

        if (confirmed) {
            try {
                aiTestResultsManager.clearAllData(true);
                setImportStatus('All data cleared successfully');
                setTimeout(() => setImportStatus(null), 3000);
            } catch (error) {
                setImportStatus(`Clear failed: ${error.message}`);
                setTimeout(() => setImportStatus(null), 3000);
            }
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>🤖 AI Assistant Settings</h1>
                <p>Configure your AI tutor to help with 11+ preparation</p>
                <button
                    className="view-topics-btn"
                    onClick={() => setShowNewTopics(!showNewTopics)}
                    style={{
                        margin: '10px 0',
                        padding: '8px 16px',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}
                >
                    {showNewTopics ? 'Hide' : 'View'} New Advanced Topics ✨
                </button>
            </div>

            {showNewTopics && (
                <div style={{ marginBottom: '20px' }}>
                    <NewTopicsSummary />
                </div>
            )}

            <div className="settings-content">
                <div className="settings-section">
                    <h2>Quick Setup</h2>
                    <div className="preset-buttons">
                        <button
                            className={`preset-btn ${config.provider === 'lmstudio' ? 'active' : ''}`}
                            onClick={() => loadPreset('lmstudio')}
                        >
                            🖥️ LM Studio
                        </button>
                        <button
                            className={`preset-btn ${config.provider === 'openai' ? 'active' : ''}`}
                            onClick={() => loadPreset('openai')}
                        >
                            🧠 OpenAI
                        </button>
                        <button
                            className={`preset-btn ${config.provider === 'ollama' ? 'active' : ''}`}
                            onClick={() => loadPreset('ollama')}
                        >
                            🦙 Ollama
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>Connection Settings</h2>
                    <div className="form-group">
                        <label>Provider</label>
                        <select
                            value={config.provider || 'lmstudio'}
                            onChange={(e) => handleInputChange('provider', e.target.value)}
                        >
                            <option value="lmstudio">LM Studio</option>
                            <option value="openai">OpenAI</option>
                            <option value="ollama">Ollama</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>API URL</label>
                        <input
                            type="text"
                            value={config.apiUrl || ''}
                            onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                            placeholder="http://localhost:1234/v1"
                        />
                    </div>

                    <div className="form-group">
                        <label>API Key (optional for local models)</label>
                        <input
                            type="password"
                            value={config.apiKey || ''}
                            onChange={(e) => handleInputChange('apiKey', e.target.value)}
                            placeholder="Enter your API key"
                        />
                    </div>

                    <div className="form-group">
                        <label>Model Name</label>
                        <input
                            type="text"
                            value={config.model || ''}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            placeholder="local-model"
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h2>AI Behavior</h2>
                    <div className="form-group">
                        <label>Temperature (0.1 - 2.0)</label>
                        <input
                            type="range"
                            min="0.1"
                            max="2.0"
                            step="0.1"
                            value={config.temperature || 0.7}
                            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                        />
                        <span className="range-value">{config.temperature || 0.7}</span>
                    </div>

                    <div className="form-group">
                        <label>Max Tokens</label>
                        <input
                            type="range"
                            min="100"
                            max="2000"
                            step="50"
                            value={config.maxTokens || 1000}
                            onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                        />
                        <span className="range-value">{config.maxTokens || 1000}</span>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        className="test-btn"
                        onClick={handleTestConnection}
                        disabled={testing}
                    >
                        {testing ? '🔄 Testing...' : '🔍 Test Connection'}
                    </button>

                    <button
                        className={`save-btn ${saved ? 'saved' : ''}`}
                        onClick={handleSave}
                    >
                        {saved ? '✅ Saved!' : '💾 Save Settings'}
                    </button>
                </div>

                {testResult && (
                    <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        {testResult.success ? (
                            <div>
                                <h3>✅ Connection Successful!</h3>
                                <p>Your AI assistant is ready to help with 11+ preparation.</p>
                            </div>
                        ) : (
                            <div>
                                <h3>❌ Connection Failed</h3>
                                <p>{testResult.error}</p>
                                <div className="troubleshooting">
                                    <h4>Troubleshooting Tips:</h4>
                                    <ul>
                                        <li>Make sure your AI server is running</li>
                                        <li>Check the API URL is correct</li>
                                        <li>Verify your API key (if required)</li>
                                        <li>Ensure the model name matches your setup</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="settings-info">
                    <h3>ℹ️ Setup Instructions</h3>
                    <div className="info-tabs">
                        <div className="info-tab">
                            <h4>LM Studio</h4>
                            <ol>
                                <li>Download and install LM Studio</li>
                                <li>Load a model (recommended: Code Llama or similar)</li>
                                <li>Start the local server</li>
                                <li>Use default settings above</li>
                            </ol>
                        </div>
                        <div className="info-tab">
                            <h4>OpenAI</h4>
                            <ol>
                                <li>Sign up at OpenAI</li>
                                <li>Get your API key</li>
                                <li>Enter the API key above</li>
                                <li>Select your preferred model</li>
                            </ol>
                        </div>
                        <div className="info-tab">
                            <h4>Ollama</h4>
                            <ol>
                                <li>Install Ollama</li>
                                <li>Pull a model: <code>ollama pull llama2</code></li>
                                <li>Start Ollama service</li>
                                <li>Use default settings above</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="data-management-section">
                    <h2>📊 Data Management</h2>
                    <p>Export your test results and settings for backup or sharing</p>

                    <div className="data-actions">
                        <div className="action-group">
                            <button
                                className="export-btn"
                                onClick={handleExportData}
                            >
                                📥 Export All Data
                            </button>
                            <p className="action-description">Export test results, settings, and progress</p>
                        </div>

                        <div className="action-group">
                            <label className="import-btn">
                                📤 Import Data
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportData}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <p className="action-description">Import previously exported data</p>
                        </div>

                        <div className="action-group">
                            <button
                                className="analytics-btn"
                                onClick={handleExportAnalytics}
                            >
                                📊 Export Analytics Report
                            </button>
                            <p className="action-description">Detailed performance analysis and recommendations</p>
                        </div>

                        <div className="action-group">
                            <button
                                className="clear-data-btn"
                                onClick={handleClearData}
                            >
                                🗑️ Clear All Data
                            </button>
                            <p className="action-description">⚠️ Permanently delete all data</p>
                        </div>
                    </div>

                    {exportStatus && (
                        <div className={`status-message ${exportStatus.includes('failed') ? 'error' : 'success'}`}>
                            {exportStatus}
                        </div>
                    )}

                    {importStatus && (
                        <div className={`status-message ${importStatus.includes('failed') ? 'error' : 'success'}`}>
                            {importStatus}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
