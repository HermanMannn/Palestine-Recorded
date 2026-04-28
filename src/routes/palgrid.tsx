import { createFileRoute } from "@tanstack/react-router";
import PalGrid from "../components/PalGrid.jsx";
import Navbar from "../components/Navbar.jsx";


function PalGridPage() {
  return (<div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="relative flex-1 ">
          <PalGrid />
        </div>
      </div>)
}

export const Route = createFileRoute("/palgrid")({
  component: PalGridPage,
  head: () => ({
    meta: [
      { title: "PalGrid — Word Game" },
      {
        name: "description",
        content: "A Wordle-style game built for Palestine-themed words.",
      },
    ],
  }),
});

