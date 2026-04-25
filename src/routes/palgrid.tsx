import { createFileRoute } from "@tanstack/react-router";
import PalGrid from "../components/PalGrid.jsx";

function PalGridPage() {
  return <PalGrid />;
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