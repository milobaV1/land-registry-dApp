import { Footer } from '@/components/footer/footer'
import { Header } from '@/components/header/header'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='h-[100vh] w-[100vw]'>
        <div className='h-[65px]'>
            <Header/>
        </div>
        <div className='h-[calc(100vh-65px)] overflow-x-hidden'>
          <div>
<Outlet/>
          </div>
            
            <div>
          <Footer/>
        </div>
        </div>
        
    </div>
  )
}
