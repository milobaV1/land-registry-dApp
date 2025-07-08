import { SearchResults } from '@/pages/search/search'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/_layout/search-results')({
  validateSearch: z.object({
    q: z.string().optional()
  }),
  component: SearchResults,
})

