import type { ColumnType, RawBuilder } from 'kysely'

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [value: string]: JSONValue
    }
  | Array<JSONValue>

// Example of how to define a custom column type
//
// export type ProjectStage = {
//   name: string
//   description: string
// }

// // Includes RawBuilder to allow for JSONB
// export type ProjectStageColumnType = ColumnType<
//   ProjectStage[] | null,
//   ProjectStage[] | null | RawBuilder<ProjectStage[]>,
//   ProjectStage[] | null | RawBuilder<ProjectStage[]>
// >

// export type EmailAddress = {
//   email: string
//   name?: string
// }

// // Email address array type for JSONB columns
// export type EmailAddressColumnType = ColumnType<
//   EmailAddress[],
//   EmailAddress[] | RawBuilder<EmailAddress[]>,
//   EmailAddress[] | RawBuilder<EmailAddress[]>
// >

// Existing types
export type JoinCodeColumnType = ColumnType<
  string,
  string | RawBuilder<string>,
  string | RawBuilder<string>
>

// New types for sequencing consultation schema

// Sample requirements for sequencing services
export type SampleRequirements = {
  type: string // "RNA", "DNA", "ChIP DNA", etc.
  min_quantity: string // "1 µg", "10 ng", etc.
  quality: string // "RIN ≥ 7", "A260/280 ≥ 1.8", etc.
  concentration?: string // "≥ 50 ng/µL"
  fragment_size?: string // For ChIP-seq, ATAC-seq
  integrity?: string
  min_cells?: string // For single cell
  viability?: string // For single cell
  preparation?: string
}

export type SampleRequirementsColumnType = ColumnType<
  SampleRequirements,
  SampleRequirements | RawBuilder<SampleRequirements>,
  SampleRequirements | RawBuilder<SampleRequirements>
>

// Volume discounts for services
export type VolumeDiscount = {
  min_samples: number
  discount: number // 0.1 = 10% discount
}

export type VolumeDiscountsColumnType = ColumnType<
  VolumeDiscount[] | null,
  VolumeDiscount[] | null | RawBuilder<VolumeDiscount[]>,
  VolumeDiscount[] | null | RawBuilder<VolumeDiscount[]>
>

// Context data for chat messages
export type ChatContextData = {
  current_step?: string
  mentioned_services?: string[]
  budget_discussed?: boolean
  timeline_discussed?: boolean
  samples_discussed?: boolean
  [key: string]: any
}

export type ChatContextColumnType = ColumnType<
  ChatContextData | null,
  ChatContextData | null | RawBuilder<ChatContextData>,
  ChatContextData | null | RawBuilder<ChatContextData>
>

// Service costs breakdown
export type ServiceCost = {
  service_id: string
  service_name?: string
  quantity: number
  unit_cost: number
  total: number
}

export type ServiceCostsColumnType = ColumnType<
  ServiceCost[],
  ServiceCost[] | RawBuilder<ServiceCost[]>,
  ServiceCost[] | RawBuilder<ServiceCost[]>
>
