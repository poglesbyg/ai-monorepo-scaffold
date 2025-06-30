import { motion } from 'framer-motion'
import { Bot, Send, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Input } from '../../ui/input'
import { ScrollArea } from '../../ui/scroll-area'
import type { ConsultationData } from '../consultation-wizard'

interface AIConsultationStepProps {
  data: ConsultationData
  updateData: (data: Partial<ConsultationData>) => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ServiceRecommendation {
  serviceCode: string
  serviceName: string
  category: string
  reason: string
  confidence: number
  estimatedCost?: number
  priority: 'essential' | 'recommended' | 'optional'
}

export function AIConsultationStep({ data, updateData }: AIConsultationStepProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([])

  // Initialize AI consultation when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      startConsultation()
    }
  }, [])

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

I have some initial recommendations based on your project details. Would you like me to explain any of these services in more detail, or do you have specific questions about your experimental design?`
    }

    setMessages([initialMessage])

    // Simulate AI generating recommendations
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockRecommendations: ServiceRecommendation[] = [
      {
        serviceCode: 'RNA_SEQ',
        serviceName: 'RNA Sequencing',
        category: 'RNA Sequencing',
        reason: 'Based on your project description, RNA-seq will provide comprehensive gene expression profiling for your samples.',
        confidence: 0.95,
        estimatedCost: data.numberOfSamples ? data.numberOfSamples * 450 : undefined,
        priority: 'essential'
      },
      {
        serviceCode: 'SINGLE_CELL_RNA',
        serviceName: 'Single Cell RNA-Seq',
        category: 'RNA Sequencing',
        reason: 'If you need cell-type-specific expression profiles, single-cell RNA-seq might be valuable for your research.',
        confidence: 0.70,
        estimatedCost: 2500,
        priority: 'optional'
      }
    ]

    setRecommendations(mockRecommendations)
    updateData({ recommendedServices: mockRecommendations })
    setIsLoading(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) {return}

    const userMessage: ChatMessage = {
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000))

    const aiResponse: ChatMessage = {
      role: 'assistant',
      content: `Thank you for your question. Based on your inquiry about "${input}", I can provide some additional insights...

[This is a simulated response. In a real implementation, this would connect to an AI service to provide detailed, context-aware responses about sequencing services, experimental design, and recommendations.]`
    }

    setMessages(prev => [...prev, aiResponse])
    setIsLoading(false)
  }

  const priorityColors = {
    essential: 'bg-red-100 text-red-800',
    recommended: 'bg-yellow-100 text-yellow-800',
    optional: 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-4">
      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recommended Services</h3>
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