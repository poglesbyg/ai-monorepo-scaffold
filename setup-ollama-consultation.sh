#!/bin/bash

echo "🧬 Sequencing Consultation AI Setup Script"
echo "=========================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Ollama is running
check_ollama_running() {
    curl -s http://localhost:11434/api/tags >/dev/null 2>&1
}

# Check if Ollama is installed
if ! command_exists ollama; then
    echo "❌ Ollama is not installed."
    echo ""
    echo "Please install Ollama from: https://ollama.ai"
    echo ""
    echo "Installation instructions:"
    echo "  macOS/Linux: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "  Windows: Download from https://ollama.ai/download"
    echo ""
    exit 1
fi

echo "✅ Ollama is installed"

# Check if Ollama is running
if ! check_ollama_running; then
    echo "🔄 Starting Ollama service..."
    
    # Try to start Ollama in the background
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a Ollama
        echo "⏳ Waiting for Ollama to start (macOS app)..."
    else
        # Linux/WSL
        ollama serve > /dev/null 2>&1 &
        echo "⏳ Waiting for Ollama to start..."
    fi
    
    # Wait for Ollama to be ready
    for i in {1..30}; do
        if check_ollama_running; then
            echo "✅ Ollama is now running"
            break
        fi
        sleep 2
    done
    
    if ! check_ollama_running; then
        echo "❌ Failed to start Ollama automatically"
        echo "Please start Ollama manually and run this script again"
        exit 1
    fi
else
    echo "✅ Ollama is already running"
fi

# Check available models
echo ""
echo "📋 Checking available models..."
MODELS=$(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}')

# Check if llama3.1 is already installed
if echo "$MODELS" | grep -q "llama3.1"; then
    echo "✅ Llama 3.1 model is already installed"
else
    echo "📥 Downloading Llama 3.1 model for sequencing consultation..."
    echo "This may take a few minutes depending on your internet connection..."
    echo ""
    
    # Pull the model
    if ollama pull llama3.1:latest; then
        echo "✅ Llama 3.1 model successfully installed"
    else
        echo "⚠️  Failed to download llama3.1:latest, trying llama3..."
        if ollama pull llama3:latest; then
            echo "✅ Llama 3 model successfully installed (fallback)"
        else
            echo "❌ Failed to download AI model"
            echo "Please check your internet connection and try again"
            exit 1
        fi
    fi
fi

# Test the model
echo ""
echo "🧪 Testing AI model for sequencing consultation..."
TEST_RESPONSE=$(ollama run llama3.1:latest "Say 'Sequencing consultation AI ready!' and nothing else" 2>/dev/null || ollama run llama3:latest "Say 'Sequencing consultation AI ready!' and nothing else" 2>/dev/null)

if [[ $TEST_RESPONSE == *"ready"* ]]; then
    echo "✅ AI model test successful"
else
    echo "⚠️  AI model test returned unexpected response"
    echo "The model should still work for consultations"
fi

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "The Sequencing Consultation AI is now ready to use."
echo ""
echo "When you run the web application:"
echo "1. Navigate to the consultation form"
echo "2. Fill in your project details"
echo "3. The AI will analyze your needs and recommend appropriate sequencing services"
echo "4. You can chat with the AI to ask specific questions about:"
echo "   - Sample preparation requirements"
echo "   - Cost optimization strategies"
echo "   - Timeline expectations"
echo "   - Data analysis options"
echo ""
echo "Note: Keep this terminal open or ensure Ollama is running in the background"
echo "      while using the AI consultation features."
echo ""
echo "Happy sequencing! 🧬✨" 