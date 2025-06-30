import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'
import type { ConsultationData } from '../consultation-wizard'

interface BudgetTimelineStepProps {
  data: ConsultationData
  updateData: (data: Partial<ConsultationData>) => void
}

const timelineOptions = [
  { value: 'immediate', label: 'Immediate (ASAP)' },
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6+ months', label: '6+ months' }
]

const budgetOptions = [
  { value: '<10k', label: 'Less than $10,000' },
  { value: '10-50k', label: '$10,000 - $50,000' },
  { value: '50-100k', label: '$50,000 - $100,000' },
  { value: '100k+', label: 'More than $100,000' }
]

export function BudgetTimelineStep({ data, updateData }: BudgetTimelineStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Project Timeline</Label>
        <RadioGroup
          value={data.timeline || ''}
          onValueChange={(value) => updateData({ timeline: value as ConsultationData['timeline'] })}
        >
          {timelineOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Budget Range</Label>
        <RadioGroup
          value={data.budgetRange || ''}
          onValueChange={(value) => updateData({ budgetRange: value as ConsultationData['budgetRange'] })}
        >
          {budgetOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`budget-${option.value}`} />
              <Label htmlFor={`budget-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="grantFundingStatus">Grant Funding Status</Label>
        <Input
          id="grantFundingStatus"
          value={data.grantFundingStatus || ''}
          onChange={(e) => updateData({ grantFundingStatus: e.target.value })}
          placeholder="e.g., NIH R01 awarded, NSF pending, Internal funding secured"
        />
        <p className="text-sm text-muted-foreground">
          Let us know about any grants or funding sources for this project
        </p>
      </div>
    </div>
  )
} 