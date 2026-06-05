import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, MapPin, ExternalLink, Info, BookOpen, Users, Bell } from 'lucide-react'

export const Route = createLazyFileRoute('/calendar')({
  component: CulturalCalendar,
})

const culturalEvents = [
  {
    id: 'fatah-launch',
    date: 'January 1',
    title: 'Launch of the Palestinian Revolution',
    type: 'Historical Anniversary',
    shortDesc: 'Marks the first armed operation by Fatah in 1965.',
    context: 'Celebrated as the dawn of the modern Palestinian resistance movement, marking the first official armed operation in 1965. It represents the shift towards self-determination and organized national struggle.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'womens-day',
    date: 'March 8',
    title: 'Women\'s Day & Solidarity',
    type: 'Observance',
    shortDesc: 'Honoring the foundational role of Palestinian women.',
    context: 'International Women\'s Day is highly observed across Palestine and the diaspora to honor the foundational role of Palestinian women in the national struggle, preservation of culture, and community resilience.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'karameh',
    date: 'March 21',
    title: 'Battle of Karameh / Mother\'s Day',
    type: 'Historical Anniversary',
    shortDesc: 'Commemorates the 1968 battle and coincides with Mother\'s Day.',
    context: 'Commemorates the 1968 Battle of Karameh, where Palestinian fedayeen and Jordanian forces repelled a major Israeli military raid. It became a symbol of resistance. In the Arab world, this date also coincides with Mother\'s Day.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'land-day',
    date: 'March 30',
    title: 'Land Day (Yawm al-Ard)',
    type: 'Historical Anniversary',
    shortDesc: 'Commemorating the 1976 protests against land expropriation.',
    context: 'Land Day marks the events of March 30, 1976, when a general strike and marches were organized in Arab towns from the Galilee to the Negev in response to the Israeli government\'s announcement of a plan to expropriate thousands of dunams of land. It is a pivotal event in the struggle for land and identity.',
    resources: [
      { title: 'The Significance of Land Day', link: '#' }
    ],
    communityEvents: []
  },
  {
    id: 'childrens-day',
    date: 'April 5',
    title: 'Palestinian Children\'s Day',
    type: 'Observance',
    shortDesc: 'Dedicated to the rights and resilience of Palestinian children.',
    context: 'A national day dedicated to highlighting the rights, systemic struggles, and resilience of Palestinian children living under occupation and in refugee camps across the region.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'prisoners-day',
    date: 'April 17',
    title: 'Palestinian Prisoners\' Day',
    type: 'Commemoration',
    shortDesc: 'A national day of solidarity with Palestinian political prisoners.',
    context: 'A day of solidarity with the thousands of Palestinian political prisoners held in Israeli detention. It is marked by rallies, marches, and campaigns advocating for their rights and release.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'nakba',
    date: 'May 15',
    title: 'Nakba Day',
    type: 'Commemoration',
    shortDesc: 'The annual day of commemoration of the displacement in 1948.',
    context: 'Nakba Day (Day of the Catastrophe) marks the destruction of Palestinian society and homeland in 1948, and the permanent displacement of a majority of the Palestinian Arabs. It is a day of remembrance, education, and reaffirmation of the right of return.',
    resources: [
      { title: '1948 Oral History Archive', link: '#' },
      { title: 'UN Resolution 194', link: '#' }
    ],
    communityEvents: []
  },
  {
    id: 'naksa',
    date: 'June 5',
    title: 'Naksa Day',
    type: 'Historical Anniversary',
    shortDesc: 'Commemorating the displacement during the 1967 Six-Day War.',
    context: 'Naksa Day marks the "setback" of the 1967 Six-Day War, resulting in the displacement of an estimated 300,000 Palestinians and the beginning of the ongoing military occupation of the West Bank, Gaza Strip, and East Jerusalem.',
    resources: [
      { title: 'Timeline of the 1967 War', link: '#' }
    ],
    communityEvents: []
  },
  {
    id: 'oslo',
    date: 'September 13',
    title: 'Oslo Accords Anniversary',
    type: 'Historical Anniversary',
    shortDesc: 'Marks the 1993 signing of the Declaration of Principles.',
    context: 'Marks the 1993 signing of the Declaration of Principles on the White House lawn. It established the Palestinian Authority and remains a highly debated turning point in modern Palestinian political history.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'sabra-shatila',
    date: 'September 16',
    title: 'Sabra & Shatila Memorial',
    type: 'Commemoration',
    shortDesc: 'A day of mourning for the 1982 Lebanon refugee camp massacres.',
    context: 'A day of mourning for the lives lost in the 1982 massacre of Palestinian refugees and Lebanese civilians in the Sabra and Shatila camps in Beirut, following the Israeli invasion of Lebanon.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'balfour',
    date: 'November 2',
    title: 'Balfour Declaration Anniversary',
    type: 'Historical Anniversary',
    shortDesc: 'Marks the 1917 British declaration regarding Palestine.',
    context: 'Marks the 1917 declaration by British Foreign Secretary Arthur Balfour expressing support for a "national home for the Jewish people" in Palestine, widely viewed by Palestinians as the imperial catalyst for the ongoing conflict.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'independence',
    date: 'November 15',
    title: 'Palestinian Independence Day',
    type: 'Historical Anniversary',
    shortDesc: 'Celebrates the 1988 symbolic declaration of a State of Palestine.',
    context: 'Celebrates the Palestinian Declaration of Independence, proclaimed by Yasser Arafat and the Palestinian National Council in Algiers in 1988, officially adopting the two-state solution framework.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'solidarity-day',
    date: 'November 29',
    title: 'International Day of Solidarity',
    type: 'Observance',
    shortDesc: 'A UN-sanctioned day of solidarity with the Palestinian people.',
    context: 'An official United Nations observance chosen because it marks the anniversary of the 1947 UN Partition Plan (Resolution 181). It is a day for the international community to focus on the unresolved question of Palestine.',
    resources: [],
    communityEvents: []
  },
  {
    id: 'first-intifada',
    date: 'December 8',
    title: 'First Intifada Anniversary',
    type: 'Historical Anniversary',
    shortDesc: 'Marks the beginning of the 1987 mass popular uprising.',
    context: 'Marks the beginning of the First Intifada in 1987, a sustained series of mass protests, civil disobedience, and grassroots organizing against the Israeli occupation across the West Bank and Gaza Strip.',
    resources: [],
    communityEvents: []
  }
]

