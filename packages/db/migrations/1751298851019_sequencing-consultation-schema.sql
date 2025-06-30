-- Migration: Sequencing Consultation Schema
-- Transforms CRISPR Design Studio into Sequencing Facility AI Consultant

-- First, drop all CRISPR-related tables
DROP TABLE IF EXISTS off_target_sites CASCADE;
DROP TABLE IF EXISTS guide_rnas CASCADE;
DROP TABLE IF EXISTS sequences CASCADE;
DROP TABLE IF EXISTS analysis_results CASCADE;
DROP TABLE IF EXISTS experiments CASCADE;

-- Core consultation tracking table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- PI Information
    pi_name VARCHAR(255) NOT NULL,
    institution VARCHAR(500) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(255),
    
    -- Project Information
    project_title VARCHAR(500) NOT NULL,
    project_description TEXT NOT NULL,
    research_area VARCHAR(255), -- genomics, transcriptomics, epigenomics, etc.
    objectives TEXT,
    
    -- Project Planning
    timeline VARCHAR(50), -- immediate, 1-3 months, 3-6 months, 6+ months
    budget_range VARCHAR(50), -- <10k, 10-50k, 50-100k, 100k+
    grant_funding_status VARCHAR(100),
    
    -- Consultation Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, completed, archived
    completion_percentage INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Validation
    CONSTRAINT valid_email CHECK (email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    CONSTRAINT valid_completion CHECK (completion_percentage BETWEEN 0 AND 100)
);

-- Sequencing services catalog
CREATE TABLE sequencing_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_code VARCHAR(50) UNIQUE NOT NULL, -- RNA_SEQ, WGS, CHIP_SEQ, etc.
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- RNA sequencing, DNA sequencing, Epigenomics, etc.
    
    -- Service Details
    description TEXT NOT NULL,
    typical_applications TEXT[],
    key_features TEXT[],
    
    -- Requirements
    sample_requirements JSONB NOT NULL, -- { "type": "RNA", "min_quantity": "1ug", "quality": "RIN > 7" }
    library_prep_included BOOLEAN DEFAULT true,
    
    -- Timing and Cost
    typical_turnaround_days INTEGER NOT NULL,
    base_price_per_sample DECIMAL(10,2),
    volume_discounts JSONB, -- [{"min_samples": 10, "discount": 0.1}, ...]
    
    -- Technical Specifications
    platform VARCHAR(100), -- Illumina NovaSeq, PacBio, Oxford Nanopore, etc.
    read_length VARCHAR(50), -- 50bp, 100bp, 150bp PE, etc.
    typical_coverage VARCHAR(100), -- 30M reads, 30x coverage, etc.
    deliverables TEXT[],
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service recommendations from AI
CREATE TABLE service_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES sequencing_services(id),
    
    -- Recommendation Details
    recommendation_reason TEXT NOT NULL,
    ai_confidence_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    priority VARCHAR(20) NOT NULL, -- essential, recommended, optional
    
    -- Project Specifics
    estimated_samples INTEGER,
    estimated_cost DECIMAL(10,2),
    special_considerations TEXT,
    alternatives TEXT[],
    
    -- Metadata
    recommended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_by_user BOOLEAN,
    user_feedback TEXT,
    
    -- Validation
    CONSTRAINT valid_confidence CHECK (ai_confidence_score BETWEEN 0 AND 1),
    CONSTRAINT valid_priority CHECK (priority IN ('essential', 'recommended', 'optional'))
);

-- Sample specifications and requirements
CREATE TABLE sample_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    
    -- Sample Information
    sample_type VARCHAR(100) NOT NULL, -- tissue, cell line, blood, etc.
    organism VARCHAR(255) NOT NULL,
    strain_or_genotype VARCHAR(255),
    tissue_type VARCHAR(255),
    cell_type VARCHAR(255),
    
    -- Sample Details
    number_of_samples INTEGER NOT NULL,
    biological_replicates INTEGER,
    technical_replicates INTEGER,
    treatment_groups TEXT[],
    control_groups TEXT[],
    
    -- Quality Requirements
    expected_quantity VARCHAR(100),
    concentration_requirements VARCHAR(255),
    quality_metrics_required TEXT[],
    
    -- Storage and Handling
    current_storage VARCHAR(100), -- -80C, -20C, RNAlater, etc.
    storage_duration VARCHAR(100),
    special_handling TEXT,
    hazardous_materials BOOLEAN DEFAULT false,
    biosafety_level VARCHAR(10),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat conversation history
