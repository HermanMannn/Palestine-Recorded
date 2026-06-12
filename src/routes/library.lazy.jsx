import { createLazyFileRoute } from '@tanstack/react-router'

import Library from '@/components/Library'; 
import Navbar from '@/components/Navbar';
export const Route = createLazyFileRoute('/library')({
  component: RouteComponent,
})

function RouteComponent() {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="relative flex-1 overflow-hidden">
          <Library/>
        </div>
      </div>
    );
  
}
