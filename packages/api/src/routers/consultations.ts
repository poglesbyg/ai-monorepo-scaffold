import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  getConsultations,
  getConsultationById,
  getConsultationWithDetails,
  getRecentConsultations,
  getConsultationsByStatus,
  getSequencingServices,
  getServiceById,
  getServiceByCode,
  getConsultationChats,
  getServiceCategories
} from '../actions/consultations/getters'
import {
  createConsultation,
  updateConsultation,
  deleteConsultation,
  updateConsultationStatus,
  createServiceRecommendation,
  createMultipleServiceRecommendations,
  updateServiceRecommendation,
  deleteServiceRecommendation,
  createSampleSpecification,
  updateSampleSpecification,
  createChatMessage,
  createMultipleChatMessages,
  createProjectDeliverable,
  updateProjectDeliverable,
  createCostEstimate,
  updateCostEstimate,
  saveCompleteConsultation
} from '../actions/consultations/setters'
import { protectedProcedure, router } from '../trpc'

// Validation schemas
const consultationCreateSchema = z.object({
  piName: z.string().min(1).max(255),
  institution: z.string().min(1).max(500),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  projectTitle: z.string().min(1).max(500),
  projectDescription: z.string().min(1),
  researchArea: z.string().optional(),
  objectives: z.string().optional(),
  timeline: z.enum(['immediate', '1-3 months', '3-6 months', '6+ months']).optional(),
  budgetRange: z.enum(['<10k', '10-50k', '50-100k', '100k+']).optional(),
  grantFundingStatus: z.string().optional()
})

const consultationUpdateSchema = consultationCreateSchema.partial()

const serviceRecommendationSchema = z.object({
  consultationId: z.string().uuid(),
  serviceId: z.string().uuid(),
  recommendationReason: z.string().min(1),
  aiConfidenceScore: z.number().min(0).max(1),
  priority: z.enum(['essential', 'recommended', 'optional']),
  estimatedSamples: z.number().optional(),
  estimatedCost: z.number().optional(),
  specialConsiderations: z.string().optional(),
  alternatives: z.array(z.string()).optional()
})

const sampleSpecificationSchema = z.object({
  consultationId: z.string().uuid(),
  sampleType: z.string().min(1),
  organism: z.string().min(1),
  strainOrGenotype: z.string().optional(),
  tissueType: z.string().optional(),
  cellType: z.string().optional(),
  numberOfSamples: z.number().min(1),
  biologicalReplicates: z.number().optional(),
  technicalReplicates: z.number().optional(),
  treatmentGroups: z.array(z.string()).optional(),
  controlGroups: z.array(z.string()).optional(),
  expectedQuantity: z.string().optional(),
  concentrationRequirements: z.string().optional(),
  qualityMetricsRequired: z.array(z.string()).optional(),
  currentStorage: z.string().optional(),
  storageDuration: z.string().optional(),
  specialHandling: z.string().optional(),
  hazardousMaterials: z.boolean().default(false),
  biosafetyLevel: z.string().optional()
})

const chatMessageSchema = z.object({
  consultationId: z.string().uuid(),
  messageRole: z.enum(['user', 'assistant', 'system']),
  messageContent: z.string().min(1),
  contextData: z.record(z.any()).optional(),
  tokensUsed: z.number().optional(),
  modelUsed: z.string().optional()
})

const projectDeliverableSchema = z.object({
  consultationId: z.string().uuid(),
  deliverableType: z.string().min(1),
  description: z.string().min(1),
  estimatedDeliveryDate: z.date().optional(),
  milestoneOrder: z.number(),
  dependencies: z.array(z.string()).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'delayed']).default('pending')
})

const costEstimateSchema = z.object({
  consultationId: z.string().uuid(),
  serviceCosts: z.array(z.object({
    serviceId: z.string().uuid(),
    serviceName: z.string().optional(),
    quantity: z.number(),
    unitCost: z.number(),
    total: z.number()
  })),
  libraryPrepCost: z.number().optional(),
  sequencingCost: z.number().optional(),
  analysisCost: z.number().optional(),
  storageCost: z.number().optional(),
  subtotal: z.number(),
  discountPercentage: z.number().default(0),
  discountAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  totalCost: z.number(),
  costNotes: z.string().optional(),
  validUntil: z.date().optional(),
  quoteNumber: z.string().optional()
})

