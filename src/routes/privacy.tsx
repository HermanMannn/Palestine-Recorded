import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar.jsx";
import privacyHtml from "../data/privacy-policy.html?raw";

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-palbg">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div
          className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-sm"
          dangerouslySetInnerHTML={{ __html: privacyHtml }}
        />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Palestine Recorded" },
      { name: "description", content: "How Palestine Recorded collects, uses, and protects your information." },
    ],
  }),
});
