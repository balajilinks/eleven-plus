const concepts = require('./src/data/concepts.json');
const fs = require('fs');
const path = require('path');

// Function to normalize concept name to filename (matches LearningModule.js)
function conceptToFileName(concept) {
    return concept.toLowerCase()
        .replace(/\s+/g, "-")      // Replace spaces with hyphens
        .replace(/[(),.]/g, "")    // Remove parentheses, commas, periods
        .replace(/-+/g, "-")       // Replace multiple hyphens with single
        .replace(/^-|-$/g, "");    // Remove leading/trailing hyphens
}

const contentDir = './src/data/content';
const existingFiles = fs.readdirSync(contentDir).map(f => f.replace('.json', ''));

let missingFiles = [];

// Check mathematics concepts
Object.keys(concepts.mathematics).forEach(category => {
    concepts.mathematics[category].forEach(concept => {
        const fileName = conceptToFileName(concept);
        if (!existingFiles.includes(fileName)) {
            missingFiles.push({ concept, fileName, category, subject: 'mathematics' });
        }
    });
});

// Check english concepts
Object.keys(concepts.english).forEach(category => {
    concepts.english[category].forEach(concept => {
        const fileName = conceptToFileName(concept);
        if (!existingFiles.includes(fileName)) {
            missingFiles.push({ concept, fileName, category, subject: 'english' });
        }
    });
});

console.log(`Creating ${missingFiles.length} missing content files...\n`);

// Template for content files
function createContentTemplate(concept, subject, category) {
    return {
        concept: concept,
        subject: subject,
        category: category,
        explanation: `This is the ${concept} concept in ${subject}. This module helps students understand and practice ${concept.toLowerCase()} through interactive exercises and examples.`,
        examples: [
            {
                question: `Sample question about ${concept.toLowerCase()}`,
                solution: "Sample answer",
                explanation: `Step-by-step explanation for ${concept.toLowerCase()}`
            }
        ],
        exercises: [
            {
                type: "multiple-choice",
                question: `Practice question about ${concept.toLowerCase()}`,
                options: [
                    "Option A",
                    "Option B",
                    "Option C",
                    "Option D"
                ],
                correct: [1],
                feedback: [
                    "This is not correct. Try again.",
                    "Correct! Well done.",
                    "This is not the right answer.",
                    "Incorrect. Review the concept and try again."
                ]
            }
        ]
    };
}

// Create all missing files
missingFiles.forEach(({ concept, fileName, category, subject }) => {
    const template = createContentTemplate(concept, subject, category);
    const filePath = path.join(contentDir, fileName + '.json');

    try {
        fs.writeFileSync(filePath, JSON.stringify(template, null, 4));
        console.log(`✅ Created: ${fileName}.json`);
    } catch (error) {
        console.log(`❌ Failed to create: ${fileName}.json - ${error.message}`);
    }
});

console.log(`\n🎉 Finished creating ${missingFiles.length} content files!`);
console.log('Note: These are template files. You may want to add more detailed content and exercises.');
