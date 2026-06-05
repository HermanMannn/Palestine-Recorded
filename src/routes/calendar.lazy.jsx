import { createLazyFileRoute } from '@tanstack/react-router'

import CulturalCalendar from '@/components/CulturalCalendar'
import Navbar from '@/components/Navbar';
export const Route = createLazyFileRoute('/calendar')({
  component: RouteComponent,
})

function RouteComponent() {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="relative flex-1 overflow-hidden">
          <CulturalCalendar/>
        </div>
      </div>
    );
  
}
