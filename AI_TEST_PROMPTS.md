# AI Test Generation Prompts for Eleven Plus App

## Instructions for Use
1. Copy the appropriate prompt below
2. Paste it into ChatGPT, Gemini, or any AI assistant
3. The AI will generate a JSON file with test questions
4. Save the output as a .json file in the `/src/data/ai-tests/` folder
5. Add the import statement to `src/services/preGeneratedTestsService.js`
6. The app will automatically detect and load the new tests

## File Naming Convention
- Use format: `ai-{subject}-{type}-{number}.json`
- Examples: `ai-math-general-001.json`, `ai-english-vocab-002.json`, `ai-math-geometry-003.json`
- Available subjects: `math`, `english`, `mixed`
- Available types: `general`, `vocab`, `grammar`, `geometry`, `algebra`, `quick`, `adaptive`, `advanced`

## Currently Available Tests
- ✅ ai-math-general-001.json - General mathematics test
- ✅ ai-english-general-001.json - General English test
- ✅ ai-quick-practice-001.json - Quick mixed practice
- ✅ ai-english-vocab-002.json - Advanced vocabulary test
- ✅ ai-math-geometry-003.json - Geometry-focused test

## Adding New Tests
1. Generate test using prompts below
2. Save as JSON file with proper naming
3. Add import to `preGeneratedTestsService.js`:
   ```javascript
   import aiTestName from '../data/ai-tests/ai-test-name.json';
   ```
4. Add to the `availableTests` array in the service
5. Restart the app to load new tests

---

## PROMPT 1: Mathematics Test Generator

```
You are an expert 11+ mathematics tutor. Generate a comprehensive mathematics test for 11+ exam preparation.

REQUIREMENTS:
- Create exactly 25 questions
- Mix of difficulty levels: 8 easy, 12 medium, 5 hard
- Cover these topics: Arithmetic, Algebra, Geometry, Statistics, Probability, Fractions, Percentages, Problem Solving
- Age-appropriate for 10-11 year olds
- Include detailed explanations for each answer
- Follow UK 11+ curriculum standards

OUTPUT FORMAT (JSON):
{
  "id": "ai-math-test-001",
  "title": "AI Generated Mathematics Test",
  "subject": "mathematics",
  "description": "Comprehensive mathematics test covering key 11+ topics",
  "timeLimit": 45,
  "totalQuestions": 25,
  "difficulty": "mixed",
  "topics": ["arithmetic", "algebra", "geometry", "statistics", "probability"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "questions": [
    {
      "id": 1,
      "question": "Calculate: 15 + 8 × 3 - 4",
      "type": "multiple-choice",
      "options": [
        "35",
        "39", 
        "65",
        "31"
      ],
      "correct": 0,
      "explanation": "Following BODMAS: 8 × 3 = 24, then 15 + 24 - 4 = 35",
      "topic": "Order of Operations",
      "difficulty": "medium"
    }
  ]
}

QUESTION TYPES TO INCLUDE:
1. BODMAS/Order of Operations (2 questions)
2. Fractions and Percentages (3 questions)
3. Area and Perimeter (2 questions)
4. Sequences and Patterns (2 questions)
5. Solving Simple Equations (2 questions)
6. Word Problems (3 questions)
7. Statistics (Mean, Mode, Median) (2 questions)
8. Probability (2 questions)
9. Time and Money (2 questions)
10. Geometry (Angles, Shapes) (3 questions)
11. Mental Arithmetic (2 questions)

DIFFICULTY GUIDELINES:
- Easy: Basic arithmetic, simple fractions, basic shapes
- Medium: Multi-step problems, mixed operations, simple algebra
- Hard: Complex word problems, advanced geometry, probability

Generate the complete JSON now.
```

---

## PROMPT 2: English Test Generator

