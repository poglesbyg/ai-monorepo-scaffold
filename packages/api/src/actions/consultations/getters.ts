import type { Kysely, Selectable } from 'kysely'

import type { DB } from '../../../../db/src/types.gen'

// Use the actual types from the generated DB
type Database = DB
type Consultation = DB['consultations']
type SequencingService = DB['sequencingServices']

export async function getConsultations(db: Kysely<Database>, userId: string) {
  return await db
    .selectFrom('consultations')
    .where('createdBy', '=', userId)
    .orderBy('createdAt', 'desc')
    .selectAll()
    .execute()
}

export async function getConsultationById(
  db: Kysely<Database>,
  consultationId: string,
  userId?: string
): Promise<Selectable<Consultation> | undefined> {
  let query = db
    .selectFrom('consultations')
    .where('id', '=', consultationId)

  if (userId) {
    query = query.where('createdBy', '=', userId)
  }

  return await query.selectAll().executeTakeFirst()
}

export async function getConsultationWithDetails(
  db: Kysely<Database>,
  consultationId: string,
  userId?: string
) {
  const consultation = await getConsultationById(db, consultationId, userId)
  if (!consultation) {return null}

  // Get all related data in parallel
  const [recommendations, sampleSpecs, chats, deliverables, costEstimate] = await Promise.all([
    // Get service recommendations with service details
    db
      .selectFrom('serviceRecommendations')
      .innerJoin('sequencingServices', 'serviceRecommendations.serviceId', 'sequencingServices.id')
      .where('serviceRecommendations.consultationId', '=', consultationId)
      .select([
        'serviceRecommendations.id',
        'serviceRecommendations.recommendationReason',
        'serviceRecommendations.aiConfidenceScore',
        'serviceRecommendations.priority',
        'serviceRecommendations.estimatedSamples',
        'serviceRecommendations.estimatedCost',
        'serviceRecommendations.specialConsiderations',
        'serviceRecommendations.alternatives',
        'serviceRecommendations.acceptedByUser',
        'serviceRecommendations.userFeedback',
        'serviceRecommendations.recommendedAt',
        'sequencingServices.id as serviceId',
        'sequencingServices.serviceCode',
        'sequencingServices.serviceName',
        'sequencingServices.category',
        'sequencingServices.description',
        'sequencingServices.basePricePerSample',
        'sequencingServices.typicalTurnaroundDays'
      ])
      .execute(),

    // Get sample specifications
    db
      .selectFrom('sampleSpecifications')
      .where('consultationId', '=', consultationId)
      .selectAll()
      .executeTakeFirst(),

    // Get chat history
    db
      .selectFrom('consultationChats')
      .where('consultationId', '=', consultationId)
      .orderBy('createdAt', 'asc')
      .selectAll()
      .execute(),

    // Get project deliverables
    db
      .selectFrom('projectDeliverables')
      .where('consultationId', '=', consultationId)
      .orderBy('milestoneOrder', 'asc')
      .selectAll()
      .execute(),

    // Get cost estimate
    db
      .selectFrom('costEstimates')
      .where('consultationId', '=', consultationId)
      .selectAll()
      .executeTakeFirst()
  ])

  return {
    ...consultation,
    recommendations,
    sampleSpecification: sampleSpecs,
    chats,
    deliverables,
    costEstimate
  }
}

export async function getRecentConsultations(
  db: Kysely<Database>,
  userId: string,
  limit = 5
) {
  return await db
    .selectFrom('consultations')
    .where('createdBy', '=', userId)
    .orderBy('updatedAt', 'desc')
    .limit(limit)
    .selectAll()
    .execute()
}

export async function getConsultationsByStatus(
  db: Kysely<Database>,
  userId: string,
  status: 'draft' | 'active' | 'completed' | 'archived'
) {
  return await db
    .selectFrom('consultations')
    .where('createdBy', '=', userId)
    .where('status', '=', status)
    .orderBy('updatedAt', 'desc')
    .selectAll()
    .execute()
}

export async function getSequencingServices(
  db: Kysely<Database>,
  category?: string,
  activeOnly = true
) {
  let query = db.selectFrom('sequencingServices')

  if (activeOnly) {
    query = query.where('isActive', '=', true)
  }

  if (category) {
    query = query.where('category', '=', category)
  }

  return await query
    .orderBy('category', 'asc')
    .orderBy('serviceName', 'asc')
    .selectAll()
    .execute()
}

export async function getServiceById(
  db: Kysely<Database>,
  serviceId: string
): Promise<Selectable<SequencingService> | undefined> {
  return await db
    .selectFrom('sequencingServices')
    .where('id', '=', serviceId)
    .selectAll()
    .executeTakeFirst()
}

export async function getServiceByCode(
  db: Kysely<Database>,
  serviceCode: string
): Promise<Selectable<SequencingService> | undefined> {
  return await db
    .selectFrom('sequencingServices')
    .where('serviceCode', '=', serviceCode)
    .selectAll()
    .executeTakeFirst()
}

export async function getConsultationChats(
  db: Kysely<Database>,
  consultationId: string,
  limit?: number
) {
  let query = db
    .selectFrom('consultationChats')
    .where('consultationId', '=', consultationId)
    .orderBy('createdAt', 'asc')

  if (limit) {
    query = query.limit(limit)
  }

  return await query.selectAll().execute()
}

export async function getServiceCategories(db: Kysely<Database>) {
  const results = await db
    .selectFrom('sequencingServices')
    .where('isActive', '=', true)
    .select('category')
    .distinct()
    .orderBy('category', 'asc')
    .execute()

  return results.map(r => r.category)
} 