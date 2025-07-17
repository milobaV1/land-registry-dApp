import { SearchResults } from '@/pages/search/search'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/_layout/search-results')({
  validateSearch: z.object({
    currentOwner: z.string().nonempty(),
    landId: z.string().nonempty()
  }),
  component: SearchResults,
})