```
You are an expert 11+ English tutor. Generate a comprehensive English test for 11+ exam preparation.

REQUIREMENTS:
- Create exactly 25 questions
- Mix of difficulty levels: 8 easy, 12 medium, 5 hard
- Cover these topics: Grammar, Vocabulary, Reading Comprehension, Spelling, Punctuation, Writing Skills
- Age-appropriate for 10-11 year olds
- Include detailed explanations for each answer
- Follow UK 11+ curriculum standards

OUTPUT FORMAT (JSON):
{
  "id": "ai-english-test-001",
  "title": "AI Generated English Test",
  "subject": "english",
  "description": "Comprehensive English test covering key 11+ language skills",
  "timeLimit": 50,
  "totalQuestions": 25,
  "difficulty": "mixed",
  "topics": ["grammar", "vocabulary", "reading-comprehension", "spelling", "punctuation"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "questions": [
    {
      "id": 1,
      "question": "Which word is a synonym for 'happy'?",
      "type": "multiple-choice",
      "options": [
        "Sad",
        "Joyful",
        "Angry", 
        "Tired"
      ],
      "correct": 1,
      "explanation": "Joyful means the same as happy - both express positive emotions",
      "topic": "Synonyms and Antonyms",
      "difficulty": "easy"
    }
  ]
}

QUESTION TYPES TO INCLUDE:
1. Synonyms and Antonyms (3 questions)
2. Grammar (Tenses, Parts of Speech) (4 questions)
3. Spelling (Common words, patterns) (3 questions)
4. Punctuation (2 questions)
5. Vocabulary in Context (3 questions)
6. Sentence Structure (2 questions)
7. Reading Comprehension (3 questions)
8. Prefixes and Suffixes (2 questions)
9. Homophones (2 questions)
10. Creative Writing Elements (1 question)

DIFFICULTY GUIDELINES:
- Easy: Basic vocabulary, simple grammar, common spellings
- Medium: Complex sentences, inference, challenging vocabulary
- Hard: Advanced grammar, literary techniques, complex comprehension

Generate the complete JSON now.
```

---

## PROMPT 3: Topic-Specific Test Generator

```
You are an expert 11+ tutor. Generate a focused test on [TOPIC NAME] for 11+ exam preparation.

REPLACE [TOPIC NAME] WITH ONE OF:
- Fractions and Decimals
- Geometry and Shapes
- Statistics and Data
- Reading Comprehension
- Grammar and Punctuation
- Vocabulary Building
- Problem Solving
- Mental Arithmetic

REQUIREMENTS:
- Create exactly 15 questions (all focused on the chosen topic)
- Mix of difficulty levels: 5 easy, 7 medium, 3 hard
- Age-appropriate for 10-11 year olds
- Include detailed explanations for each answer
- Follow UK 11+ curriculum standards

OUTPUT FORMAT (JSON):
{
  "id": "ai-[topic]-test-001",
  "title": "AI Generated [Topic] Test",
  "subject": "[mathematics/english]",
  "description": "Focused test on [topic] for targeted practice",
  "timeLimit": 30,
  "totalQuestions": 15,
  "difficulty": "mixed",
  "topics": ["[topic]"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "questions": [...]
}

Generate the complete JSON now for the topic: [SPECIFY TOPIC]
```

---

## PROMPT 4: Adaptive Difficulty Test Generator

```
You are an expert 11+ tutor. Generate an adaptive mathematics test that progresses in difficulty.

REQUIREMENTS:
- Create exactly 20 questions
- Progressive difficulty: Questions 1-5 (easy), 6-10 (easy-medium), 11-15 (medium), 16-20 (hard)
- Mixed topics but logically connected
- Age-appropriate for 10-11 year olds
- Include detailed explanations for each answer
- Follow UK 11+ curriculum standards

OUTPUT FORMAT (JSON):
{
  "id": "ai-adaptive-math-001",
  "title": "AI Generated Adaptive Mathematics Test",
  "subject": "mathematics",
  "description": "Progressive difficulty test that adapts as you advance",
  "timeLimit": 40,
  "totalQuestions": 20,
  "difficulty": "adaptive",
  "topics": ["mixed"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "isAdaptive": true,
  "questions": [...]
}

PROGRESSION STRUCTURE:
- Questions 1-5: Basic arithmetic, simple fractions
- Questions 6-10: Multi-step problems, basic geometry
- Questions 11-15: Word problems, equations, percentages
- Questions 16-20: Complex problems, advanced geometry, statistics

Generate the complete JSON now.
```

