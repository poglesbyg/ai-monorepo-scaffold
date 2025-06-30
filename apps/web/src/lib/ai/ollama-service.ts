import { Ollama } from 'ollama'

// Initialize Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' })

export interface AIAnalysisResult {
  analysis: string
  suggestions: string[]
  confidence: number
  reasoning: string
}

export interface GuideOptimizationResult {
  optimizedSequence?: string
  improvements: string[]
  riskAssessment: string
  confidence: number
}

export interface ExperimentSuggestion {
  title: string
  description: string
  rationale: string
  priority: 'high' | 'medium' | 'low'
}

export interface SequencingRecommendation {
  serviceCode: string
  serviceName: string
  category: string
  reason: string
  confidence: number
  estimatedCost?: number
  priority: 'essential' | 'recommended' | 'optional'
}

class OllamaService {
  private model = 'llama3.1:latest' // Default model, can be configured
  private isAvailable = false
  private workingModel: string | null = null

  async initialize() {
    try {
      // Check if Ollama is running and model is available
      const models = await ollama.list()
      this.isAvailable = models.models.some(m => m.name === this.model || m.name.includes(this.model.split(':')[0]))
      
      if (!this.isAvailable) {
        // Try different model names that might work
        const modelVariants = [
          'llama3.1:latest',
          'llama3.1:8b', 
          'llama3.1',
          'llama3:latest',
          'llama3:8b',
          'llama3'
        ]
        
        console.log('🔍 Testing model variants...')
        
        for (const modelName of modelVariants) {
          try {
            console.log(`Testing ${modelName}...`)
            const testResponse = await ollama.generate({
              model: modelName,
              prompt: "Test",
              stream: false,
              options: { temperature: 0.1 }
            })
            
            if (testResponse.response) {
              this.workingModel = modelName
              this.model = modelName
              this.isAvailable = true
              console.log(`✅ Ollama AI service initialized with model: ${modelName} (found working model)`)
              return true
            }
          } catch (_testError) {
            console.log(`❌ ${modelName} failed`)
          }
        }
        
        console.warn(`Ollama models not accessible. AI features will use advanced fallback responses.`)
        console.log('Available models via API:', models.models.map(m => m.name))
        console.log('💡 Tip: Try running "ollama run llama3.1" in terminal to ensure model is loaded')
      } else {
        this.workingModel = this.model
        console.log(`✅ Ollama AI service initialized with model: ${this.model}`)
      }
      
      return this.isAvailable
    } catch (error) {
      console.warn('Ollama not available:', error)
      this.isAvailable = false
      return false
    }
  }

  async analyzeSequence(sequence: string, context?: string): Promise<AIAnalysisResult> {
    if (!this.isAvailable) {
      return this.getFallbackSequenceAnalysis(sequence)
    }

    try {
      const prompt = `
As a CRISPR expert, analyze this DNA sequence for guide RNA design:

Sequence: ${sequence}
Length: ${sequence.length} bp
${context ? `Context: ${context}` : ''}

Please provide:
1. Overall assessment of the sequence for CRISPR targeting
2. Potential challenges or concerns
3. Specific suggestions for guide RNA design
4. Risk factors to consider

Respond in JSON format with: analysis, suggestions (array), confidence (0-1), reasoning
`

      const response = await ollama.generate({
        model: this.workingModel || this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      })

      return this.parseAIResponse(response.response, 'sequence_analysis')
    } catch (error) {
      console.error('AI sequence analysis failed:', error)
      return this.getFallbackSequenceAnalysis(sequence)
    }
  }

