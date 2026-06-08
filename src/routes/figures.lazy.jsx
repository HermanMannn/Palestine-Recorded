import { createLazyFileRoute } from '@tanstack/react-router'

import Figures from '@/components/Figures'; 
import Navbar from '@/components/Navbar';
export const Route = createLazyFileRoute('/figures')({
  component: RouteComponent,
})

function RouteComponent() {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="relative flex-1 overflow-hidden">
          <Figures/>
        </div>
      </div>
    );
  
}
