import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { 
  User, 
  MapPin, 
  BookOpen, 
  Clock, 
  PenTool, 
  Search, 
  Quote, 
  Award,
  ChevronRight
} from 'lucide-react'

export const Route = createLazyFileRoute('/figures')({
  component: FiguresProfilePage,
})

// Seed data for Significant Figures
const significantFigures = [
  {
    id: 'darwish',
    name: 'Mahmoud Darwish',
    title: 'The National Poet',
    role: 'Poet & Author',
    origin: 'Al-Birwa, Galilee',
    years: '1941 - 2008',
    bio: 'Widely regarded as the Palestinian national poet, Darwish\'s work gives voice to the struggles, displacement, and enduring spirit of the Palestinian people. His poetry weaves together themes of exile, identity, and deep connection to the land.',
    quote: '"We have on this earth what makes life worth living."',
    works: [
      { title: 'Leaves of Olive', year: '1964', type: 'Poetry Collection' },
      { title: 'Memory for Forgetfulness', year: '1982', type: 'Prose' },
      { title: 'In the Presence of Absence', year: '2006', type: 'Prose Poem' }
    ],
    timelineEvents: [
      { date: '1948', event: 'Displacement from Al-Birwa during the Nakba.' },
      { date: '1988', event: 'Drafted the Palestinian Declaration of Independence.' }
    ]
  },
  {
    id: 'said',
    name: 'Edward Said',
    title: 'Pioneering Academic',
    role: 'Scholar & Critic',
    origin: 'Jerusalem',
    years: '1935 - 2003',
    bio: 'A professor of literature at Columbia University, Said was a public intellectual and a founder of the academic field of postcolonial studies. He was a tireless advocate for Palestinian political rights and an independent voice for humanism.',
    quote: '"You cannot continue to victimize someone else just because you yourself were a victim once."',
    works: [
      { title: 'Orientalism', year: '1978', type: 'Academic Book' },
      { title: 'The Question of Palestine', year: '1979', type: 'Political Essay' },
      { title: 'Out of Place', year: '1999', type: 'Memoir' }
    ],
    timelineEvents: [
      { date: '1947', event: 'Family relocated from Jerusalem to Cairo.' },
      { date: '1977', event: 'Elected to the Palestinian National Council.' }
    ]
  },
  {
    id: 'kanafani',
    name: 'Ghassan Kanafani',
    title: 'Voice of the Resistance',
    role: 'Novelist & Activist',
    origin: 'Acre (Akka)',
    years: '1936 - 1972',
    bio: 'A highly influential novelist, journalist, and political thinker. Kanafani coined the concept of "resistance literature" and brilliantly captured the psychological and physical realities of Palestinian refugees in his seminal works.',
    quote: '"Everything in this world can be robbed and stolen, except one thing; this one thing is the love that emanates from a human being towards a solid commitment to a conviction or cause."',
    works: [
      { title: 'Men in the Sun', year: '1962', type: 'Novella' },
      { title: 'Return to Haifa', year: '1969', type: 'Novella' },
      { title: 'The Land of Sad Oranges', year: '1958', type: 'Short Stories' }
    ],
    timelineEvents: [
      { date: '1948', event: 'Fled Acre for Lebanon, then Syria.' },
      { date: '1972', event: 'Assassinated in Beirut, Lebanon.' }
    ]
  },
  {
    id: 'al-ali',
    name: 'Naji al-Ali',
    title: 'Creator of Handala',
    role: 'Political Cartoonist',
    origin: 'Al-Shajara, Galilee',
    years: '1938 - 1987',
    bio: 'A political cartoonist noted for his sharp, uncompromising critique of both Israeli policies and Arab leadership. He is best known as the creator of "Handala," a 10-year-old refugee boy who remains a potent symbol of Palestinian defiance and identity.',
    quote: '"Handala was born ten years old, and he will always be ten years old. At that age, I left my homeland, and when he returns, Handala will still be ten, and then he will start growing up."',
    works: [
      { title: 'Handala', year: '1969', type: 'Iconic Character' },
      { title: 'Over 40,000 Cartoons', year: '1959-1987', type: 'Political Art' }
    ],
    timelineEvents: [
      { date: '1948', event: 'Expelled to Ain al-Hilweh refugee camp in Lebanon.' },
      { date: '1987', event: 'Assassinated in London.' }
    ]
  },
  {
    id: 'tuqan',
    name: 'Fadwa Tuqan',
    title: 'Poet of Palestine',
    role: 'Poet',
    origin: 'Nablus',
    years: '1917 - 2003',
    bio: 'One of the most distinguished figures of modern Arabic literature. Her early poetry explored personal emotion and female oppression, but following the 1967 occupation, her work shifted to fierce nationalistic themes and resistance against the occupation.',
    quote: '"My poetry is the history of my life and the history of my country."',
    works: [
      { title: 'Alone With the Days', year: '1952', type: 'Poetry' },
      { title: 'The Night and the Horsemen', year: '1969', type: 'Poetry' },
      { title: 'Mountainous Journey', year: '1985', type: 'Autobiography' }
    ],
    timelineEvents: [
      { date: '1967', event: 'Witnessed the fall of Nablus during the Naksa.' }
    ]
  }
]

