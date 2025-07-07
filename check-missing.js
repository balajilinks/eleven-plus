const concepts = require('./src/data/concepts.json');
const fs = require('fs');
const path = require('path');

const contentDir = './src/data/content';
const existingFiles = fs.readdirSync(contentDir).map(f => f.replace('.json', ''));

console.log('Checking for missing content files...\n');

let missingFiles = [];
let foundFiles = [];

// Function to normalize concept name to filename (matches LearningModule.js)
function conceptToFileName(concept) {
    return concept.toLowerCase()
        .replace(/\s+/g, "-")      // Replace spaces with hyphens
        .replace(/[(),.]/g, "")    // Remove parentheses, commas, periods
        .replace(/-+/g, "-")       // Replace multiple hyphens with single
        .replace(/^-|-$/g, "");    // Remove leading/trailing hyphens
}

// Check mathematics concepts
Object.keys(concepts.mathematics).forEach(category => {
    console.log(`\n=== Mathematics: ${category} ===`);
    concepts.mathematics[category].forEach(concept => {
        const fileName = conceptToFileName(concept);
        if (!existingFiles.includes(fileName)) {
            console.log(`❌ MISSING: ${concept} -> ${fileName}.json`);
            missingFiles.push({ concept, fileName, category, subject: 'mathematics' });
        } else {
            console.log(`✅ ${concept}`);
            foundFiles.push({ concept, fileName, category, subject: 'mathematics' });
        }
    });
});

// Check english concepts
Object.keys(concepts.english).forEach(category => {
    console.log(`\n=== English: ${category} ===`);
    concepts.english[category].forEach(concept => {
        const fileName = conceptToFileName(concept);
        if (!existingFiles.includes(fileName)) {
            console.log(`❌ MISSING: ${concept} -> ${fileName}.json`);
            missingFiles.push({ concept, fileName, category, subject: 'english' });
        } else {
            console.log(`✅ ${concept}`);
            foundFiles.push({ concept, fileName, category, subject: 'english' });
        }
    });
});

console.log(`\n\n=== SUMMARY ===`);
console.log(`Total concepts: ${foundFiles.length + missingFiles.length}`);
console.log(`Found files: ${foundFiles.length}`);
console.log(`Missing files: ${missingFiles.length}`);

if (missingFiles.length > 0) {
    console.log('\n=== MISSING FILES ===');
    missingFiles.forEach(({ concept, fileName, category, subject }) => {
        console.log(`${subject}/${category}: ${concept} (${fileName}.json)`);
    });
}

// Check for orphaned files (files that don't match any concept)
console.log('\n=== CHECKING FOR ORPHANED FILES ===');
const allExpectedFiles = foundFiles.concat(missingFiles).map(f => f.fileName);
const orphanedFiles = existingFiles.filter(file => !allExpectedFiles.includes(file));
if (orphanedFiles.length > 0) {
    console.log('Orphaned files (no matching concept):');
    orphanedFiles.forEach(file => console.log(`- ${file}.json`));
} else {
    console.log('No orphaned files found.');
}
