import { createFileRoute } from "@tanstack/react-router";
import Settings from "../components/Settings.jsx";
import Navbar from "../components/Navbar.jsx";

function SettingsPage() {
  return (<div className="flex h-screen flex-col ">
        <Navbar />
        <div className="relative flex-1">
          <Settings />
        </div>
      </div>)
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Interactive Map" },
      { name: "description", content: "Adjust your preferences for the interactive map experience." },
    ],
  }),
});