export default function CulturalCalendar() {
  // Dynamically calculate the next 3 events based on today's date
  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()

    // Ensure array is chronologically sorted
    const sorted = [...culturalEvents].sort((a, b) => {
      return new Date(`${a.date}, 2024`) - new Date(`${b.date}, 2024`)
    })

    // Filter events that haven't happened yet this year
    const futureEvents = sorted.filter((e) => {
      const eventDate = new Date(`${e.date}, ${currentYear}`)
      return eventDate >= today
    })

    // Combine future events with next year's early events to guarantee 3 items
    const wrappedEvents = [...futureEvents, ...sorted]
    
    // Remove duplicates based on ID
    const uniqueUpcoming = Array.from(new Set(wrappedEvents.map(e => e.id)))
      .map(id => wrappedEvents.find(e => e.id === id))

    return uniqueUpcoming.slice(0, 3)
  }, [])

  // Start with the very next upcoming event automatically selected
  const [selectedEvent, setSelectedEvent] = useState(upcomingEvents[0])

  return (
    <div className="absolute inset-0 overflow-y-auto dark:bg-slate-900/50 backdrop-blur custom-scrollbar">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Header section */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center md:justify-start gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Cultural Calendar
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            A living timeline of Palestinian cultural commemorations, historical anniversaries, and community gatherings.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Event Lists */}
          <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col gap-8">
            
            {/* Upcoming Events Section (Featured) */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest mb-4 px-1">
                <Bell className="h-4 w-4 text-primary" /> Upcoming Events
              </h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <button
                    key={`upcoming-${event.id}`}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left transition-all duration-200 rounded-xl p-4 border ${
                      selectedEvent.id === event.id
                        ? 'bg-primary/10 border-primary shadow-sm'
                        : 'bg-card/60 border-border hover:bg-card/90 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-bold text-primary mb-1">{event.date}</div>
                    <div className="text-base font-semibold text-foreground leading-tight">{event.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* All Events Section (GRID LAYOUT) */}
            

          </div>

          {/* Right Column: Event Details */}
          <div className="w-full md:w-[65%] lg:w-[70%]">
            <div className="sticky top-4 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedEvent.date}
                </span>
                <span className="bg-accent text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border">
                  {selectedEvent.type}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                {selectedEvent.title}
              </h2>
              
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground mb-8 leading-relaxed">
                <p>{selectedEvent.context}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Resources Panel */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Educational Resources
                  </h3>
                  <ul className="space-y-3">
                    {selectedEvent.resources && selectedEvent.resources.length > 0 ? (
                      selectedEvent.resources.map((res, idx) => (
                        <li key={idx}>
                          <a href={res.link} className="group flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink className="h-4 w-4 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
                            <span className="leading-tight group-hover:underline underline-offset-2">{res.title}</span>
                          </a>
                        </li>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <Info className="h-4 w-4" /> No external resources listed.
                      </div>
                    )}
                  </ul>
                </div>

                {/* Local Events Panel */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Users className="h-5 w-5 text-[#2a9d4a]" />
                    Nearby Community Events
                  </h3>
                  <div className="space-y-3">
                    {selectedEvent.communityEvents && selectedEvent.communityEvents.length > 0 ? (
                      selectedEvent.communityEvents.map((ce, idx) => (
                        <div key={idx} className="bg-background/50 rounded-lg p-3 border border-border/50">
                          <div className="font-semibold text-sm text-foreground mb-1">{ce.title}</div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {ce.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" /> {ce.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <Info className="h-4 w-4" /> No local events currently scheduled.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              
            </div>
            
          </div>

        </div>
        {/* All Events Section (GRID LAYOUT) */}
            <div className="flex-1">
              <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest mb-5 px-1 border-t border-border/50 pt-8">
                <CalendarIcon className="h-5 w-5" /> All Important Days
              </h3>
              
              {/* 3. TALLER SCROLL AREA AND RESPONSIVE COLUMNS */}
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 h-[500px] overflow-y-auto pr-3 custom-scrollbar pb-4">
                {culturalEvents.map((event) => (
                  <button
                    key={`all-${event.id}`}
                    onClick={() => setSelectedEvent(event)}
                    className={`flex flex-col items-start justify-between text-left transition-all duration-200 rounded-xl p-4 border h-32 ${
                      selectedEvent.id === event.id
                        ? 'bg-primary/10 border-primary ring-1 ring-primary/30 shadow-sm'
                        : 'bg-card/40 border-border/40 hover:bg-card/80 hover:border-border'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{event.date}</div>
                    <div className={`text-sm font-medium leading-tight line-clamp-3 mt-2 ${selectedEvent.id === event.id ? 'text-primary' : 'text-foreground'}`}>
                      {event.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
      </div>
      
    </div>
  )
}