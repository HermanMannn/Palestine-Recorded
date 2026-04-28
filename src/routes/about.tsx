import { createFileRoute } from "@tanstack/react-router";

import Navbar from "../components/Navbar.jsx";
import RightToolbar from "../components/RightToolbar.jsx";

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
  return (<div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="relative flex-1 overflow-hidden pr-14">
          <About/>
          <RightToolbar />
        </div>
      </div>
      )
}

