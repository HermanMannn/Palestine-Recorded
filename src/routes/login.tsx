import { createFileRoute } from "@tanstack/react-router";
import Login from "../components/Login.jsx";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Palestine Recorded — Login" },
      {
        name: "description",
        content: "Login to Palestine Recorded to explore the historical timeline.",
      },
    ],
  }),
});
