import LandingPage from '@/pages/home/landing'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_layout/')({
  component: LandingPage
})

