#!/usr/bin/env node

/**
 * Test script for Ollama integration
 * Run with: node test-ollama-integration.js
 */

async function testOllama() {
  console.log('🧪 Testing Ollama Integration for Sequencing Consultant\n');

  try {
    // Test basic connectivity
    console.log('1️⃣ Testing Ollama connectivity...');
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      console.log('✅ Ollama is running\n');
    } else {
      throw new Error('Ollama not responding');
    }

    // Test model availability
    console.log('2️⃣ Checking available models...');
    const models = await response.json();
    const modelNames = models.models.map(m => m.name);
    console.log('Available models:', modelNames);
    
    const hasLlama = modelNames.some(name => name.includes('llama3'));
    if (hasLlama) {
      console.log('✅ Llama model found\n');
    } else {
      console.log('⚠️  Llama model not found, run: ollama pull llama3.1:latest\n');
    }

    // Test a sequencing-specific query
    console.log('3️⃣ Testing sequencing consultation query...');
    const modelToUse = modelNames.find(n => n.includes('llama')) || 'llama3.1:latest';
    console.log(`Using model: ${modelToUse}`);
    
    const testQuery = {
      model: modelToUse,
      prompt: `As a sequencing facility consultant, briefly recommend services for this project:
      - Project: Gene expression analysis in cancer cells
      - Organism: Human
      - Samples: 20 tumor samples and 20 matched normal samples
      - Budget: $10,000-50,000
      
      Provide a brief recommendation (2-3 sentences).`,
      stream: false,
      options: {
        temperature: 0.7
      }
    };

    const aiResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testQuery)
    });

    if (aiResponse.ok) {
      const result = await aiResponse.json();
      console.log('✅ AI Response received:\n');
      console.log('---');
      console.log(result.response);
      console.log('---\n');
    } else {
      throw new Error('Failed to get AI response');
    }

    console.log('🎉 All tests passed! Ollama integration is working correctly.');
    console.log('\nYou can now use the AI consultation features in the web application.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure Ollama is running (check if the app is open on macOS)');
    console.log('2. Run: ollama serve (on Linux/WSL)');
    console.log('3. Install a model: ollama pull llama3.1:latest');
    console.log('4. Check logs: ollama logs');
    process.exit(1);
  }
}

// Run the test
testOllama(); 