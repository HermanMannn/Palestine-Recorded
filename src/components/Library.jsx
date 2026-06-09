import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { 
  Library, 
  Search, 
  Book, 
  FileText, 
  Film, 
  Newspaper, 
  ExternalLink, 
  Filter,
  BookmarkPlus,
  PlayCircle
} from 'lucide-react'

export const Route = createLazyFileRoute('/library')({
  component: ResourceLibrary,
})

// Categories and their associated icons
const CATEGORIES = [
  { id: 'All', label: 'All Resources', icon: Library },
  { id: 'Book', label: 'Books', icon: Book },
  { id: 'Academic Paper', label: 'Academic Papers', icon: FileText },
  { id: 'Documentary', label: 'Documentaries', icon: Film },
  { id: 'Journalism', label: 'Journalism & Reports', icon: Newspaper },
]

// Seed data for the library (can easily be migrated to Supabase)
const libraryResources = [
  {
    id: '1',
    title: "The Hundred Years' War on Palestine",
    author: "Rashid Khalidi",
    year: "2020",
    category: "Book",
    description: "A landmark history of a hundred years of war waged against the Palestinians, told through the lens of settler colonialism and the author's own family archives.",
    link: "#",
    tags: ["History", "Colonialism", "Essential Reading"]
  },
  {
    id: '2',
    title: "5 Broken Cameras",
    author: "Emad Burnat & Guy Davidi",
    year: "2011",
    category: "Documentary",
    description: "An Oscar-nominated, deeply personal, first-hand account of non-violent resistance in Bil'in, a West Bank village threatened by encroaching Israeli settlements.",
    link: "#",
    tags: ["Film", "West Bank", "Resistance"]
  },
  {
    id: '3',
    title: "The Ethnic Cleansing of Palestine",
    author: "Ilan Pappé",
    year: "2006",
    category: "Book",
    description: "A groundbreaking historical analysis that uses declassified military archives to detail the systematic expulsion of Palestinians during the 1948 Nakba.",
    link: "#",
    tags: ["Nakba", "1948", "Archives"]
  },
  {
    id: '4',
    title: "Visualizing Palestine: 101",
    author: "Visualizing Palestine (VP)",
    year: "Ongoing",
    category: "Journalism",
    description: "A collection of data-driven visual journalism and infographics that communicate factual, rights-based narratives about the Palestinian lived experience.",
    link: "#",
    tags: ["Data", "Infographics", "Human Rights"]
  },
  {
    id: '5',
    title: "The Iron Cage: The Story of the Palestinian Struggle for Statehood",
    author: "Rashid Khalidi",
    year: "2006",
    category: "Academic Paper",
    description: "A brilliant, sobering analysis of the structural and political challenges that have historically prevented the establishment of an independent Palestinian state.",
    link: "#",
    tags: ["Politics", "Statehood", "History"]
  },
  {
    id: '6',
    title: "Born in Gaza",
    author: "Hernán Zin",
    year: "2014",
    category: "Documentary",
    description: "Filmed shortly after the 2014 Gaza war, this documentary examines the physical and psychological impact of the conflict on ten Palestinian children.",
    link: "#",
    tags: ["Gaza", "Children", "Film"]
  },
  {
    id: '7',
    title: "Decolonizing Methodologies: Research and Indigenous Peoples",
    author: "Linda Tuhiwai Smith",
    year: "1999",
    category: "Academic Paper",
    description: "While globally focused, this foundational academic text is heavily utilized in Palestinian studies to frame the academic decolonization of history and narrative.",
    link: "#",
    tags: ["Academia", "Decolonization", "Methodology"]
  },
  {
    id: '8',
    title: "Amnesty International: Israel's Apartheid Against Palestinians",
    author: "Amnesty International",
    year: "2022",
    category: "Journalism",
    description: "A comprehensive 280-page report detailing how the Israeli state enforces a system of oppression and domination against the Palestinian people.",
    link: "#",
    tags: ["Report", "Human Rights", "International Law"]
  }
]

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Filter resources based on both the search bar and the selected category
  const filteredResources = useMemo(() => {
    return libraryResources.filter((res) => {
      const matchesSearch = 
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        res.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = activeCategory === 'All' || res.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeCategory])

  return (
    <div className="absolute inset-0 overflow-y-auto dark:bg-slate-900/50 backdrop-blur custom-scrollbar">
      {/* Massive Container Width matching the rest of the app */}
      <div className="mx-auto max-w-[1600px] w-full px-4 md:px-8 lg:px-12 py-10">
        
        {/* Header section */}
        <div className="mb-10 text-center lg:text-left border-b border-border/50 pb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center justify-center lg:justify-start gap-4">
            <Library className="h-10 w-10 text-primary" />
            Curated Library
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl">
            A searchable archive of essential academic papers, books, documentaries, and investigative journalism to deepen your understanding of Palestine.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-14">
          
          {/* Left Column: Search & Filters */}
          <div className="w-full lg:w-[25%] xl:w-[20%] flex flex-col gap-6 shrink-0">
            
            {/* Search Bar */}
            <div className="relative sticky top-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search titles, authors, tags..."
                className="w-full pl-10 pr-4 py-3 bg-card/80 backdrop-blur border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="bg-card/40 border border-border/50 rounded-2xl p-4 sticky top-[88px]">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest mb-4 px-1">
                <Filter className="h-4 w-4 text-primary" /> Format
              </h3>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 text-left transition-all duration-200 rounded-xl p-3 ${
                        activeCategory === cat.id
                          ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                          : 'bg-transparent text-muted-foreground hover:bg-card/80 hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Resource Grid */}
          <div className="w-full lg:w-[75%] xl:w-[80%]">
            
            {/* Results Count Summary */}
            <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground px-2">
              <span>Showing <strong>{filteredResources.length}</strong> resources</span>
              {activeCategory !== 'All' && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  Filtered by: {activeCategory}
                </span>
              )}
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <div 
                    key={resource.id} 
                    className="group flex flex-col justify-between bg-card/60 backdrop-blur-sm border border-border/60 hover:border-primary/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                  >
                    <div>
                      {/* Meta top row */}
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          resource.category === 'Documentary' ? 'bg-orange-500/10 text-orange-500' :
                          resource.category === 'Book' ? 'bg-blue-500/10 text-blue-500' :
                          resource.category === 'Academic Paper' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {resource.category}
                        </span>
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <BookmarkPlus className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Title & Author */}
                      <h3 className="text-xl font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                      <div className="text-sm font-medium text-muted-foreground mb-4 flex flex-wrap gap-x-2">
                        <span>{resource.author}</span>
                        <span>•</span>
                        <span>{resource.year}</span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-foreground/80 leading-relaxed mb-6 line-clamp-4">
                        {resource.description}
                      </p>
                    </div>

                    {/* Bottom row: Tags and Action */}
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {resource.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-muted/80 text-muted-foreground px-2 py-1 rounded border border-border/50">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <a 
                        href={resource.link}
                        className="w-full flex items-center justify-center gap-2 bg-background border border-border hover:bg-primary hover:border-primary hover:text-primary-foreground text-foreground font-medium py-2.5 rounded-xl transition-all duration-200 text-sm"
                      >
                        {resource.category === 'Documentary' ? (
                          <><PlayCircle className="h-4 w-4" /> Watch Now</>
                        ) : (
                          <><ExternalLink className="h-4 w-4" /> Access Resource</>
                        )}
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-card/30 rounded-3xl border border-dashed border-border">
                  <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No resources found</h3>
                  <p className="text-muted-foreground max-w-md">
                    We couldn't find anything matching "{searchQuery}" in the {activeCategory} category. Try adjusting your search or filters.
                  </p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    className="mt-6 text-primary hover:underline font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}