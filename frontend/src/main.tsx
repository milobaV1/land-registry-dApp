import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
//import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "./index.css";
import { WagmiProvider } from 'wagmi'
import { config } from './config/wagmi-config'

// Create a new router instance
const router = createRouter({ routeTree })

const queryClient = new QueryClient()

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
           <Toaster/>
      <RouterProvider router={router} />
        </WagmiProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}