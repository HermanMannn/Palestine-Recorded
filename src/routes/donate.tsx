import { createFileRoute } from "@tanstack/react-router";
import Donate from "../components/Donate.jsx";
import Navbar from "@/components/Navbar.jsx";

export const Route = createFileRoute("/donate")({
  component: Donate,
  head: () => ({
    meta: [
      { title: "Donate — Palestine Recorded" },
      {
        name: "description",
        content:
          "Support verified charities providing medical, food, and humanitarian aid to Palestinians.",
      },
      { property: "og:title", content: "Donate — Palestine Recorded" },
      {
        property: "og:description",
        content:
          "Support verified charities providing medical, food, and humanitarian aid to Palestinians.",
      },
    ],
  }),
});
