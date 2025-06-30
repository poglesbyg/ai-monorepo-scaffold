import { motion } from 'framer-motion'
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Input } from '../../ui/input'
import { ScrollArea } from '../../ui/scroll-area'
import type { ConsultationData } from '../consultation-wizard'
import { aiService, type SequencingRecommendation } from '../../../lib/ai/ollama-service'

interface AIConsultationStepProps {
  data: ConsultationData
  updateData: (data: Partial<ConsultationData>) => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function AIConsultationStep({ data, updateData }: AIConsultationStepProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<SequencingRecommendation[]>([])
  const [aiAvailable, setAiAvailable] = useState(true)

  // Initialize AI consultation when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      checkAIAvailability()
      startConsultation()
    }
  }, [])

  const checkAIAvailability = async () => {
    const available = await aiService.initialize()
    setAiAvailable(available)
  }

  const startConsultation = async () => {
    setIsLoading(true)
    
    // Initial AI message
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm your sequencing consultation AI assistant. Based on the information you've provided, I'll help you identify the most suitable sequencing services for your research project.

Let me analyze your project:
- Project: ${data.projectTitle}
- Research Area: ${data.researchArea || 'Not specified'}
- Organism: ${data.organism || 'Not specified'}
- Sample Type: ${data.sampleType || 'Not specified'}
- Number of Samples: ${data.numberOfSamples || 'Not specified'}
- Timeline: ${data.timeline || 'Not specified'}
- Budget: ${data.budgetRange || 'Not specified'}

I'm now analyzing your project requirements to provide personalized recommendations...`
    }

    setMessages([initialMessage])

    try {
      // Get AI recommendations
      const aiRecommendations = await aiService.generateSequencingRecommendations(data)
      
      setRecommendations(aiRecommendations)
      updateData({ recommendedServices: aiRecommendations })

      // Add follow-up message
      const followUpMessage: ChatMessage = {
        role: 'assistant',
        content: `Based on my analysis, I've identified ${aiRecommendations.length} sequencing services that would be suitable for your project. 

The recommendations are sorted by priority and confidence level. Each service includes an estimated cost based on your sample size${data.numberOfSamples && data.numberOfSamples >= 20 ? ' (with volume discount applied)' : ''}.

Do you have any questions about these recommendations? I can explain:
- Why each service was recommended
- Sample preparation requirements
- Expected timelines and deliverables
- Cost optimization strategies
- Alternative approaches

Feel free to ask me anything about your sequencing project!`
      }

      setMessages(prev => [...prev, followUpMessage])
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I encountered an issue while analyzing your project. However, I can still provide recommendations based on your project details. Please feel free to ask any questions about sequencing services.'
      }
      
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get AI response
      const aiResponse = await aiService.answerSequencingQuestion(input, data)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your question. Please try rephrasing it, or feel free to contact our technical support team directly for assistance.'
      }
      
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const priorityColors = {
    essential: 'bg-red-100 text-red-800',
    recommended: 'bg-yellow-100 text-yellow-800',
    optional: 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-4">
      {/* AI Status */}
      {!aiAvailable && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              AI Running in Fallback Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800">
              Ollama AI is not currently available. Recommendations are being generated using advanced pattern matching algorithms. 
              For enhanced AI capabilities, ensure Ollama is running locally.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recommended Sequencing Services</h3>
        {recommendations.length === 0 && isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Analyzing your project requirements...</span>
            </CardContent>
          </Card>
        )}
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.serviceCode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{rec.serviceName}</CardTitle>
                    <CardDescription className="text-sm">{rec.category}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={priorityColors[rec.priority]}>
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(rec.confidence * 100)}% match
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                {rec.estimatedCost && (
                  <p className="text-sm font-medium">
                    Estimated cost: ${rec.estimatedCost.toLocaleString()}
                    {data.numberOfSamples && data.numberOfSamples >= 20 && (
                      <span className="text-green-600 ml-1">(volume discount applied)</span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Consultation Chat
          </CardTitle>
          <CardDescription>
            Ask questions about the recommendations or your experimental design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about sequencing services, sample prep, or analysis..."
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 