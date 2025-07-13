# AI English Comprehension Test Generation Prompts

## High-Quality 11+ English Comprehension Test Generator

### PROMPT 1: Advanced Reading Comprehension Test

```
You are an expert 11+ English tutor with extensive experience in creating high-quality reading comprehension tests that match the standards of top UK independent schools. Generate a comprehensive English reading comprehension test for 11+ exam preparation.

REQUIREMENTS:
- Create exactly 2-3 passages of varying genres (fiction, non-fiction, poetry)
- Total of 15-20 questions across all passages
- Include diverse question types: literal comprehension, inference, vocabulary in context, author's intent, literary devices, character analysis, theme identification
- Age-appropriate content for 10-11 year olds but challenging enough for 11+ level
- Passages should be 200-400 words each
- Include detailed explanations for each answer
- Follow UK 11+ curriculum standards and match the difficulty of CEM, GL Assessment, and ISEB tests

PASSAGE REQUIREMENTS:
1. First passage: Fiction (adventure, mystery, or coming-of-age story)
2. Second passage: Non-fiction (science, history, biography, or current events)
3. Third passage (optional): Poetry or descriptive writing

QUESTION TYPES TO INCLUDE:
1. Direct retrieval (20%)
2. Inference and deduction (30%)
3. Vocabulary in context (15%)
4. Character analysis and motivation (15%)
5. Author's purpose and technique (10%)
6. Literary devices and language use (10%)

DIFFICULTY DISTRIBUTION:
- Easy: 25% (basic comprehension and retrieval)
- Medium: 50% (inference, analysis, vocabulary)
- Hard: 25% (complex analysis, literary techniques, sophisticated inference)

OUTPUT FORMAT (JSON):
{
  "id": "ai-english-comprehension-[number]",
  "title": "11+ English Reading Comprehension Test",
  "subject": "english",
  "description": "Advanced reading comprehension test with multiple passages testing understanding, inference, and analytical skills",
  "timeLimit": 50,
  "totalQuestions": 18,
  "difficulty": "mixed",
  "topics": [
    "reading-comprehension",
    "inference",
    "vocabulary-in-context",
    "character-analysis",
    "authorial-intent",
    "literary-devices",
    "theme-analysis"
  ],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "passages": [
    {
      "id": "passage1",
      "title": "[Engaging Title]",
      "genre": "fiction",
      "text": "[High-quality fiction passage 250-350 words with rich vocabulary, complex characters, and engaging plot]"
    },
    {
      "id": "passage2",
      "title": "[Informative Title]", 
      "genre": "non-fiction",
      "text": "[Well-structured non-fiction passage 200-300 words with factual content, clear arguments, and sophisticated language]"
    }
  ],
  "questions": [
    {
      "id": 1,
      "passageId": "passage1",
      "question": "[Thoughtful question testing specific comprehension skill]",
      "type": "multiple-choice",
      "options": [
        "[Plausible distractor]",
        "[Correct answer]",
        "[Plausible distractor]",
        "[Plausible distractor]"
      ],
      "correct": 1,
      "explanation": "[Detailed explanation showing why the answer is correct and why others are wrong]",
      "topic": "[Specific skill being tested]",
      "difficulty": "medium"
    }
  ]
}

QUALITY STANDARDS:
- Passages must be original, engaging, and educationally valuable
- Questions should test genuine understanding, not just memory
- All distractors must be plausible to avoid easy elimination
- Explanations should be educational and help students learn
- Language level should challenge students while remaining accessible
- Content should be culturally inclusive and avoid stereotypes

Generate the complete JSON now with high-quality content that rivals commercial 11+ tests.
```

### PROMPT 2: Vocabulary and Language Skills Test

```
You are an expert 11+ English tutor. Generate a comprehensive vocabulary and language skills test for 11+ exam preparation focusing on advanced language use, word knowledge, and linguistic analysis.

REQUIREMENTS:
- Create exactly 20 questions
- Cover advanced vocabulary, synonyms/antonyms, word formation, language techniques
- Age-appropriate for 10-11 year olds but at 11+ examination standard
- Include detailed explanations for each answer
- Test both receptive and productive vocabulary skills

QUESTION AREAS:
1. Advanced Vocabulary (25%) - challenging words appropriate for age
2. Synonyms and Antonyms (20%) - precise word relationships
3. Word Formation (15%) - prefixes, suffixes, root words
4. Vocabulary in Context (20%) - understanding meaning from context
5. Language Techniques (10%) - metaphor, simile, alliteration
6. Word Categories and Classification (10%) - collective nouns, abstract concepts

DIFFICULTY DISTRIBUTION:
- Easy: 20% (common advanced vocabulary)
- Medium: 60% (challenging inference and analysis)
- Hard: 20% (sophisticated language concepts)

OUTPUT FORMAT (JSON):
{
  "id": "ai-english-vocabulary-[number]",
  "title": "11+ English Vocabulary and Language Skills Test",
  "subject": "english",
  "description": "Advanced vocabulary test focusing on word knowledge, language techniques, and linguistic analysis",
  "timeLimit": 35,
  "totalQuestions": 20,
  "difficulty": "mixed",
  "topics": [
    "vocabulary",
    "synonyms-antonyms", 
    "word-formation",
    "language-techniques",
    "vocabulary-in-context"
  ],
  "generatedBy": "ai-offline",
  "generatedDate": "2025-01-15",
  "questions": [...]
}

Generate high-quality content with sophisticated vocabulary appropriate for 11+ level.
```

### PROMPT 3: Grammar and Writing Skills Test

```
You are an expert 11+ English tutor. Generate a comprehensive grammar and writing skills test that covers advanced grammatical concepts and writing techniques suitable for 11+ examination.

REQUIREMENTS:
- Create exactly 15 questions
- Cover complex grammar, sentence structure, punctuation, and writing techniques
- Include questions on style, tone, and effective communication
- Test understanding of grammatical rules in context

QUESTION AREAS:
1. Complex Grammar (30%) - tenses, subjunctive, conditionals
2. Sentence Structure (25%) - complex and compound sentences
3. Punctuation and Capitalization (20%) - advanced punctuation rules
4. Writing Style and Technique (15%) - tone, register, audience
5. Error Identification and Correction (10%) - spotting and fixing errors

Generate the complete JSON with challenging but age-appropriate content.
```

## Usage Instructions

1. **Copy any prompt above**
2. **Paste into ChatGPT/Claude/Gemini**
3. **Save the output as JSON file** in `/src/data/ai-tests/`
4. **Name files**: `ai-english-comprehension-002.json`, `ai-english-vocabulary-003.json`, etc.
5. **Add import to service file**
6. **Restart app to load new tests**

## Quality Guidelines

- **Passages should be engaging and age-appropriate**
- **Questions should test genuine understanding**
- **All options should be plausible**
- **Explanations should be educational**
- **Content should match 11+ examination standards**
- **Language should challenge without frustrating**

## File Naming Convention
- `ai-english-comprehension-[number].json` - Reading comprehension tests
- `ai-english-vocabulary-[number].json` - Vocabulary and word skills
- `ai-english-grammar-[number].json` - Grammar and writing skills
- `ai-english-mixed-[number].json` - Combined skills tests
