import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar.jsx";
import RightToolbar from "../components/RightToolbar.jsx";
import Messages from "../components/Messages.jsx";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
  head: () => ({
    meta: [
      { title: "Palestine Recorded — Direct Messages" },
      {
        name: "description",
        content: "Connect and chat with the Palestine Recorded community.",
      },
    ],
  }),
});

function MessagesPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="relative flex-1 overflow-hidden pr-14">
        <Messages />
        <RightToolbar />
      </div>
    </div>
  );
}
