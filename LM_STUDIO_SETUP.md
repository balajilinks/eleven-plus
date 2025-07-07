# LM Studio Setup Guide for Eleven Plus App

## What is LM Studio?
LM Studio is a desktop application that lets you run AI models locally on your computer. This ensures privacy and works offline.

## Installation Steps

### 1. Download LM Studio
1. Go to https://lmstudio.ai/
2. Download the version for your operating system
3. Install the application

### 2. Download an AI Model
1. Open LM Studio
2. Go to the "Discover" tab
3. Search for educational/instruction models (recommended):
   - **"microsoft/DialoGPT-medium"** - Good for conversations
   - **"microsoft/DialoGPT-large"** - Better quality, needs more RAM
   - **"huggingface/CodeBERTa-small-v1"** - Good for structured content
   - **"google/flan-t5-base"** - Excellent for Q&A generation

4. Click "Download" for your chosen model
5. Wait for the download to complete

### 3. Start the Local Server
1. In LM Studio, go to "Local Server" tab
2. Select your downloaded model
3. Click "Start Server"
4. Note the server address (usually `http://localhost:1234`)
5. Keep LM Studio running while using the app

## Configuration in Eleven Plus App

### 1. Open App Settings
1. Start the Eleven Plus App
2. Click the Settings icon (⚙️)
3. Go to "AI Configuration"

### 2. Configure LM Studio
1. **Provider**: Select "LM Studio"
2. **API URL**: Enter `http://localhost:1234/v1`
3. **API Key**: Leave empty (not needed for local)
4. **Model**: Enter the model name or "local-model"
5. **Temperature**: Set to 0.7 (good balance)
6. **Max Tokens**: Set to 1000-2000

### 3. Test Connection
1. Click "Test Connection"
2. You should see "Connection successful"
3. If not, check that LM Studio server is running

## Usage Tips

### 📚 For Test Generation:
- **Temperature 0.3-0.5**: More consistent, structured questions
- **Temperature 0.7-0.9**: More creative, varied questions
- **Max Tokens 1000-2000**: Good for full test generation
- **Max Tokens 500-1000**: For quick questions

### 🔧 Performance Tips:
- **Close other applications** to free up RAM
- **Use SSD storage** for faster model loading
- **16GB+ RAM recommended** for larger models
- **GPU acceleration** available for compatible cards

### 🎯 Model Selection:
- **Smaller models** (< 1GB): Faster but less capable
- **Medium models** (1-5GB): Good balance of speed and quality
- **Large models** (5GB+): Best quality but slower

## Troubleshooting

### Common Issues:

#### "Connection failed"
- Check LM Studio is running
- Verify server is started in LM Studio
- Check the URL (should be `http://localhost:1234/v1`)
- Try restarting LM Studio

#### "Model not responding"
- Check if model is loaded in LM Studio
- Try a different model
- Restart LM Studio
- Check available system memory

#### "Poor quality questions"
- Try adjusting temperature (0.3-0.8)
- Use a larger, more capable model
- Ensure model is suitable for educational content
- Check max tokens setting (should be 1000+)

#### "Slow response"
- Close other applications
- Use a smaller model
- Check system resources
- Consider hardware upgrade

## Alternative Local AI Options

### Ollama (Advanced Users)
1. Install Ollama from https://ollama.com/
2. Download models with: `ollama pull llama2`
3. Start with: `ollama serve`
4. Use URL: `http://localhost:11434/v1`

### GPT4All (Simple Interface)
1. Download from https://gpt4all.io/
2. Install and select a model
3. Enable API server in settings
4. Use the provided URL

## Hardware Requirements

### Minimum:
- **CPU**: Intel i5 or AMD equivalent
- **RAM**: 8GB
- **Storage**: 5GB free space
- **OS**: Windows 10/11, macOS 10.15+, Linux

### Recommended:
- **CPU**: Intel i7 or AMD equivalent
- **RAM**: 16GB or more
- **Storage**: 10GB+ free space (SSD preferred)
- **GPU**: Optional but helpful for acceleration

## Privacy Benefits

### Why Use Local AI:
- ✅ **Complete Privacy**: No data sent to external servers
- ✅ **Offline Capability**: Works without internet
- ✅ **No API Costs**: Free after initial setup
- ✅ **Full Control**: Choose your own models
- ✅ **No Rate Limits**: Generate as many tests as needed

### Data Security:
- All test generation happens locally
- No student data leaves your computer
- No account registration required
- No usage tracking

## Support

### Getting Help:
- Check LM Studio documentation
- Review model compatibility
- Test with different models
- Verify system requirements

### Updates:
- Keep LM Studio updated
- Try new models regularly
- Check for app updates
- Monitor performance improvements

---

**Enjoy Private, Local AI Test Generation!** 🚀

With LM Studio, you have a powerful, private AI assistant for creating personalized 11+ practice tests right on your computer.
