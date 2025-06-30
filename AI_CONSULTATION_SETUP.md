# AI Consultation Setup for Sequencing Facility

This guide will help you set up the AI-powered consultation feature for the Sequencing Facility consultant application.

## Overview

The AI consultation feature uses Ollama with Llama 3.1 to provide intelligent recommendations for sequencing services based on research project requirements. The AI can:

- Analyze project descriptions and recommend appropriate sequencing services
- Answer questions about sample preparation, costs, and timelines
- Provide personalized guidance based on specific research needs
- Offer cost optimization strategies and experimental design advice

## Quick Setup

Run the automated setup script:

```bash
./setup-ollama-consultation.sh
```

This script will:
1. Check if Ollama is installed
2. Start the Ollama service
3. Download the Llama 3.1 model
4. Test the installation

## Manual Setup

If you prefer to set up manually:

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [https://ollama.ai/download](https://ollama.ai/download)

### 2. Start Ollama

**macOS:**
- Open Ollama from Applications
- Or run: `open -a Ollama`

**Linux/WSL:**
```bash
ollama serve
```

### 3. Download the AI Model

```bash
ollama pull llama3.1:latest
```

If that fails, try:
```bash
ollama pull llama3:latest
```

### 4. Verify Installation

```bash
ollama list
```

You should see `llama3.1:latest` or `llama3:latest` in the list.

## Using the AI Consultation

1. **Start your application:**
   ```bash
   cd apps/web && pnpm dev
   ```

2. **Navigate to the consultation form:**
   - Go to http://localhost:3001/consultation
   - Fill in your project details through the multi-step form

3. **AI Analysis:**
   - In Step 5 (AI Consultation), the AI will analyze your project
   - You'll receive personalized sequencing service recommendations
   - Each recommendation includes:
     - Service name and category
     - Confidence score and priority level
     - Detailed reasoning
     - Estimated costs (with volume discounts)

4. **Interactive Chat:**
   - Ask follow-up questions about:
     - Sample preparation requirements
     - Quality control standards
     - Timeline expectations
     - Cost optimization
     - Alternative approaches
     - Data analysis options

## Example Questions to Ask the AI

- "What are the sample preparation requirements for RNA-seq?"
- "How can I optimize costs for my 50 samples?"
- "What's the typical timeline for whole genome sequencing?"
- "Do you offer bioinformatics support for the data analysis?"
- "What's the difference between short-read and long-read sequencing for my project?"
- "Can you explain why ChIP-seq was recommended for my transcription factor study?"

## Fallback Mode

If Ollama is not available, the application will automatically use an intelligent fallback system that:
- Analyzes project keywords and requirements
- Provides rule-based recommendations
- Offers contextual answers to common questions
- Still delivers valuable guidance (though less sophisticated than AI mode)

## Troubleshooting

### Ollama not found
```bash
# Check if Ollama is in PATH
which ollama

# If not found, add to PATH or reinstall
```

### Model download fails
```bash
# Check available models
ollama list

# Try alternative model
ollama pull llama2:latest
```

### Port conflict (11434)
```bash
# Check what's using the port
lsof -i :11434

# Set custom port
OLLAMA_HOST=127.0.0.1:11435 ollama serve
```

### AI not responding
1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Restart Ollama service
3. Check browser console for errors
4. Verify model is loaded: `ollama list`

## Performance Tips

- **First request is slow:** The model needs to load into memory (30-60 seconds)
- **Keep Ollama running:** Subsequent requests are much faster
- **Memory usage:** Llama 3.1 requires ~4-8GB RAM
- **GPU acceleration:** If available, Ollama will use GPU for faster responses

## Privacy & Security

- All AI processing happens locally on your machine
- No data is sent to external AI services
- Project information remains confidential
- Consultation data is only stored in your local database

## Advanced Configuration

### Using Different Models

Edit `apps/web/src/lib/ai/ollama-service.ts`:

```typescript
private model = 'llama3.1:latest' // Change to your preferred model
```

### Adjusting AI Behavior

Modify temperature and top_p values for different response styles:
- Lower temperature (0.3-0.5): More focused, deterministic responses
- Higher temperature (0.7-0.9): More creative, varied responses

### Custom Prompts

The AI prompts are defined in the Ollama service and can be customized for:
- Different types of sequencing facilities
- Specific organism focus
- Regulatory compliance requirements
- Institution-specific services

## Support

For issues specific to:
- **Ollama installation:** Visit [ollama.ai/docs](https://ollama.ai/docs)
- **Application bugs:** Check the project's issue tracker
- **AI responses:** Adjust prompts in `ollama-service.ts`

Happy consulting! 🧬🤖 