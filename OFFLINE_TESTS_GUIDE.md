# 📁 Offline AI Tests - User Guide

## What are Offline AI Tests?

Offline AI Tests are pre-generated test questions created using AI tools like ChatGPT or Gemini. These tests help reduce server load and provide instant access to high-quality practice questions without needing an active AI connection.

## How to Use Offline AI Tests

### 1. Accessing Offline Tests
1. Go to the **Mock Tests** section
2. Click on **"📁 Offline AI Tests"** tab
3. Browse available tests by subject, difficulty, or type
4. Use filters to find specific topics you want to practice

### 2. Test Features
- **Instant Loading**: No waiting for AI generation
- **High Quality**: All tests are pre-validated and curriculum-aligned
- **Variety**: Multiple subjects, difficulties, and question types
- **Offline Ready**: No internet connection needed during tests

### 3. Available Test Types
- **General Tests**: Comprehensive coverage of multiple topics
- **Subject-Specific**: Focus on Mathematics or English
- **Topic-Focused**: Geometry, Vocabulary, Grammar, etc.
- **Quick Practice**: Short 10-15 question sessions
- **Mixed Difficulty**: Adaptive challenge levels

## Current Test Library

### Mathematics Tests
- **General Mathematics** (45 min, 15 questions) - Mixed topics
- **Geometry Mastery** (35 min, 18 questions) - Shapes, angles, area

### English Tests
- **General English** (45 min, 25 questions) - Comprehensive skills
- **Vocabulary Challenge** (25 min, 20 questions) - Advanced vocabulary

### Quick Practice
- **Mixed Practice** (15 min, 10 questions) - Daily revision

## How to Create Your Own Tests

Want to add more tests to your collection? Follow these steps:

### Step 1: Choose Your AI Tool
- **ChatGPT** (OpenAI)
- **Gemini** (Google)
- **Claude** (Anthropic)
- Any other AI assistant

### Step 2: Use Our Prompts
1. Open the `AI_TEST_PROMPTS.md` file in the app folder
2. Copy the appropriate prompt for your desired test type
3. Paste it into your AI tool
4. Customize subjects, difficulty, or topics as needed

### Step 3: Generate and Save
1. The AI will create a JSON file with test questions
2. Save the file in `/src/data/ai-tests/` folder
3. Use the naming convention: `ai-{subject}-{type}-{number}.json`
4. Add the import to the service file (see technical instructions)

### Step 4: Example Generation
Here's what you might say to ChatGPT:
```
"Use the Math Test Generation Prompt to create a new algebra-focused test with 20 questions for Year 6 students. Make it slightly more challenging than the basic level."
```

## Benefits of Offline Tests

### ✅ **Always Available**
- No internet connection required during tests
- Instant access to practice questions
- No waiting for AI generation

### ✅ **Reduced Costs**
- No API charges for test generation
- Lower server load
- More sustainable practice sessions

### ✅ **Consistent Quality**
- All tests are pre-validated
- Curriculum-aligned content
- Proper difficulty progression

### ✅ **Customizable**
- Generate tests for specific topics
- Create difficulty variations
- Add your own question types

## Technical Details

### File Structure
```
src/
  data/
    ai-tests/
      ai-math-general-001.json
      ai-english-vocab-002.json
      ai-math-geometry-003.json
      [your new tests here]
```

### JSON Format
Each test file follows this structure:
```json
{
  "id": "ai-math-general-001",
  "title": "Test Title",
  "subject": "mathematics",
  "timeLimit": 45,
  "totalQuestions": 15,
  "difficulty": "mixed",
  "topics": ["topic1", "topic2"],
  "questions": [...]
}
```

## Troubleshooting

### Test Not Appearing?
1. Check the file is in the correct folder
2. Verify the JSON format is valid
3. Ensure the import is added to the service file
4. Restart the application

### JSON Format Errors?
1. Use a JSON validator tool
2. Check for missing commas or brackets
3. Ensure all strings are properly quoted
4. Verify the structure matches the examples

### Need Help?
- Check the `AI_TEST_PROMPTS.md` file for detailed instructions
- Look at existing test files for examples
- Use online JSON validators for troubleshooting

## Future Enhancements

We're working on:
- **Auto-detection** of new test files
- **Batch import** tools for multiple tests
- **Test builder** interface for non-technical users
- **Community sharing** of test files

---

**📚 Happy Learning!** The offline test system gives you unlimited practice opportunities while keeping costs low and performance high.
