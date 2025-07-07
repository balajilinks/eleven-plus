import React from 'react';
import concepts from '../data/concepts.json';

function NewTopicsSummary() {
    const newTopics = [
        'Order of Operations (BODMAS)',
        'Negative Numbers',
        'Rounding and Approximation',
        'Highest Common Factor (HCF)',
        'Lowest Common Multiple (LCM)',
        'Perfect Numbers',
        'Fibonacci Sequences',
        'Percentage Increase and Decrease',
        'Simple Interest',
        'Compound Interest',
        'Ratio and Proportion',
        'Direct and Inverse Proportion',
        'Substitution in Formulas',
        'Linear Equations',
        'Inequalities',
        'Simultaneous Equations',
        'Quadratic Expressions',
        'Circle Properties',
        'Pythagoras Theorem',
        'Similar Triangles',
        'Compound Shapes',
        '3D Shapes and Nets',
        'Reflection and Rotation',
        'Speed Distance Time',
        'Profit and Loss',
        'Tax and Discount Calculations',
        'Mathematical Reasoning',
        'Pattern Recognition',
        'Optimization Problems',
        'Combinatorics',
        'Probability',
        'Line Graphs',
        'Histograms',
        'Frequency Tables',
        'Cumulative Frequency',
        'Statistical Measures',
        'Trigonometry Basics',
        'Logarithms',
        'Exponential Functions',
        'Polynomial Operations',
        'Graphing Functions',
        'Matrix Operations',
        'Calculus Introduction'
    ];

    const availableContent = [
        'Order of Operations (BODMAS)',
        'Negative Numbers',
        'Rounding and Approximation',
        'Highest Common Factor (HCF)',
        'Compound Interest',
        'Speed Distance Time',
        'Simultaneous Equations',
        'Pythagoras Theorem',
        'Trigonometry Basics',
        'Probability'
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>🎯 Advanced 11+ Mathematics Topics Added</h2>

            <div style={{ marginBottom: '30px' }}>
                <h3>✅ Topics with Full Content ({availableContent.length} topics)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                    {availableContent.map((topic, index) => (
                        <div key={index} style={{
                            background: '#e8f5e8',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '2px solid #4CAF50'
                        }}>
                            ✅ {topic}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3>📋 All New Topics Added to Curriculum ({newTopics.length} topics)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {newTopics.map((topic, index) => (
                        <div key={index} style={{
                            background: availableContent.includes(topic) ? '#e8f5e8' : '#fff3cd',
                            padding: '8px',
                            borderRadius: '6px',
                            border: `1px solid ${availableContent.includes(topic) ? '#4CAF50' : '#ffc107'}`,
                            fontSize: '14px'
                        }}>
                            {availableContent.includes(topic) ? '✅' : '📝'} {topic}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                <h3>🚀 What's New in Your 11+ App</h3>
                <ul style={{ lineHeight: '1.6' }}>
                    <li><strong>43 New Advanced Topics</strong> - From basic BODMAS to introductory calculus</li>
                    <li><strong>10 Complete Learning Modules</strong> - With explanations, examples, and exercises</li>
                    <li><strong>AI-Powered Learning</strong> - Get personalized help with any topic</li>
                    <li><strong>Progressive Difficulty</strong> - Topics arranged from foundational to advanced</li>
                    <li><strong>Interactive Exercises</strong> - Multiple choice questions with detailed feedback</li>
                    <li><strong>Real-World Applications</strong> - Practical problems in finance, geometry, and statistics</li>
                </ul>
            </div>

            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                <h4>💡 Next Steps</h4>
                <p>The remaining topics are ready to have content created. You can:</p>
                <ul>
                    <li>Use the AI assistant to help explain any topic</li>
                    <li>Create more content files following the same pattern</li>
                    <li>Add more complex problem types (e.g., drag-and-drop, graphing)</li>
                    <li>Integrate with external math tools and calculators</li>
                </ul>
            </div>
        </div>
    );
}

export default NewTopicsSummary;
