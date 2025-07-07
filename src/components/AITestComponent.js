import React from 'react';
import aiService from '../services/aiService';

function AITestComponent() {
    const [status, setStatus] = React.useState('Not tested');
    const [loading, setLoading] = React.useState(false);

    const testAI = async () => {
        setLoading(true);
        setStatus('Testing...');

        try {
            // Test connection
            const connectionResult = await aiService.testConnection();

            if (connectionResult.success) {
                // Test actual AI response
                const response = await aiService.sendMessage('Say hello!');

                if (response.success) {
                    setStatus('✅ AI is working! Response: ' + response.message.substring(0, 100) + '...');
                } else {
                    setStatus('❌ AI connection OK but response failed: ' + response.error);
                }
            } else {
                setStatus('❌ Connection failed: ' + connectionResult.error);
            }
        } catch (error) {
            setStatus('❌ Error: ' + error.message);
        }

        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', margin: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>🤖 AI Test Component</h3>
            <p>Status: {status}</p>
            <button
                onClick={testAI}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Testing...' : 'Test AI Connection'}
            </button>
        </div>
    );
}

export default AITestComponent;