CREATE TABLE consultation_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    
    -- Message Details
    message_role VARCHAR(20) NOT NULL, -- user, assistant, system
    message_content TEXT NOT NULL,
    
    -- Context and Metadata
    context_data JSONB, -- Store relevant context for the message
    tokens_used INTEGER,
    model_used VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT valid_role CHECK (message_role IN ('user', 'assistant', 'system'))
);

-- Project deliverables and milestones
CREATE TABLE project_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    
    -- Deliverable Information
    deliverable_type VARCHAR(100) NOT NULL, -- raw_data, processed_data, analysis_report, etc.
    description TEXT NOT NULL,
    
    -- Timeline
    estimated_delivery_date DATE,
    milestone_order INTEGER NOT NULL,
    dependencies TEXT[],
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, delayed
    actual_delivery_date DATE,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT valid_deliverable_status CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed'))
);

-- Cost estimates and breakdown
CREATE TABLE cost_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    
    -- Cost Breakdown
    service_costs JSONB NOT NULL, -- [{"service_id": "...", "quantity": 10, "unit_cost": 500, "total": 5000}]
    library_prep_cost DECIMAL(10,2),
    sequencing_cost DECIMAL(10,2),
    analysis_cost DECIMAL(10,2),
    storage_cost DECIMAL(10,2),
    
    -- Totals
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL,
    
    -- Additional Information
    cost_notes TEXT,
    valid_until DATE,
    quote_number VARCHAR(50) UNIQUE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_consultations_pi_email ON consultations(email);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX idx_consultations_institution ON consultations(institution);

CREATE INDEX idx_sequencing_services_category ON sequencing_services(category);
CREATE INDEX idx_sequencing_services_active ON sequencing_services(is_active);
CREATE INDEX idx_sequencing_services_code ON sequencing_services(service_code);

CREATE INDEX idx_recommendations_consultation ON service_recommendations(consultation_id);
CREATE INDEX idx_recommendations_priority ON service_recommendations(priority);

CREATE INDEX idx_sample_specs_consultation ON sample_specifications(consultation_id);
CREATE INDEX idx_sample_specs_organism ON sample_specifications(organism);

CREATE INDEX idx_chats_consultation ON consultation_chats(consultation_id);
CREATE INDEX idx_chats_created ON consultation_chats(created_at);

CREATE INDEX idx_deliverables_consultation ON project_deliverables(consultation_id);
CREATE INDEX idx_deliverables_status ON project_deliverables(status);

CREATE INDEX idx_cost_estimates_consultation ON cost_estimates(consultation_id);
CREATE INDEX idx_cost_estimates_quote ON cost_estimates(quote_number);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequencing_services_updated_at BEFORE UPDATE ON sequencing_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sample_specifications_updated_at BEFORE UPDATE ON sample_specifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_deliverables_updated_at BEFORE UPDATE ON project_deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_estimates_updated_at BEFORE UPDATE ON cost_estimates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial sequencing services catalog
INSERT INTO sequencing_services (service_code, service_name, category, description, typical_applications, key_features, sample_requirements, typical_turnaround_days, base_price_per_sample, platform, read_length, typical_coverage, deliverables) VALUES
('RNA_SEQ', 'RNA Sequencing', 'RNA Sequencing', 'Standard mRNA sequencing for gene expression analysis', 
 ARRAY['Gene expression profiling', 'Differential expression analysis', 'Pathway analysis', 'Biomarker discovery'],
 ARRAY['Poly-A selection', 'Strand-specific libraries', 'High sensitivity', 'Wide dynamic range'],
 '{"type": "Total RNA", "min_quantity": "1 µg", "quality": "RIN ≥ 7", "concentration": "≥ 50 ng/µL"}'::jsonb,
 21, 450.00, 'Illumina NovaSeq', '150bp PE', '30M reads per sample',
 ARRAY['FASTQ files', 'Quality control report', 'Alignment files (BAM)', 'Gene count matrix']),

