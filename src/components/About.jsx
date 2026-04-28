import {
  BookOpen,
  Users,
  Shield,
  Sparkles,
  MapPin,
  MessageSquare,
  Gamepad2,
  Globe2,
} from "lucide-react";

const pillars = [
  {
    icon: MapPin,
    title: "The Verified Timeline",
    text: "An unabridged record of historical events laid over an interactive map of Palestine, supported by unbiased, verified sources.",
  },
  {
    icon: Users,
    title: "The Community Timeline",
    text: "A dynamic space where Palestinians and historians upload media, testimonies, and proof of cultural history.",
  },
  {
    icon: Shield,
    title: "Safe & Truthful",
    text: "All contributions undergo strict moderation by both AI and human reviewers to prevent misinformation.",
  },
  {
    icon: Sparkles,
    title: "Reputation Points",
    text: "Members earn reputation for valuable contributions, helping the most trusted voices rise to the top.",
  },
  {
    icon: MessageSquare,
    title: "Built-in Messaging",
    text: "Connect directly with researchers, journalists, and community members through real-time chat.",
  },
  {
    icon: Gamepad2,
    title: "PalGrid",
    text: "Learn Palestinian culture daily through a word puzzle featuring Palestine-related terms.",
  },
];

export default function About() {
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-14">
        {/* Hero */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Globe2 className="h-3.5 w-3.5 text-primary" />
            About Palestine Recorded
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            History, told by those{" "}
            <span className="text-primary italic">who live it.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed">
            Palestine Recorded (PalRec) is a web-based platform dedicated to preserving
            the rich tapestry of Palestinian heritage, culture, and traditions —
            combating the erasure of identity through verified history and lived testimony.
          </p>
        </section>

        {/* Mission */}
        <section className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Our Mission: History Intertwined
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                For decades, the narrative surrounding Palestine has been dominated by
                conflict, often overshadowing the vibrant reality of its people. PalRec
                bridges the gap between fact and experience by combining{" "}
                <span className="font-semibold text-foreground">verified historical accuracy</span>{" "}
                with{" "}
                <span className="font-semibold text-foreground">personal human testimony</span>{" "}
                — giving the community a place where every story matters.
              </p>
            </div>
          </div>
        </section>

        {/* Pillars grid */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            What makes PalRec different
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group rounded-xl border border-border bg-card/90 backdrop-blur-sm p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-3 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision */}
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card/90 to-card/90 backdrop-blur-sm p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Our Vision for the Future
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            Developed by{" "}
            <span className="font-semibold text-foreground">Midas Software Solutions</span>,
            PalRec aligns with global efforts to document and promote Palestinian identity
            through modern digital solutions. By leveraging{" "}
            <span className="font-semibold text-foreground">Blockchain integration</span>{" "}
            to confirm authorship and{" "}
            <span className="font-semibold text-foreground">AI-driven chatbots</span>{" "}
            to assist researchers, we are building a self-sustainable platform that
            preserves legitimacy regardless of outside interference.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Verified", "Community-driven", "Open archive", "Moderated", "Self-sustainable"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </section>

        {/* Footer note */}
        <section className="text-center text-sm text-muted-foreground pb-6">
          Some roots cannot be erased. 🌿
        </section>
      </div>
    </div>
  );
}
