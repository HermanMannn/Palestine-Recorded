import { createFileRoute } from "@tanstack/react-router";

import Navbar from "../components/Navbar.jsx";

import About from "@/components/About.jsx";


export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Page" },
      {
        name: "description",
        content: "About page of the Website",
      },
    ],
  }),
});


function AboutPage() {
  return (<div className="flex h-screen flex-col">
        <Navbar />
        <div className="relative flex-1">
          <About/>
        </div>
      </div>
      )
}