---

## PROMPT 5: Quick Practice Test Generator

```
You are an expert 11+ tutor. Generate a quick practice test for daily revision.

REQUIREMENTS:
- Create exactly 10 questions
- Mix of subjects: 6 mathematics, 4 English
- Medium difficulty level
- Age-appropriate for 10-11 year olds
- Include detailed explanations for each answer
- Perfect for 15-minute practice sessions

OUTPUT FORMAT (JSON):
{
  "id": "ai-quick-practice-001",
  "title": "AI Generated Quick Practice Test",
  "subject": "mixed",
  "description": "Short daily practice test covering both subjects",
  "timeLimit": 15,
  "totalQuestions": 10,
  "difficulty": "medium",
  "topics": ["mixed"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "isQuickPractice": true,
  "questions": [...]
}

QUESTION DISTRIBUTION:
- Mathematics: 6 questions (arithmetic, fractions, geometry, word problems)
- English: 4 questions (grammar, vocabulary, reading, spelling)

Generate the complete JSON now.
```

---

## PROMPT 6: Advanced Level Test Generator

```
You are an expert 11+ tutor. Generate an advanced test for high-achieving students.

REQUIREMENTS:
- Create exactly 20 questions
- High difficulty level throughout
- Challenge concepts: Advanced geometry, complex word problems, sophisticated language
- Age-appropriate but challenging for 10-11 year olds
- Include detailed explanations for each answer
- Prepare students for grammar school entrance

OUTPUT FORMAT (JSON):
{
  "id": "ai-advanced-test-001",
  "title": "AI Generated Advanced Level Test",
  "subject": "[mathematics/english]",
  "description": "Challenging test for high-achieving students",
  "timeLimit": 45,
  "totalQuestions": 20,
  "difficulty": "hard",
  "topics": ["advanced"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "isAdvanced": true,
  "questions": [...]
}

ADVANCED TOPICS TO INCLUDE:
Mathematics: Simultaneous equations, Pythagoras theorem, complex fractions, advanced statistics
English: Literary analysis, advanced grammar, sophisticated vocabulary, inference skills

Generate the complete JSON now for: [SPECIFY SUBJECT]
```

---

## PROMPT 7: Revision Test Generator

```
You are an expert 11+ tutor. Generate a comprehensive revision test covering all key topics.

REQUIREMENTS:
- Create exactly 30 questions
- Comprehensive coverage: All major 11+ topics
- Mix of difficulty levels: 10 easy, 15 medium, 5 hard
- Age-appropriate for 10-11 year olds
- Include detailed explanations for each answer
- Perfect for final exam preparation

OUTPUT FORMAT (JSON):
{
  "id": "ai-revision-test-001",
  "title": "AI Generated Comprehensive Revision Test",
  "subject": "[mathematics/english]",
  "description": "Complete revision covering all 11+ topics",
  "timeLimit": 60,
  "totalQuestions": 30,
  "difficulty": "mixed",
  "topics": ["comprehensive"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "isRevision": true,
  "questions": [...]
}

COMPREHENSIVE COVERAGE:
Mathematics: Arithmetic, Algebra, Geometry, Statistics, Probability, Fractions, Percentages, Problem Solving
English: Grammar, Vocabulary, Reading Comprehension, Spelling, Punctuation, Writing Skills

Generate the complete JSON now for: [SPECIFY SUBJECT]
```

---

## ENHANCED ENGLISH COMPREHENSION PROMPTS

### High-Quality Reading Comprehension Generator

Use the comprehensive prompts in `AI_ENGLISH_COMPREHENSION_PROMPTS.md` for generating superior English content that matches 11+ examination standards.

### Quick English Test Types

