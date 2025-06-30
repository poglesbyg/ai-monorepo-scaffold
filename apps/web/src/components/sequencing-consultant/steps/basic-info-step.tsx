import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import type { ConsultationData } from '../consultation-wizard'

interface BasicInfoStepProps {
  data: ConsultationData
  updateData: (data: Partial<ConsultationData>) => void
}

export function BasicInfoStep({ data, updateData }: BasicInfoStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="piName">Principal Investigator Name *</Label>
          <Input
            id="piName"
            value={data.piName}
            onChange={(e) => updateData({ piName: e.target.value })}
            placeholder="Dr. Jane Smith"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="jane.smith@university.edu"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution">Institution *</Label>
        <Input
          id="institution"
          value={data.institution}
          onChange={(e) => updateData({ institution: e.target.value })}
          placeholder="University of Science"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={data.department || ''}
            onChange={(e) => updateData({ department: e.target.value })}
            placeholder="Biology Department"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </div>
  )
} 