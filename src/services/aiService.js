import axios from 'axios';

class AIService {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        const saved = localStorage.getItem('aiConfig');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            provider: 'lmstudio',
            apiUrl: 'http://localhost:1234/v1',
            apiKey: '',
            model: 'local-model',
            temperature: 0.7,
            maxTokens: 1000
        };
    }

    saveConfig(config) {
        this.config = { ...this.config, ...config };
        localStorage.setItem('aiConfig', JSON.stringify(this.config));
    }

    getConfig() {
        return this.config;
    }

    async testConnection() {
        try {
            // Test with timeout and retry logic
            const response = await this.makeRequestWithRetry(
                'GET',
                `${this.config.apiUrl}/models`,
                null,
                { maxRetries: 2, timeout: 5000 }
            );

            return {
                success: true,
                data: response.data,
                message: 'Connection successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Connection failed',
                suggestion: this.getConnectionSuggestion(error)
            };
        }
    }

    async makeRequestWithRetry(method, url, data = null, options = {}) {
        const { maxRetries = 3, timeout = 30000 } = options;
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const config = {
                    method,
                    url,
                    headers: this.getHeaders(),
                    timeout,
                    ...(data && { data })
                };

                const response = await axios(config);
                return response;
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    // Wait before retry with exponential backoff
                    await this.sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }

        throw lastError;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getConnectionSuggestion(error) {
        if (error.code === 'ECONNREFUSED') {
            return 'Check if your AI service is running and the URL is correct';
        }
        if (error.response?.status === 401) {
            return 'Check your API key configuration';
        }
        if (error.response?.status === 404) {
            return 'Verify the API endpoint URL is correct';
        }
        if (error.code === 'ENOTFOUND') {
            return 'Check your internet connection and API URL';
        }
        return 'Try checking your AI service configuration in Settings';
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        return headers;
    }

    async sendMessage(message, context = null) {
        try {
            const systemPrompt = this.getSystemPrompt(context);
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ];

            const requestData = {
                model: this.config.model,
                messages: messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
                stream: false
            };

            const response = await this.makeRequestWithRetry(
                'POST',
                `${this.config.apiUrl}/chat/completions`,
                requestData,
                { maxRetries: 2, timeout: 30000 }
            );

            return {
                success: true,
                message: response.data.choices[0].message.content,
                usage: response.data.usage
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message || 'Failed to get response',
                suggestion: this.getConnectionSuggestion(error)
            };
        }
    }

    getSystemPrompt(context) {
        let prompt = `You are an AI tutor specializing in 11+ exam preparation. You help students aged 10-11 learn mathematics and English concepts.

Key guidelines:
- Be encouraging and supportive
- Explain concepts clearly with examples
- Use age-appropriate language
- Provide step-by-step solutions
- Ask questions to check understanding
- Suggest practice activities`;

        if (context) {
            prompt += `\n\nCurrent context:
- Subject: ${context.subject || 'Not specified'}
- Category: ${context.category || 'Not specified'}
- Concept: ${context.concept || 'Not specified'}`;

            if (context.studentProgress) {
                prompt += `\n- Student Progress: ${context.studentProgress}`;
            }
        }

        return prompt;
    }

    async explainConcept(concept, subject, category) {
        const message = `Please explain the concept of "${concept}" in ${subject} (${category}) for an 11+ student. Include:
1. A clear definition
2. Simple examples
3. Common mistakes to avoid
4. Practice tips`;

        return this.sendMessage(message, { subject, category, concept });
    }

    async helpWithQuestion(question, subject, category, concept) {
        const message = `A student is struggling with this ${subject} question about ${concept}:

"${question}"

Please provide step-by-step help without giving away the complete answer. Guide them to understand the solution.`;

        return this.sendMessage(message, { subject, category, concept });
    }

    async generatePracticeQuestion(subject, category, concept) {
        const message = `Generate a practice question for "${concept}" in ${subject} (${category}) suitable for 11+ students. Include:
1. The question
2. Multiple choice options (if applicable)
3. The correct answer
4. A brief explanation`;

        return this.sendMessage(message, { subject, category, concept });
    }
}

export default new AIService();
