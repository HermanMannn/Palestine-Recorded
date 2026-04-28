import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar.jsx";
import SocialFeed from "../components/SocialFeed.jsx";

export const Route = createFileRoute("/social")({
  component: SocialPage,
  head: () => ({
    meta: [
      { title: "Palestine Recorded — Community Feed" },
      {
        name: "description",
        content: "Share stories, photos, and reflections with the Palestine Recorded community.",
      },
    ],
  }),
});

function SocialPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="relative flex-1">
        <SocialFeed />
      </div>
    </div>
  );
}
