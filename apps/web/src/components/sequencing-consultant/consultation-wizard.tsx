'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  FileText,
  FlaskConical,
  DollarSign,
  MessageSquare,
  FileCheck
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'

import { AIConsultationStep } from './steps/ai-consultation-step'
import { BasicInfoStep } from './steps/basic-info-step'
import { BudgetTimelineStep } from './steps/budget-timeline-step'
import { ProjectDetailsStep } from './steps/project-details-step'
import { ReviewStep } from './steps/review-step'
import { SampleInfoStep } from './steps/sample-info-step'

export interface ConsultationData {
  // Basic Info
  piName: string
  institution: string
  email: string
  phone?: string
  department?: string
  
  // Project Details
  projectTitle: string
  projectDescription: string
  researchArea?: string
  objectives?: string
  
  // Sample Info
  sampleType?: string
  organism?: string
  numberOfSamples?: number
  tissueType?: string
  treatmentGroups?: string[]
  controlGroups?: string[]
  
  // Budget & Timeline
  timeline?: 'immediate' | '1-3 months' | '3-6 months' | '6+ months'
  budgetRange?: '<10k' | '10-50k' | '50-100k' | '100k+'
  grantFundingStatus?: string
  
  // AI Recommendations
  recommendedServices?: any[]
  chatHistory?: any[]
}

const steps = [
  { id: 'basic-info', title: 'Basic Information', icon: User },
  { id: 'project-details', title: 'Project Details', icon: FileText },
  { id: 'sample-info', title: 'Sample Information', icon: FlaskConical },
  { id: 'budget-timeline', title: 'Budget & Timeline', icon: DollarSign },
  { id: 'ai-consultation', title: 'AI Consultation', icon: MessageSquare },
  { id: 'review', title: 'Review & Submit', icon: FileCheck }
]

export function ConsultationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    piName: '',
    institution: '',
    email: '',
    projectTitle: '',
    projectDescription: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateData = (newData: Partial<ConsultationData>) => {
    setConsultationData(prev => ({ ...prev, ...newData }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Format the consultation data for Formspree
      const formData = {
        // Basic Info
        name: consultationData.piName,
        email: consultationData.email,
        institution: consultationData.institution,
        phone: consultationData.phone || 'Not provided',
        department: consultationData.department || 'Not provided',
        
        // Project Details
        projectTitle: consultationData.projectTitle,
        projectDescription: consultationData.projectDescription,
        researchArea: consultationData.researchArea || 'Not specified',
        objectives: consultationData.objectives || 'Not provided',
        
        // Sample Info
        sampleType: consultationData.sampleType || 'Not specified',
        organism: consultationData.organism || 'Not specified',
        numberOfSamples: consultationData.numberOfSamples || 'Not specified',
        tissueType: consultationData.tissueType || 'Not specified',
        treatmentGroups: consultationData.treatmentGroups?.join(', ') || 'None',
        controlGroups: consultationData.controlGroups?.join(', ') || 'None',
        
        // Budget & Timeline
        timeline: consultationData.timeline || 'Not specified',
        budgetRange: consultationData.budgetRange || 'Not specified',
        grantFundingStatus: consultationData.grantFundingStatus || 'Not provided',
        
        // AI Recommendations (formatted as a summary)
        recommendedServices: consultationData.recommendedServices?.map((service: any) => 
          `${service.serviceName} (${service.priority})`
        ).join('; ') || 'No recommendations generated',
        
        // Include a formatted summary
        _subject: `New Sequencing Consultation: ${consultationData.projectTitle}`,
        _replyto: consultationData.email,
        _template: 'consultation'
      }

      // Get Formspree endpoint from environment variable or use default
      // @ts-expect-error - import.meta.env is available in Astro
      const formspreeEndpoint = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT || 'https://formspree.io/f/YOUR_FORM_ID'
      
      // Submit to Formspree
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.ok || result.success) {
        // Success! Redirect to thank you page
        window.location.href = '/thank-you'
      } else {
        throw new Error('Submission failed')
      }
      
    } catch (error) {
      console.error('Error submitting consultation:', error)
      alert('There was an error submitting your consultation. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep data={consultationData} updateData={updateData} />
      case 1:
        return <ProjectDetailsStep data={consultationData} updateData={updateData} />
      case 2:
        return <SampleInfoStep data={consultationData} updateData={updateData} />
      case 3:
        return <BudgetTimelineStep data={consultationData} updateData={updateData} />
      case 4:
        return <AIConsultationStep data={consultationData} updateData={updateData} />
      case 5:
        return <ReviewStep data={consultationData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sequencing Service Consultation
          </h1>
          <p className="mt-2 text-gray-600">
            Let&apos;s help you find the right sequencing services for your research
          </p>
        </motion.div>

        {/* Progress */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center flex-1"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted
                          ? '#10b981'
                          : isActive
                          ? '#3b82f6'
                          : '#e5e7eb'
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isActive || isCompleted ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <span
                      className={`text-xs text-center ${
                        isActive
                          ? 'text-blue-600 font-semibold'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = steps[currentStep].icon
                return <Icon className="w-6 h-6 text-blue-600" />
              })()}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 0 && "Let's start with some basic information about you and your institution"}
              {currentStep === 1 && "Tell us about your research project and objectives"}
              {currentStep === 2 && "Provide details about your samples and experimental design"}
              {currentStep === 3 && "Help us understand your timeline and budget constraints"}
              {currentStep === 4 && "Our AI will analyze your needs and recommend services"}
              {currentStep === 5 && "Review your consultation summary and submit"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
} 