**For Reading Comprehension:**
```
Generate a 11+ English reading comprehension test with 2 passages (1 fiction, 1 non-fiction) and 15-18 questions testing inference, character analysis, vocabulary in context, and literary devices. Include detailed explanations and make questions challenging but age-appropriate.
```

**For Advanced Vocabulary:**
```
Create a 11+ vocabulary test with 20 questions covering synonyms, antonyms, word formation, vocabulary in context, and etymology. Include sophisticated words appropriate for 10-11 year olds but at examination level difficulty.
```

**For Grammar and Language Skills:**
```
Generate a 11+ grammar test with 15 questions covering complex sentence structures, advanced punctuation, writing techniques, and error identification. Focus on sophisticated language use suitable for independent school entrance.
```

## UPDATED QUALITY STANDARDS

### Content Quality Requirements:
- **Passages must be original and engaging**
- **Questions should test genuine understanding, not memory**
- **All distractors must be plausible**
- **Explanations should be educational**
- **Language should challenge appropriately**
- **Content should be culturally inclusive**

### Difficulty Distribution:
- **Easy**: 20-25% (basic comprehension)
- **Medium**: 50-60% (inference and analysis)  
- **Hard**: 20-25% (sophisticated analysis)

### File Updates:
- ✅ ai-english-comprehension-002.json - Enhanced adventure/science passages
- ✅ ai-english-vocabulary-003.json - Advanced vocabulary test
- 🔄 Enhanced content service for ChatGPT integration
- 🔄 Improved learning modules with passage support

---

## USAGE INSTRUCTIONS

### Step 1: Generate Tests
1. Choose the appropriate prompt above
2. Copy and paste into ChatGPT, Gemini, or Claude
3. Replace any [PLACEHOLDERS] with specific values
4. Run the prompt and copy the JSON output

### Step 2: Save Test Files
1. Create the folder structure: `/src/data/ai-tests/`
2. Save each test as a separate JSON file
3. Use descriptive filenames:
   - `ai-math-general-001.json`
   - `ai-english-grammar-001.json`
   - `ai-quick-practice-001.json`

### Step 3: File Naming Convention
- Format: `ai-[subject]-[type]-[number].json`
- Examples:
  - `ai-math-general-001.json`
  - `ai-english-vocabulary-001.json`
  - `ai-math-geometry-001.json`
  - `ai-mixed-quick-001.json`

### Step 4: Test Validation
Before using, ensure each JSON file has:
- Valid JSON syntax
- All required fields present
- Correct answer indices (0-3)
- Age-appropriate content
- Detailed explanations

### Quality Guidelines
- Questions should be challenging but fair
- Explanations should be educational and encouraging
- Topics should align with UK 11+ curriculum
- Language should be clear and accessible
- Difficulty progression should be logical

---

## EXAMPLE OUTPUT

Here's what a properly formatted test file should look like:

```json
{
  "id": "ai-math-general-001",
  "title": "AI Generated Mathematics Test",
  "subject": "mathematics",
  "description": "Comprehensive mathematics test covering key 11+ topics",
  "timeLimit": 45,
  "totalQuestions": 5,
  "difficulty": "mixed",
  "topics": ["arithmetic", "geometry", "fractions"],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "questions": [
    {
      "id": 1,
      "question": "Calculate: 15 + 8 × 3 - 4",
      "type": "multiple-choice",
      "options": ["35", "39", "65", "31"],
      "correct": 0,
      "explanation": "Following BODMAS: 8 × 3 = 24, then 15 + 24 - 4 = 35",
      "topic": "Order of Operations",
      "difficulty": "medium"
    },
    {
      "id": 2,
      "question": "What is the area of a rectangle with length 8cm and width 5cm?",
      "type": "multiple-choice",
      "options": ["13 cm²", "26 cm²", "40 cm²", "45 cm²"],
      "correct": 2,
      "explanation": "Area = length × width = 8 × 5 = 40 cm²",
      "topic": "Area and Perimeter",
      "difficulty": "easy"
    }
  ]
}
```

This system allows you to generate high-quality tests offline and load them instantly into the application!
