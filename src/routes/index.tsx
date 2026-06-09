import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar.jsx";
import Home from "../components/Home.jsx";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Palestine Recorded — Home" },
      {
        name: "description",
        content:
          "Preserve stories, celebrate culture, and connect with the Palestine Recorded community.",
      },
    ],
  }),
});

function HomePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <Home />
    </div>
  );
}
