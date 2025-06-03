import { KYC } from '@/pages/kyc/kyc'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/kyc')({
  component: KYC,
})

