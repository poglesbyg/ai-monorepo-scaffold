import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import type { ConsultationData } from '../consultation-wizard'

interface SampleInfoStepProps {
  data: ConsultationData
  updateData: (data: Partial<ConsultationData>) => void
}

const commonSampleTypes = [
  'Tissue',
  'Cell Line',
  'Blood',
  'Plasma',
  'Serum',
  'DNA',
  'RNA',
  'Protein',
  'Cell Suspension',
  'FFPE',
  'Other'
]

const commonOrganisms = [
  'Human',
  'Mouse',
  'Rat',
  'Zebrafish',
  'Drosophila',
  'C. elegans',
  'Yeast',
  'E. coli',
  'Arabidopsis',
  'Other'
]

export function SampleInfoStep({ data, updateData }: SampleInfoStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sampleType">Sample Type</Label>
          <Select
            value={data.sampleType || ''}
            onValueChange={(value) => updateData({ sampleType: value })}
          >
            <SelectTrigger id="sampleType">
              <SelectValue placeholder="Select sample type" />
            </SelectTrigger>
            <SelectContent>
              {commonSampleTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organism">Organism</Label>
          <Select
            value={data.organism || ''}
            onValueChange={(value) => updateData({ organism: value })}
          >
            <SelectTrigger id="organism">
              <SelectValue placeholder="Select organism" />
            </SelectTrigger>
            <SelectContent>
              {commonOrganisms.map(org => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="numberOfSamples">Number of Samples</Label>
          <Input
            id="numberOfSamples"
            type="number"
            value={data.numberOfSamples || ''}
            onChange={(e) => updateData({ numberOfSamples: Number.parseInt(e.target.value) || undefined })}
            placeholder="e.g., 24"
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tissueType">Tissue Type (if applicable)</Label>
          <Input
            id="tissueType"
            value={data.tissueType || ''}
            onChange={(e) => updateData({ tissueType: e.target.value })}
            placeholder="e.g., Liver, Brain, Tumor"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatmentGroups">Treatment Groups</Label>
        <Input
          id="treatmentGroups"
          value={data.treatmentGroups?.join(', ') || ''}
          onChange={(e) => updateData({ 
            treatmentGroups: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
          })}
          placeholder="e.g., Control, Drug A, Drug B (comma-separated)"
        />
        <p className="text-sm text-muted-foreground">
          List your experimental groups separated by commas
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="controlGroups">Control Groups</Label>
        <Input
          id="controlGroups"
          value={data.controlGroups?.join(', ') || ''}
          onChange={(e) => updateData({ 
            controlGroups: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
          })}
          placeholder="e.g., Untreated, Vehicle control (comma-separated)"
        />
      </div>
    </div>
  )
} 