import type { AppRouter } from '@seqconsult/api'
import { createTRPCReact } from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>()
