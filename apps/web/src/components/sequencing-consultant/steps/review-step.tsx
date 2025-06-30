import { Loader2, CheckCircle, Send } from 'lucide-react'

import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import type { ConsultationData } from '../consultation-wizard'

interface ReviewStepProps {
  data: ConsultationData
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export function ReviewStep({ data, onSubmit, isSubmitting }: ReviewStepProps) {
  const sections = [
    {
      title: 'Contact Information',
      items: [
        { label: 'Principal Investigator', value: data.piName },
        { label: 'Email', value: data.email },
        { label: 'Institution', value: data.institution },
        { label: 'Department', value: data.department || 'Not provided' },
        { label: 'Phone', value: data.phone || 'Not provided' }
      ]
    },
    {
      title: 'Project Details',
      items: [
        { label: 'Project Title', value: data.projectTitle },
        { label: 'Research Area', value: data.researchArea || 'Not specified' },
        { label: 'Project Description', value: data.projectDescription, multiline: true },
        { label: 'Objectives', value: data.objectives || 'Not specified', multiline: true }
      ]
    },
    {
      title: 'Sample Information',
      items: [
        { label: 'Sample Type', value: data.sampleType || 'Not specified' },
        { label: 'Organism', value: data.organism || 'Not specified' },
        { label: 'Number of Samples', value: data.numberOfSamples?.toString() || 'Not specified' },
        { label: 'Tissue Type', value: data.tissueType || 'Not specified' },
        { label: 'Treatment Groups', value: data.treatmentGroups?.join(', ') || 'Not specified' },
        { label: 'Control Groups', value: data.controlGroups?.join(', ') || 'Not specified' }
      ]
    },
    {
      title: 'Timeline & Budget',
      items: [
        { label: 'Timeline', value: data.timeline || 'Not specified' },
        { label: 'Budget Range', value: data.budgetRange || 'Not specified' },
        { label: 'Grant Funding', value: data.grantFundingStatus || 'Not provided' }
      ]
    }
  ]

  const recommendedServices = data.recommendedServices || []

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Review Your Consultation</h3>
        <p className="text-gray-600">
          Please review all the information before submitting. You can go back to any previous step to make changes.
        </p>
      </div>

      {/* Summary Sections */}
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.items.map((item) => (
              <div key={item.label} className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500">{item.label}:</span>
                <span className={`text-sm col-span-2 ${item.multiline ? 'whitespace-pre-wrap' : ''}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Recommended Services */}
      {recommendedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Recommended Services</CardTitle>
            <CardDescription>Based on your project requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedServices.map((service: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{service.serviceName}</p>
                  <p className="text-sm text-gray-600">{service.category}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={
                    service.priority === 'essential' ? 'destructive' :
                    service.priority === 'recommended' ? 'default' : 'secondary'
                  }>
                    {service.priority}
                  </Badge>
                  {service.estimatedCost && (
                    <Badge variant="outline">
                      ${service.estimatedCost.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>What happens next?</strong> When you submit this consultation, we&apos;ll:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-blue-700 list-disc list-inside">
            <li>Send you an email confirmation</li>
            <li>Review your requirements with our sequencing experts</li>
            <li>Contact you within 1-2 business days with a detailed quote</li>
            <li>Schedule a follow-up call to discuss your project</li>
          </ul>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting Consultation...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Consultation Request
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By submitting this form, you agree to be contacted by our sequencing facility team.
          Your information will be kept confidential and used only for consultation purposes.
        </p>
      </div>
    </div>
  )
} 