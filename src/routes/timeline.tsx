import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import TimelineSidebar from "../components/TimelineSidebar.jsx";
import HistoricalMap from "../components/HistoricalMap.jsx";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
  head: () => ({
    meta: [
      { title: "Palestine Recorded — Interactive Timeline" },
      {
        name: "description",
        content: "Explore the historical timeline of Palestine with an interactive map.",
      },
    ],
  }),
});

function TimelinePage() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar/>
      <div className="relative flex-1">
          <HistoricalMap sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <TimelineSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>
    </div>
  );
}
