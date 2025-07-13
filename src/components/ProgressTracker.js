import React from 'react';

const ProgressTracker = ({ subject, concepts, progress }) => {
    const isSkillBased = subject === 'english';
    const itemType = isSkillBased ? 'skills' : 'concepts';

    const getTotalConcepts = () => {
        return Object.values(concepts).reduce((total, categoryList) => total + categoryList.length, 0);
    };

    const getCompletedConcepts = () => {
        let completed = 0;
        Object.entries(concepts).forEach(([category, conceptList]) => {
            conceptList.forEach(concept => {
                const progressKey = `${subject}-${category}-${concept}`;
                if (progress[progressKey]?.completed) {
                    completed++;
                }
            });
        });
        return completed;
    };

    const totalConcepts = getTotalConcepts();
    const completedConcepts = getCompletedConcepts();
    const percentage = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;

    return (
        <div className="progress-tracker">
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="progress-text">
                {completedConcepts} / {totalConcepts} {itemType} completed ({percentage}%)
            </div>
        </div>
    );
};

export default ProgressTracker;