export const consultationsRouter = router({
  // Query endpoints
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await getConsultations(ctx.db, ctx.user.id)
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const consultation = await getConsultationById(ctx.db, input.id, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return consultation
    }),

  getWithDetails: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const consultation = await getConsultationWithDetails(ctx.db, input.id, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return consultation
    }),

  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      return await getRecentConsultations(ctx.db, ctx.user.id, input.limit)
    }),

  getByStatus: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'active', 'completed', 'archived'])
    }))
    .query(async ({ ctx, input }) => {
      return await getConsultationsByStatus(ctx.db, ctx.user.id, input.status)
    }),

  // Service queries
  getServices: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      activeOnly: z.boolean().default(true)
    }))
    .query(async ({ ctx, input }) => {
      return await getSequencingServices(ctx.db, input.category, input.activeOnly)
    }),

  getServiceById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const service = await getServiceById(ctx.db, input.id)
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found'
        })
      }
      return service
    }),

  getServiceByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = await getServiceByCode(ctx.db, input.code)
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found'
        })
      }
      return service
    }),

  getServiceCategories: protectedProcedure.query(async ({ ctx }) => {
    return await getServiceCategories(ctx.db)
  }),

  // Chat queries
  getChats: protectedProcedure
    .input(z.object({
      consultationId: z.string().uuid(),
      limit: z.number().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Verify user owns the consultation
      const consultation = await getConsultationById(ctx.db, input.consultationId, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return await getConsultationChats(ctx.db, input.consultationId, input.limit)
    }),

  // Mutation endpoints
  create: protectedProcedure
    .input(consultationCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return await createConsultation(ctx.db, {
        ...input,
        createdBy: ctx.user.id
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: consultationUpdateSchema
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateConsultation(ctx.db, input.id, input.data, ctx.user.id)
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await deleteConsultation(ctx.db, input.id, ctx.user.id)
      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found or already deleted'
        })
      }
      return { success: true }
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['draft', 'active', 'completed', 'archived'])
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateConsultationStatus(ctx.db, input.id, input.status, ctx.user.id)
    }),

  // Service recommendation mutations
  addRecommendation: protectedProcedure
    .input(serviceRecommendationSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the consultation
      const consultation = await getConsultationById(ctx.db, input.consultationId, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return await createServiceRecommendation(ctx.db, input)
    }),

  addMultipleRecommendations: protectedProcedure
    .input(z.array(serviceRecommendationSchema))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns all consultations
      const consultationIds = [...new Set(input.map(r => r.consultationId))]
      for (const id of consultationIds) {
        const consultation = await getConsultationById(ctx.db, id, ctx.user.id)
        if (!consultation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Consultation ${id} not found`
          })
        }
      }
      return await createMultipleServiceRecommendations(ctx.db, input)
    }),

  updateRecommendation: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: z.object({
        acceptedByUser: z.boolean().optional(),
        userFeedback: z.string().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateServiceRecommendation(ctx.db, input.id, input.data)
    }),

  deleteRecommendation: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await deleteServiceRecommendation(ctx.db, input.id)
      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recommendation not found'
        })
      }
      return { success: true }
    }),

  // Sample specification mutations
  saveSampleSpec: protectedProcedure
    .input(sampleSpecificationSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the consultation
      const consultation = await getConsultationById(ctx.db, input.consultationId, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return await createSampleSpecification(ctx.db, input)
    }),

  updateSampleSpec: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: sampleSpecificationSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateSampleSpecification(ctx.db, input.id, input.data)
    }),

  // Chat mutations
  sendMessage: protectedProcedure
    .input(chatMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the consultation
      const consultation = await getConsultationById(ctx.db, input.consultationId, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return await createChatMessage(ctx.db, input)
    }),

  sendMultipleMessages: protectedProcedure
    .input(z.array(chatMessageSchema))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns all consultations
      const consultationIds = [...new Set(input.map(m => m.consultationId))]
      for (const id of consultationIds) {
        const consultation = await getConsultationById(ctx.db, id, ctx.user.id)
        if (!consultation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Consultation ${id} not found`
          })
        }
      }
      return await createMultipleChatMessages(ctx.db, input)
    }),

  // Project deliverable mutations
  addDeliverable: protectedProcedure
    .input(projectDeliverableSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the consultation
      const consultation = await getConsultationById(ctx.db, input.consultationId, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return await createProjectDeliverable(ctx.db, input)
    }),

  updateDeliverable: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: projectDeliverableSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateProjectDeliverable(ctx.db, input.id, input.data)
    }),

  // Cost estimate mutations
  saveCostEstimate: protectedProcedure
    .input(costEstimateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the consultation
      const consultation = await getConsultationById(ctx.db, input.consultationId, ctx.user.id)
      if (!consultation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consultation not found'
        })
      }
      return await createCostEstimate(ctx.db, input)
    }),

  updateCostEstimate: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: costEstimateSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateCostEstimate(ctx.db, input.id, input.data)
    }),

  // Batch operations
  saveCompleteConsultation: protectedProcedure
    .input(z.object({
      consultation: consultationCreateSchema,
      sampleSpec: sampleSpecificationSchema.omit({ consultationId: true }).optional(),
      recommendations: z.array(serviceRecommendationSchema.omit({ consultationId: true })).optional(),
      deliverables: z.array(projectDeliverableSchema.omit({ consultationId: true })).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return await saveCompleteConsultation(
        ctx.db,
        {
          ...input.consultation,
          createdBy: ctx.user.id
        },
        input.sampleSpec,
        input.recommendations,
        input.deliverables
      )
    })
}) 