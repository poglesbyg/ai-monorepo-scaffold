import type { Kysely, Insertable, Updateable } from 'kysely'

import type { DB } from '../../../../db/src/types.gen'

// Use the actual types from the generated DB
type Database = DB
type Consultation = DB['consultations']
type ServiceRecommendation = DB['serviceRecommendations']
type ConsultationChat = DB['consultationChats']
type SampleSpecification = DB['sampleSpecifications']
type ProjectDeliverable = DB['projectDeliverables']
type CostEstimate = DB['costEstimates']

// Consultation mutations
export async function createConsultation(
  db: Kysely<Database>,
  data: Insertable<Consultation>
) {
  return await db
    .insertInto('consultations')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateConsultation(
  db: Kysely<Database>,
  consultationId: string,
  data: Updateable<Consultation>,
  userId?: string
) {
  let query = db
    .updateTable('consultations')
    .set(data)
    .where('id', '=', consultationId)

  if (userId) {
    query = query.where('createdBy', '=', userId)
  }

  return await query.returningAll().executeTakeFirstOrThrow()
}

export async function deleteConsultation(
  db: Kysely<Database>,
  consultationId: string,
  userId?: string
) {
  let query = db
    .deleteFrom('consultations')
    .where('id', '=', consultationId)

  if (userId) {
    query = query.where('createdBy', '=', userId)
  }

  const result = await query.executeTakeFirst()
  return result.numDeletedRows > 0
}

export async function updateConsultationStatus(
  db: Kysely<Database>,
  consultationId: string,
  status: 'draft' | 'active' | 'completed' | 'archived',
  userId?: string
) {
  const data: Updateable<Consultation> = {
    status,
    ...(status === 'completed' ? { completedAt: new Date() } : {})
  }

  return await updateConsultation(db, consultationId, data, userId)
}

// Service recommendations
export async function createServiceRecommendation(
  db: Kysely<Database>,
  data: Insertable<ServiceRecommendation>
) {
  return await db
    .insertInto('serviceRecommendations')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function createMultipleServiceRecommendations(
  db: Kysely<Database>,
  recommendations: Insertable<ServiceRecommendation>[]
) {
  if (recommendations.length === 0) {return []}

  return await db
    .insertInto('serviceRecommendations')
    .values(recommendations)
    .returningAll()
    .execute()
}

export async function updateServiceRecommendation(
  db: Kysely<Database>,
  recommendationId: string,
  data: Updateable<ServiceRecommendation>
) {
  return await db
    .updateTable('serviceRecommendations')
    .set(data)
    .where('id', '=', recommendationId)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function deleteServiceRecommendation(
  db: Kysely<Database>,
  recommendationId: string
) {
  const result = await db
    .deleteFrom('serviceRecommendations')
    .where('id', '=', recommendationId)
    .executeTakeFirst()

  return result.numDeletedRows > 0
}

// Sample specifications
export async function createSampleSpecification(
  db: Kysely<Database>,
  data: Insertable<SampleSpecification>
) {
  return await db
    .insertInto('sampleSpecifications')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateSampleSpecification(
  db: Kysely<Database>,
  specId: string,
  data: Updateable<SampleSpecification>
) {
  return await db
    .updateTable('sampleSpecifications')
    .set(data)
    .where('id', '=', specId)
    .returningAll()
    .executeTakeFirstOrThrow()
}

// Chat messages
export async function createChatMessage(
  db: Kysely<Database>,
  data: Insertable<ConsultationChat>
) {
  return await db
    .insertInto('consultationChats')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function createMultipleChatMessages(
  db: Kysely<Database>,
  messages: Insertable<ConsultationChat>[]
) {
  if (messages.length === 0) {return []}

  return await db
    .insertInto('consultationChats')
    .values(messages)
    .returningAll()
    .execute()
}

// Project deliverables
export async function createProjectDeliverable(
  db: Kysely<Database>,
  data: Insertable<ProjectDeliverable>
) {
  return await db
    .insertInto('projectDeliverables')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateProjectDeliverable(
  db: Kysely<Database>,
  deliverableId: string,
  data: Updateable<ProjectDeliverable>
) {
  return await db
    .updateTable('projectDeliverables')
    .set(data)
    .where('id', '=', deliverableId)
    .returningAll()
    .executeTakeFirstOrThrow()
}

// Cost estimates
export async function createCostEstimate(
  db: Kysely<Database>,
  data: Insertable<CostEstimate>
) {
  return await db
    .insertInto('costEstimates')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateCostEstimate(
  db: Kysely<Database>,
  estimateId: string,
  data: Updateable<CostEstimate>
) {
  return await db
    .updateTable('costEstimates')
    .set(data)
    .where('id', '=', estimateId)
    .returningAll()
    .executeTakeFirstOrThrow()
}

// Batch operations
export async function saveCompleteConsultation(
  db: Kysely<Database>,
  consultation: Insertable<Consultation>,
  sampleSpec?: Omit<Insertable<SampleSpecification>, 'consultationId'>,
  recommendations?: Omit<Insertable<ServiceRecommendation>, 'consultationId'>[],
  deliverables?: Omit<Insertable<ProjectDeliverable>, 'consultationId'>[]
) {
  return await db.transaction().execute(async (trx) => {
    // Create consultation
    const newConsultation = await createConsultation(trx, consultation)

    // Create sample specification if provided
    let newSampleSpec
    if (sampleSpec) {
      newSampleSpec = await createSampleSpecification(trx, {
        ...sampleSpec,
        consultationId: newConsultation.id
      })
    }

    // Create recommendations if provided
    let newRecommendations: any[] = []
    if (recommendations && recommendations.length > 0) {
      newRecommendations = await createMultipleServiceRecommendations(
        trx,
        recommendations.map(r => ({
          ...r,
          consultationId: newConsultation.id
        }))
      )
    }

    // Create deliverables if provided
    let newDeliverables = []
    if (deliverables && deliverables.length > 0) {
      for (const deliverable of deliverables) {
        const created = await createProjectDeliverable(trx, {
          ...deliverable,
          consultationId: newConsultation.id
        })
        newDeliverables.push(created)
      }
    }

    return {
      consultation: newConsultation,
      sampleSpecification: newSampleSpec,
      recommendations: newRecommendations,
      deliverables: newDeliverables
    }
  })
} 