  async optimizeGuideRNA(
    guideSequence: string, 
    targetSequence: string, 
    pamSequence: string
  ): Promise<GuideOptimizationResult> {
    if (!this.isAvailable) {
      return this.getFallbackGuideOptimization(guideSequence)
    }

    try {
      const prompt = `
As a CRISPR guide RNA optimization expert, analyze and suggest improvements for this guide:

Guide RNA: ${guideSequence}
PAM: ${pamSequence}
Target context: ${targetSequence.slice(Math.max(0, targetSequence.indexOf(guideSequence) - 50), targetSequence.indexOf(guideSequence) + guideSequence.length + 50)}

Analyze:
1. GC content and distribution
2. Secondary structure potential
3. Off-target risk factors
4. Efficiency predictors
5. Possible sequence modifications

Provide specific suggestions for improvement and risk assessment.
Respond in JSON format with: optimizedSequence, improvements (array), riskAssessment, confidence (0-1)
`

      const response = await ollama.generate({
        model: this.workingModel || this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.6,
          top_p: 0.8,
        }
      })

      return this.parseGuideOptimization(response.response)
    } catch (error) {
      console.error('AI guide optimization failed:', error)
      return this.getFallbackGuideOptimization(guideSequence)
    }
  }

  async generateExperimentSuggestions(
    experimentType: string,
    targetGene?: string,
    organism?: string
  ): Promise<ExperimentSuggestion[]> {
    if (!this.isAvailable) {
      return this.getFallbackExperimentSuggestions(experimentType)
    }

    try {
      const prompt = `
As a CRISPR experimental design expert, suggest innovative experiments for:

Type: ${experimentType}
${targetGene ? `Target Gene: ${targetGene}` : ''}
${organism ? `Organism: ${organism}` : ''}

Provide 3-5 creative and scientifically sound experiment ideas that would:
1. Advance the field
2. Be technically feasible
3. Address important biological questions
4. Consider current best practices

For each suggestion, include title, description, rationale, and priority level.
Respond in JSON format as an array of objects with: title, description, rationale, priority
`

      const response = await ollama.generate({
        model: this.workingModel || this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
        }
      })

      return this.parseExperimentSuggestions(response.response)
    } catch (error) {
      console.error('AI experiment suggestions failed:', error)
      return this.getFallbackExperimentSuggestions(experimentType)
    }
  }

  async answerQuestion(question: string, context?: any): Promise<string> {
    if (!this.isAvailable) {
      return this.getFallbackAnswer(question)
    }

    try {
      const contextStr = context ? JSON.stringify(context, null, 2) : ''
      const prompt = `
As a CRISPR expert assistant, answer this question:

Question: ${question}

${contextStr ? `Context: ${contextStr}` : ''}

Provide a clear, accurate, and helpful answer based on current CRISPR knowledge and best practices.
Be specific and actionable when possible.
`

      const response = await ollama.generate({
        model: this.workingModel || this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      })

      return response.response
    } catch (error) {
      console.error('AI question answering failed:', error)
      return this.getFallbackAnswer(question)
    }
  }

  async generateSequencingRecommendations(consultationData: any): Promise<SequencingRecommendation[]> {
    if (!this.isAvailable) {
      return this.getFallbackSequencingRecommendations(consultationData)
    }

    try {
      const prompt = `
As a high-throughput sequencing facility consultant, analyze this research project and recommend appropriate sequencing services:

Project Details:
- Title: ${consultationData.projectTitle}
- Description: ${consultationData.projectDescription}
- Research Area: ${consultationData.researchArea || 'Not specified'}
- Objectives: ${consultationData.objectives || 'Not specified'}
- Organism: ${consultationData.organism || 'Not specified'}
- Sample Type: ${consultationData.sampleType || 'Not specified'}
- Number of Samples: ${consultationData.numberOfSamples || 'Not specified'}
- Timeline: ${consultationData.timeline || 'Not specified'}
- Budget Range: ${consultationData.budgetRange || 'Not specified'}

Available Services:
1. RNA_SEQ - RNA Sequencing for gene expression analysis
2. WGS - Whole Genome Sequencing for variant discovery
3. CHIP_SEQ - ChIP-Seq for protein-DNA interactions
4. SINGLE_CELL_RNA - Single Cell RNA-Seq for cell-type profiling
5. ATAC_SEQ - ATAC-Seq for chromatin accessibility
6. LONG_READ_DNA - Long-Read DNA Sequencing for structural variants

For each recommended service, provide:
- serviceCode (from the available services)
- serviceName
- category
- detailed reason why this service is suitable
- confidence (0-1)
- priority (essential/recommended/optional)

Respond in JSON format as an array of recommendation objects.
`

      const response = await ollama.generate({
        model: this.workingModel || this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      })

      return this.parseSequencingRecommendations(response.response, consultationData)
    } catch (error) {
      console.error('AI sequencing recommendations failed:', error)
      return this.getFallbackSequencingRecommendations(consultationData)
    }
  }

  async answerSequencingQuestion(question: string, consultationData: any): Promise<string> {
    if (!this.isAvailable) {
      return this.getFallbackSequencingAnswer(question, consultationData)
    }

    try {
      const prompt = `
As a high-throughput sequencing facility consultant, answer this question from a principal investigator:

Question: ${question}

Project Context:
- Project: ${consultationData.projectTitle}
- Research Area: ${consultationData.researchArea || 'Not specified'}
- Organism: ${consultationData.organism || 'Not specified'}
- Sample Type: ${consultationData.sampleType || 'Not specified'}
- Number of Samples: ${consultationData.numberOfSamples || 'Not specified'}
- Timeline: ${consultationData.timeline || 'Not specified'}
- Budget: ${consultationData.budgetRange || 'Not specified'}

Provide a clear, helpful, and technically accurate answer. Consider:
- Sequencing platform selection
- Sample preparation requirements
- Quality control measures
- Cost optimization strategies
- Timeline considerations
- Data analysis requirements

Be specific and actionable in your recommendations.
`

      const response = await ollama.generate({
        model: this.workingModel || this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      })

      return response.response
    } catch (error) {
      console.error('AI sequencing Q&A failed:', error)
      return this.getFallbackSequencingAnswer(question, consultationData)
    }
  }

  private parseAIResponse(response: string, _type: string): AIAnalysisResult {
    try {
      const parsed = JSON.parse(response)
      return {
        analysis: parsed.analysis || 'Analysis completed',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
        reasoning: parsed.reasoning || 'AI analysis performed'
      }
    } catch {
      return {
        analysis: response.slice(0, 500),
        suggestions: ['Review sequence manually', 'Consider alternative approaches'],
        confidence: 0.6,
        reasoning: 'Response parsing failed, using raw output'
      }
    }
  }

  private parseGuideOptimization(response: string): GuideOptimizationResult {
    try {
      const parsed = JSON.parse(response)
      return {
        optimizedSequence: parsed.optimizedSequence,
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        riskAssessment: parsed.riskAssessment || 'Standard risk profile',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7
      }
    } catch {
      return {
        improvements: ['Consider manual optimization', 'Review GC content'],
        riskAssessment: 'Unable to assess - manual review recommended',
        confidence: 0.5
      }
    }
  }

  private parseExperimentSuggestions(response: string): ExperimentSuggestion[] {
    try {
      const parsed = JSON.parse(response)
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          title: item.title || 'Experimental Approach',
          description: item.description || 'Description not available',
          rationale: item.rationale || 'Rationale not provided',
          priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium'
        }))
      }
    } catch {
      // Fallback handled below
    }
    
    return this.getFallbackExperimentSuggestions('general')
  }

  private parseSequencingRecommendations(response: string, consultationData: any): SequencingRecommendation[] {
    try {
      const parsed = JSON.parse(response)
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          serviceCode: item.serviceCode || 'RNA_SEQ',
          serviceName: item.serviceName || 'Unknown Service',
          category: item.category || 'General Sequencing',
          reason: item.reason || 'Recommended based on project requirements',
          confidence: typeof item.confidence === 'number' ? item.confidence : 0.7,
          priority: ['essential', 'recommended', 'optional'].includes(item.priority) ? item.priority : 'recommended',
          estimatedCost: consultationData.numberOfSamples ? this.estimateCost(item.serviceCode, consultationData.numberOfSamples) : undefined
        }))
      }
    } catch {
      // Fallback handled below
    }
    
    return this.getFallbackSequencingRecommendations(consultationData)
  }

  private estimateCost(serviceCode: string, numberOfSamples: number): number {
    const basePrices: { [key: string]: number } = {
      'RNA_SEQ': 450,
      'WGS': 800,
      'CHIP_SEQ': 550,
      'SINGLE_CELL_RNA': 2500,
      'ATAC_SEQ': 600,
      'LONG_READ_DNA': 1200
    }
    
    const basePrice = basePrices[serviceCode] || 500
    let totalCost = basePrice * numberOfSamples
    
    // Apply volume discounts
    if (numberOfSamples >= 50) {
      totalCost *= 0.8 // 20% discount
    } else if (numberOfSamples >= 20) {
      totalCost *= 0.9 // 10% discount
    }
    
    return Math.round(totalCost)
  }

  // Fallback methods for when AI is not available
  private getFallbackSequenceAnalysis(sequence: string): AIAnalysisResult {
    const gcContent = (sequence.match(/[CG]/g) || []).length / sequence.length * 100
    const length = sequence.length
    
    // More sophisticated fallback analysis
    const hasRepeats = /(.{3,})\1{2,}/.test(sequence)
    const hasLowComplexity = /([ACGT])\1{4,}/.test(sequence)
    const pamSites = (sequence.match(/[ACGT]GG/g) || []).length + (sequence.match(/CC[ACGT]/g) || []).length
    
    let analysis = `Sequence analysis: ${length} bp with ${gcContent.toFixed(1)}% GC content. `
    
    if (gcContent < 20) {
      analysis += 'Low GC content may reduce guide RNA stability and efficiency. '
    } else if (gcContent > 80) {
      analysis += 'High GC content may cause secondary structures and reduce accessibility. '
    } else if (gcContent >= 40 && gcContent <= 60) {
      analysis += 'Optimal GC content for efficient guide RNA design. '
    } else {
      analysis += 'GC content is within acceptable range. '
    }
    
    analysis += `Found ${pamSites} potential PAM sites (NGG/CCN). `
    
    if (hasRepeats) {
      analysis += 'Contains repetitive sequences that may complicate guide design. '
    }
    
    if (hasLowComplexity) {
      analysis += 'Contains low-complexity regions that should be avoided for guide placement. '
    }
    
    const suggestions = [
      'Verify sequence quality and remove any ambiguous bases',
      'Consider multiple guide options across the target region',
      'Validate PAM site availability in target context'
    ]
    
    if (gcContent < 40) {
      suggestions.push('Consider guides with higher GC content within the target region')
    }
    
    if (gcContent > 60) {
      suggestions.push('Avoid guides with excessive GC content to prevent secondary structures')
    }
    
    if (hasRepeats) {
      suggestions.push('Avoid repetitive regions when selecting guide RNA sequences')
    }
    
    if (pamSites < 3) {
      suggestions.push('Limited PAM sites available - consider alternative target regions')
    }
    
    return {
      analysis,
      suggestions,
      confidence: 0.75,
      reasoning: 'Advanced algorithmic analysis with CRISPR-specific heuristics (Ollama AI not available - install and run Ollama for enhanced AI insights)'
    }
  }

  private getFallbackGuideOptimization(guideSequence: string): GuideOptimizationResult {
    const gcContent = (guideSequence.match(/[CG]/g) || []).length / guideSequence.length * 100
    const hasLongRuns = /([ACGT])\1{3,}/.test(guideSequence)
    const hasPolyT = /TTTT/.test(guideSequence)
    const startsWithG = guideSequence.startsWith('G')
    const endsWithGG = guideSequence.endsWith('GG')
    
    const improvements = []
    let riskLevel = 'Low'
    
    if (gcContent < 40) {
      improvements.push('Increase GC content to 40-60% for better stability')
      riskLevel = 'Moderate'
    } else if (gcContent > 60) {
      improvements.push('Reduce GC content to avoid secondary structures')
      riskLevel = 'Moderate'
    } else {
      improvements.push('GC content is optimal (40-60%)')
    }
    
    if (hasLongRuns) {
      improvements.push('Avoid long runs of identical nucleotides (4+ in a row)')
      riskLevel = 'High'
    }
    
    if (hasPolyT) {
      improvements.push('Avoid poly-T sequences which can cause transcription termination')
      riskLevel = 'High'
    }
    
    if (!startsWithG) {
      improvements.push('Consider guides starting with G for better transcription')
    }
    
    if (endsWithGG) {
      improvements.push('Guide ends with GG - good for PAM recognition')
    }
    
    // Position-specific recommendations
    improvements.push('Validate guide position 10-20 bp upstream of PAM for optimal cutting', 'Check for potential off-target sites using BLAST or similar tools', 'Consider multiple guides targeting the same region for redundancy')
    
    const riskAssessment = `${riskLevel} risk - ${
      riskLevel === 'Low' ? 'Guide sequence appears well-optimized' :
      riskLevel === 'Moderate' ? 'Some optimization recommended before use' :
      'Significant optimization needed - consider alternative sequences'
    }`
    
    return {
      improvements,
      riskAssessment,
      confidence: 0.7
    }
  }

  private getFallbackExperimentSuggestions(experimentType: string): ExperimentSuggestion[] {
    const suggestions = {
      knockout: [
        {
          title: 'Functional Knockout Validation',
          description: 'Design multiple guides targeting different exons to confirm phenotype consistency',
          rationale: 'Multiple independent knockouts reduce off-target concerns and validate true gene function',
          priority: 'high' as const
        },
        {
          title: 'Rescue Experiment Design',
          description: 'Plan complementation experiments with wild-type gene reintroduction',
          rationale: 'Rescue experiments provide definitive proof that observed phenotypes are due to target gene loss',
          priority: 'medium' as const
        }
      ],
      knockin: [
        {
          title: 'Homology-Directed Repair Optimization',
          description: 'Test different donor template designs and delivery methods',
          rationale: 'HDR efficiency varies significantly with template design and experimental conditions',
          priority: 'high' as const
        }
      ],
      screening: [
        {
          title: 'Pooled CRISPR Screen Design',
          description: 'Design comprehensive library targeting gene family or pathway of interest',
          rationale: 'Systematic screening can reveal unexpected gene interactions and redundancies',
          priority: 'high' as const
        }
      ]
    }

    return suggestions[experimentType as keyof typeof suggestions] || suggestions.knockout
  }

  private getFallbackAnswer(question: string): string {
    return `I'd be happy to help with your CRISPR question: "${question}". However, the AI assistant is currently not available. Please check that Ollama is running locally, or consult CRISPR documentation and literature for detailed guidance. For technical questions, consider reviewing recent publications on CRISPR methodology and best practices.`
  }

  private getFallbackSequencingRecommendations(consultationData: any): SequencingRecommendation[] {
    const recommendations: SequencingRecommendation[] = []
    
    // Analyze the project data to make intelligent recommendations
    const projectText = `${consultationData.projectTitle} ${consultationData.projectDescription} ${consultationData.objectives}`.toLowerCase()
    const researchArea = consultationData.researchArea?.toLowerCase() || ''
    const sampleType = consultationData.sampleType?.toLowerCase() || ''
    const organism = consultationData.organism?.toLowerCase() || ''
    
    // RNA-seq recommendation logic
    if (projectText.includes('expression') || projectText.includes('transcript') || 
        researchArea.includes('transcript') || sampleType.includes('rna')) {
      recommendations.push({
        serviceCode: 'RNA_SEQ',
        serviceName: 'RNA Sequencing',
        category: 'RNA Sequencing',
        reason: 'RNA-seq is ideal for gene expression analysis and differential expression studies. Based on your project description, this will provide comprehensive transcriptome profiling.',
        confidence: 0.95,
        estimatedCost: consultationData.numberOfSamples ? this.estimateCost('RNA_SEQ', consultationData.numberOfSamples) : undefined,
        priority: 'essential'
      })
    }
    
    // WGS recommendation logic
    if (projectText.includes('variant') || projectText.includes('mutation') || 
        projectText.includes('genome') || researchArea.includes('genomics')) {
      recommendations.push({
        serviceCode: 'WGS',
        serviceName: 'Whole Genome Sequencing',
        category: 'DNA Sequencing',
        reason: 'WGS provides comprehensive variant detection across the entire genome, suitable for discovering both known and novel variants.',
        confidence: 0.85,
        estimatedCost: consultationData.numberOfSamples ? this.estimateCost('WGS', consultationData.numberOfSamples) : undefined,
        priority: projectText.includes('variant') ? 'essential' : 'recommended'
      })
    }
    
    // ChIP-seq recommendation logic
    if (projectText.includes('binding') || projectText.includes('chromatin') || 
        projectText.includes('histone') || projectText.includes('transcription factor')) {
      recommendations.push({
        serviceCode: 'CHIP_SEQ',
        serviceName: 'ChIP-Seq',
        category: 'Epigenomics',
        reason: 'ChIP-seq is the gold standard for mapping protein-DNA interactions and histone modifications across the genome.',
        confidence: 0.90,
        estimatedCost: consultationData.numberOfSamples ? this.estimateCost('CHIP_SEQ', consultationData.numberOfSamples) : undefined,
        priority: 'essential'
      })
    }
    
    // Single-cell recommendation logic
    if (projectText.includes('single cell') || projectText.includes('heterogeneity') || 
        projectText.includes('cell type') || projectText.includes('subpopulation')) {
      recommendations.push({
        serviceCode: 'SINGLE_CELL_RNA',
        serviceName: 'Single Cell RNA-Seq',
        category: 'RNA Sequencing',
        reason: 'Single-cell RNA-seq reveals cell-type-specific expression patterns and cellular heterogeneity that bulk RNA-seq might miss.',
        confidence: 0.80,
        estimatedCost: 2500, // Fixed cost per run
        priority: 'recommended'
      })
    }
    
    // ATAC-seq recommendation logic
    if (projectText.includes('accessibility') || projectText.includes('regulatory') || 
        projectText.includes('enhancer') || researchArea.includes('epigenomic')) {
      recommendations.push({
        serviceCode: 'ATAC_SEQ',
        serviceName: 'ATAC-Seq',
        category: 'Epigenomics',
        reason: 'ATAC-seq provides genome-wide chromatin accessibility profiling, ideal for identifying regulatory elements and understanding gene regulation.',
        confidence: 0.75,
        estimatedCost: consultationData.numberOfSamples ? this.estimateCost('ATAC_SEQ', consultationData.numberOfSamples) : undefined,
        priority: 'optional'
      })
    }
    
    // Default recommendation if nothing specific matches
    if (recommendations.length === 0) {
      recommendations.push({
        serviceCode: 'RNA_SEQ',
        serviceName: 'RNA Sequencing',
        category: 'RNA Sequencing',
        reason: 'RNA-seq is a versatile technique that provides insights into gene expression patterns, making it suitable for a wide range of research questions.',
        confidence: 0.60,
        estimatedCost: consultationData.numberOfSamples ? this.estimateCost('RNA_SEQ', consultationData.numberOfSamples) : undefined,
        priority: 'recommended'
      })
    }
    
    // Sort by confidence and priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { essential: 3, recommended: 2, optional: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.confidence - a.confidence
    })
  }

  private getFallbackSequencingAnswer(question: string, consultationData: any): string {
    const questionLower = question.toLowerCase()
    
    // Common questions and contextual answers
    if (questionLower.includes('sample') && questionLower.includes('prepar')) {
      return `For ${consultationData.sampleType || 'your samples'}, proper preparation is crucial. Key considerations include:
      
1. **Quality Requirements**: RNA samples should have RIN ≥ 7, DNA should have A260/280 ratio of 1.8-2.0
2. **Quantity**: Most services require 1-5 µg of nucleic acid, though low-input protocols are available
3. **Storage**: Keep RNA at -80°C, DNA at -20°C or -80°C
4. **Avoiding Degradation**: Use RNase-free techniques for RNA, avoid repeated freeze-thaw cycles
5. **Documentation**: Label clearly with sample ID, concentration, and date

Would you like specific guidance for ${consultationData.sampleType || 'your sample type'}?`
    }
    
    if (questionLower.includes('cost') || questionLower.includes('budget')) {
      const samples = consultationData.numberOfSamples || 'your'
      return `Based on ${samples} samples and your ${consultationData.budgetRange || 'specified'} budget:

**Cost Optimization Strategies**:
1. **Batch Processing**: Running samples together reduces per-sample costs
2. **Multiplexing**: Combine multiple samples per sequencing lane when appropriate
3. **Coverage Optimization**: Balance coverage depth with budget constraints
4. **Pilot Studies**: Start with fewer samples to validate approach
5. **Grant Opportunities**: Our facility can provide support letters for funding applications

Volume discounts available: 10% off for 20+ samples, 20% off for 50+ samples.

Would you like a detailed quote for your specific project?`
    }
    
    if (questionLower.includes('timeline') || questionLower.includes('how long')) {
      return `Typical timelines for sequencing projects:

**Standard Timeline** (${consultationData.timeline || 'flexible schedule'}):
1. Sample QC: 2-3 business days
2. Library Preparation: 3-5 business days
3. Sequencing Run: 1-4 days (platform dependent)
4. Data Delivery: 2-3 business days
5. **Total: 2-3 weeks** from sample receipt

**Expedited Service Available** (30% surcharge):
- Rush processing can reduce timeline to 7-10 days

**Factors Affecting Timeline**:
- Sample quality and quantity
- Service complexity
- Current queue depth
- Data analysis requirements

Your ${consultationData.timeline} timeline appears ${consultationData.timeline === 'immediate' ? 'aggressive - let\'s discuss expedited options' : 'reasonable for standard processing'}.`
    }
    
    if (questionLower.includes('data') && questionLower.includes('analysis')) {
      return `Data analysis support for your ${consultationData.researchArea || 'research'} project:

**Standard Deliverables**:
1. Raw data (FASTQ files)
2. Quality control reports (FastQC, MultiQC)
3. Basic alignment files (if applicable)

**Additional Analysis Options**:
1. **Differential Expression** (RNA-seq): DESeq2/edgeR analysis
2. **Variant Calling** (DNA-seq): GATK best practices pipeline
3. **Peak Calling** (ChIP/ATAC-seq): MACS2 analysis
4. **Custom Pipelines**: Tailored to your specific needs

**Bioinformatics Support**:
- Initial consultation included
- Training workshops available
- Collaboration with our bioinformatics team
- Help with result interpretation

Would you need assistance with specific analyses for your ${consultationData.projectTitle} project?`
    }
    
    // Generic response for other questions
    return `Thank you for your question about "${question}". Based on your project involving ${consultationData.organism || 'your organism'} and ${consultationData.sampleType || 'your samples'}:

This is an excellent question that requires consideration of your specific experimental goals. Key factors include:

1. Your research objectives and hypotheses
2. Sample characteristics and quality
3. Budget and timeline constraints
4. Downstream analysis requirements

I recommend we discuss your specific needs in detail. Our sequencing facility experts can provide personalized guidance to ensure your project's success.

For immediate assistance, you can also:
- Review our service catalog for detailed specifications
- Contact our technical support team
- Schedule a consultation with our genomics specialists

Is there a specific aspect of ${question} you'd like me to elaborate on?`
  }

  // Utility method to check if AI is available
  isAIAvailable(): boolean {
    return this.isAvailable
  }

  // Method to change model
  async setModel(modelName: string): Promise<boolean> {
    try {
      const models = await ollama.list()
      if (models.models.some(m => m.name === modelName || m.name.includes(modelName.split(':')[0]))) {
        this.model = modelName
        this.isAvailable = true
        console.log(`✅ Switched to model: ${modelName}`)
        return true
      }
      return false
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const aiService = new OllamaService()

// Initialize on module load
aiService.initialize().catch(console.error) 