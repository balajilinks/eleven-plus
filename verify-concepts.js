const concepts = require('./src/data/concepts.json');
const fs = require('fs');

// Function to normalize concept name to filename (matches LearningModule.js)
function conceptToFileName(concept) {
    return concept.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[(),.]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

const contentDir = './src/data/content';
const existingFiles = fs.readdirSync(contentDir).map(f => f.replace('.json', ''));

console.log('🎯 Final Verification Report\n');
console.log('============================\n');

let totalConcepts = 0;
let loadableConcepts = 0;

// Check all concepts
['mathematics', 'english'].forEach(subject => {
    console.log(`📚 ${subject.toUpperCase()}:`);
    Object.keys(concepts[subject]).forEach(category => {
        concepts[subject][category].forEach(concept => {
            totalConcepts++;
            const fileName = conceptToFileName(concept);
            const exists = existingFiles.includes(fileName);
            if (exists) {
                loadableConcepts++;
                console.log(`  ✅ ${concept}`);
            } else {
                console.log(`  ❌ ${concept} -> ${fileName}.json`);
            }
        });
    });
    console.log('');
});

const successRate = Math.round((loadableConcepts / totalConcepts) * 100);

console.log('📊 SUMMARY:');
console.log(`Total concepts: ${totalConcepts}`);
console.log(`Loadable concepts: ${loadableConcepts}`);
console.log(`Success rate: ${successRate}%`);

if (successRate === 100) {
    console.log('\n🎉 SUCCESS! All concepts should now load properly in the app!');
    console.log('   You can navigate to any concept and it should display content.');
} else {
    console.log('\n⚠️  Some concepts are still missing files.');
}

console.log('\n💡 Next steps:');
console.log('   1. Test the app by navigating to different concepts');
console.log('   2. Enhance the template content files with more detailed information');
console.log('   3. Add more examples and exercises to improve learning experience');