export default function FiguresProfilePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFigure, setSelectedFigure] = useState(significantFigures[0])

  // Filter figures based on search
  const filteredFigures = useMemo(() => {
    if (!searchQuery.trim()) return significantFigures
    const query = searchQuery.toLowerCase()
    return significantFigures.filter(
      (fig) =>
        fig.name.toLowerCase().includes(query) ||
        fig.role.toLowerCase().includes(query) ||
        fig.origin.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="absolute inset-0 overflow-y-auto dark:bg-slate-900/50 backdrop-blur custom-scrollbar">
      {/* Massive Container Width matching the Calendar */}
      <div className="mx-auto max-w-[1600px] w-full px-4 md:px-8 lg:px-12 py-10">
        
        {/* Header section */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center justify-center lg:justify-start gap-4">
            <User className="h-10 w-10 text-primary" />
            Historical Figures
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl">
            Explore the lives of poets, scholars, artists, and leaders who shaped Palestinian identity and resistance.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-14">
          
          {/* Left Column: Search & List */}
          <div className="w-full lg:w-[35%] xl:w-[30%] flex flex-col gap-6">
            
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search by name, role, or city..."
                className="w-full pl-10 pr-4 py-3 bg-card/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Profiles List */}
            <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredFigures.length > 0 ? (
                filteredFigures.map((figure) => (
                  <button
                    key={figure.id}
                    onClick={() => setSelectedFigure(figure)}
                    className={`w-full text-left transition-all duration-300 rounded-2xl p-4 border flex items-center gap-4 ${
                      selectedFigure.id === figure.id
                        ? 'bg-primary/10 border-primary shadow-md transform scale-[1.02] ring-1 ring-primary/30'
                        : 'bg-card/40 border-border/40 hover:bg-card/80 hover:border-border'
                    }`}
                  >
                    {/* Avatar Placeholder */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg border-2 shrink-0 ${
                      selectedFigure.id === figure.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {figure.name.charAt(0)}
                    </div>
                    
                    <div>
                      <div className={`font-semibold text-base leading-tight mb-1 ${selectedFigure.id === figure.id ? 'text-primary' : 'text-foreground'}`}>
                        {figure.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{figure.role}</span>
                        <span>•</span>
                        <span>{figure.years.split(' ')[0]}</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground italic">
                  No figures found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Profile Detail View */}
          <div className="w-full lg:w-[65%] xl:w-[70%]">
            <div className="sticky top-6 rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              
              {/* Profile Header Background Banner */}
              <div className="h-32 bg-gradient-to-r from-primary/20 via-background to-card border-b border-border relative">
                <div className="absolute -bottom-12 left-8 md:left-12">
                  <div className="h-24 w-24 rounded-2xl bg-card border-4 border-background flex items-center justify-center shadow-lg text-4xl font-bold text-primary">
                    {selectedFigure.name.charAt(0)}
                  </div>
                </div>
              </div>

              <div className="pt-16 px-8 md:px-12 pb-12">
                {/* Meta Tags */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-primary/10 text-primary text-sm font-bold px-4 py-1.5 rounded-full border border-primary/20 flex items-center gap-2">
                    <Award className="h-4 w-4" /> {selectedFigure.title}
                  </span>
                  <span className="bg-muted text-foreground text-sm font-semibold px-4 py-1.5 rounded-full border border-border flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-muted-foreground" /> {selectedFigure.role}
                  </span>
                </div>

                {/* Name and Origin */}
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 leading-tight">
                  {selectedFigure.name}
                </h2>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8 font-medium">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" /> {selectedFigure.origin}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {selectedFigure.years}
                  </span>
                </div>

                {/* Biography & Quote */}
                <div className="grid xl:grid-cols-3 gap-10 mb-10">
                  <div className="xl:col-span-2 prose prose-base md:prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <p>{selectedFigure.bio}</p>
                  </div>
                  <div className="xl:col-span-1">
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 relative h-full flex items-center justify-center">
                      <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/20" />
                      <p className="text-lg font-serif italic text-foreground text-center px-4 leading-snug">
                        {selectedFigure.quote}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Grid: Works & Timeline */}
                <div className="grid lg:grid-cols-2 gap-8">
                  
                  {/* Notable Works Panel */}
                  <div className="space-y-5 bg-background/30 rounded-2xl p-6 border border-border/50">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-3 pb-3 border-b border-border">
                      <BookOpen className="h-6 w-6 text-primary" />
                      Notable Works
                    </h3>
                    <div className="space-y-4">
                      {selectedFigure.works.map((work, idx) => (
                        <div key={idx} className="flex items-start justify-between group">
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{work.title}</div>
                            <div className="text-sm text-muted-foreground">{work.type}</div>
                          </div>
                          <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                            {work.year}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Events Panel */}
                  <div className="space-y-5 bg-background/30 rounded-2xl p-6 border border-border/50">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-3 pb-3 border-b border-border">
                      <Clock className="h-6 w-6 text-orange-500" />
                      Historical Timeline
                    </h3>
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {selectedFigure.timelineEvents.map((event, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-background absolute left-0 md:left-1/2 -translate-x-1/2 shadow"></div>
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0">
                            <div className="flex flex-col md:group-odd:items-end bg-card/50 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                              <span className="text-primary font-bold text-xs mb-1">{event.date}</span>
                              <span className="text-sm text-foreground md:group-odd:text-right leading-tight">{event.event}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}