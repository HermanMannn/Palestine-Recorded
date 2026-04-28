import { createFileRoute } from "@tanstack/react-router";

import Navbar from "../components/Navbar.jsx";
import About from "@/components/About.jsx";
import Contact from "@/components/Contact.jsx";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Page" },
      {
        name: "description",
        content: "Contact page of the Website",
      },
    ],
  }),
});


function ContactPage() {
  return (<div className="flex h-screen flex-col ">
        <Navbar />
        <div className="relative flex-1 ">
          <Contact/>
        </div>
      </div>
      )
}

