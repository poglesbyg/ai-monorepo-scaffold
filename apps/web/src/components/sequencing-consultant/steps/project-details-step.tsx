import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import type { ConsultationData } from '../consultation-wizard'

interface ProjectDetailsStepProps {
  data: ConsultationData
  updateData: (data: Partial<ConsultationData>) => void
}

export function ProjectDetailsStep({ data, updateData }: ProjectDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectTitle">Project Title *</Label>
        <Input
          id="projectTitle"
          value={data.projectTitle}
          onChange={(e) => updateData({ projectTitle: e.target.value })}
          placeholder="e.g., Transcriptomic analysis of drug response in cancer cells"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectDescription">Project Description *</Label>
        <Textarea
          id="projectDescription"
          value={data.projectDescription}
          onChange={(e) => updateData({ projectDescription: e.target.value })}
          placeholder="Describe your research project, including background, hypothesis, and expected outcomes..."
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="researchArea">Research Area</Label>
        <Input
          id="researchArea"
          value={data.researchArea || ''}
          onChange={(e) => updateData({ researchArea: e.target.value })}
          placeholder="e.g., Cancer Biology, Neuroscience, Plant Genomics"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="objectives">Specific Objectives</Label>
        <Textarea
          id="objectives"
          value={data.objectives || ''}
          onChange={(e) => updateData({ objectives: e.target.value })}
          placeholder="List your main research objectives or questions..."
          rows={4}
        />
      </div>
    </div>
  )
} 