('WGS', 'Whole Genome Sequencing', 'DNA Sequencing', 'Complete genome sequencing for variant discovery',
 ARRAY['Variant calling', 'Structural variant detection', 'Copy number analysis', 'Population genomics'],
 ARRAY['High coverage uniformity', 'PCR-free libraries', 'Large insert sizes', 'Accurate variant calling'],
 '{"type": "Genomic DNA", "min_quantity": "1 µg", "quality": "A260/280 ≥ 1.8", "integrity": "No degradation"}'::jsonb,
 28, 800.00, 'Illumina NovaSeq', '150bp PE', '30x coverage',
 ARRAY['FASTQ files', 'Alignment files (BAM)', 'Variant calls (VCF)', 'Quality metrics report']),

('CHIP_SEQ', 'ChIP-Seq', 'Epigenomics', 'Chromatin immunoprecipitation sequencing for protein-DNA interactions',
 ARRAY['Transcription factor binding', 'Histone modifications', 'Chromatin accessibility', 'Enhancer identification'],
 ARRAY['Low input protocols available', 'Spike-in normalization', 'Peak calling included', 'Motif analysis'],
 '{"type": "ChIP DNA", "min_quantity": "10 ng", "quality": "Enrichment validated", "fragment_size": "100-500 bp"}'::jsonb,
 21, 550.00, 'Illumina NovaSeq', '50bp SE', '20M reads per sample',
 ARRAY['FASTQ files', 'Alignment files', 'Peak calls (BED)', 'BigWig tracks', 'QC report']),

('SINGLE_CELL_RNA', 'Single Cell RNA-Seq', 'RNA Sequencing', 'Individual cell transcriptome profiling',
 ARRAY['Cell type identification', 'Trajectory analysis', 'Cell-cell communication', 'Rare cell discovery'],
 ARRAY['10x Genomics platform', 'Cell hashing available', 'Feature barcoding', 'Multi-modal capabilities'],
 '{"type": "Single cell suspension", "min_cells": "5,000", "viability": "≥ 80%", "concentration": "700-1200 cells/µL"}'::jsonb,
 14, 2500.00, '10x Genomics Chromium', '28+91bp', '50k reads per cell',
 ARRAY['Cell Ranger output', 'Feature-barcode matrix', 'Cloupe file', 'QC report', 'Basic clustering']),

('ATAC_SEQ', 'ATAC-Seq', 'Epigenomics', 'Assay for transposase-accessible chromatin sequencing',
 ARRAY['Chromatin accessibility', 'Regulatory element mapping', 'Footprinting analysis', 'Cell type-specific regulation'],
 ARRAY['Low cell input', 'Nucleosome positioning', 'Fast protocol', 'High signal-to-noise'],
 '{"type": "Cells or nuclei", "min_quantity": "50,000 cells", "viability": "≥ 80%", "preparation": "Fresh or frozen"}'::jsonb,
 21, 600.00, 'Illumina NovaSeq', '50bp PE', '50M reads per sample',
 ARRAY['FASTQ files', 'Alignment files', 'Peak calls', 'Nucleosome positioning', 'QC metrics']),

('LONG_READ_DNA', 'Long-Read DNA Sequencing', 'DNA Sequencing', 'PacBio or Oxford Nanopore for long reads',
 ARRAY['De novo assembly', 'Structural variants', 'Repeat regions', 'Methylation detection'],
 ARRAY['Read lengths >10kb', 'Direct DNA sequencing', 'Real-time sequencing', 'Base modifications'],
 '{"type": "HMW genomic DNA", "min_quantity": "5 µg", "quality": "No shearing", "fragment_size": ">30 kb"}'::jsonb,
 14, 1200.00, 'PacBio Sequel II', 'HiFi reads', '10-20x coverage',
 ARRAY['HiFi reads (FASTQ)', 'Assembly', 'Structural variant calls', 'Methylation calls']);