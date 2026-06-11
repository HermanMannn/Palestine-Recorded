export type PalestineWord = {
  word: string;
  arabic: string;
  category: "Geography" | "Culture" | "History" | "Values";
  meaning: string;
  context: string;
};

export const PALESTINE_WORDS: PalestineWord[] = [
  // --- GEOGRAPHY & CITIES ---
  {
    word: "JENIN",
    arabic: "جنين",
    category: "Geography",
    meaning: "A major Palestinian city in the northern West Bank.",
    context: "Known for its agricultural heritage, deep history of resilience, and its famous refugee camp."
  },
  {
    word: "YAFFA",
    arabic: "يافا",
    category: "Geography",
    meaning: "Jaffa, an ancient port city on the Mediterranean.",
    context: "Before 1948, Yaffa was the cultural and economic capital of Palestine, famous worldwide for its oranges."
  },
  {
    word: "HAIFA",
    arabic: "حيفا",
    category: "Geography",
    meaning: "A historic coastal city built on the slopes of Mount Carmel.",
    context: "Haifa was a major hub for Palestinian trade, railways, and culture before the Nakba."
  },
  {
    word: "SAFAD",
    arabic: "صفد",
    category: "Geography",
    meaning: "A northern city in the Galilee region.",
    context: "Historically a center of weaving, cheese-making, and spirituality before its native population was expelled in 1948."
  },
  {
    word: "BISAN",
    arabic: "بيسان",
    category: "Geography",
    meaning: "Beisan, an ancient city in the Jordan River Valley.",
    context: "One of the oldest cities in Palestine, known for its rich soil, abundant water, and deep historical roots."
  },
  {
    word: "NAQAB",
    arabic: "النقب",
    category: "Geography",
    meaning: "The southern desert region of Palestine.",
    context: "Home to the indigenous Palestinian Bedouin communities who have deeply rooted traditions of desert life."
  },

  // --- CULTURE & HERITAGE ---
  {
    word: "SUMUD",
    arabic: "صمود",
    category: "Culture",
    meaning: "Steadfastness or resilience.",
    context: "A core Palestinian cultural and political value representing the determination to stay on the land despite hardship."
  },
  {
    word: "DABKA",
    arabic: "دبكة",
    category: "Culture",
    meaning: "A traditional Levantine folk dance.",
    context: "Performed at weddings and celebrations, Dabka is a joyful expression of Palestinian identity, community, and solidarity."
  },
  {
    word: "KUFIA",
    arabic: "كوفية",
    category: "Culture",
    meaning: "The Keffiyeh, a traditional checkered scarf.",
    context: "Historically worn by Palestinian farmers, it became the global symbol of Palestinian nationalism and solidarity."
  },
  {
    word: "THOUB",
    arabic: "ثوب",
    category: "Culture",
    meaning: "A traditional embroidered Palestinian dress.",
    context: "Different villages have unique embroidery (Tatreez) patterns, weaving local history and identity into the fabric."
  },
  {
    word: "ZATAR",
    arabic: "زعتر",
    category: "Culture",
    meaning: "A traditional wild thyme and sesame spice blend.",
    context: "A staple of the Palestinian breakfast and a deep symbol of the community's connection to the land and flora."
  },
  {
    word: "OLIVE",
    arabic: "زيتون",
    category: "Culture",
    meaning: "A tree native to the Levant region.",
    context: "Olive trees are the universal symbol of Palestinian rootedness, peace, and agricultural livelihood."
  },
  {
    word: "WATAN",
    arabic: "وطن",
    category: "Culture",
    meaning: "Homeland or Nation.",
    context: "A deeply emotional concept in Palestinian literature and poetry, expressing the longing for return."
  },
  {
    word: "BALAD",
    arabic: "بلد",
    category: "Culture",
    meaning: "Town, city, or country.",
    context: "Often used colloquially by Palestinians to refer to their home village or to the homeland as a whole."
  },

  // --- HISTORY & PEOPLE ---
  {
    word: "NAKBA",
    arabic: "نكبة",
    category: "History",
    meaning: "Arabic for 'Catastrophe'.",
    context: "Refers to the 1948 mass displacement and expulsion of Palestinians from their homes, lands, and heritage."
  },
  {
    word: "EXILE",
    arabic: "منفى",
    category: "History",
    meaning: "The state of being barred from one's native country.",
    context: "Millions of Palestinians live in exile across the diaspora, maintaining a strong connection and right of return."
  },
  {
    word: "CAMPS",
    arabic: "مخيمات",
    category: "History",
    meaning: "Refugee camps.",
    context: "Temporary settlements established after 1948 that have become permanent, concrete testaments to the unresolved refugee crisis."
  },
  {
    word: "STONE",
    arabic: "حجر",
    category: "History",
    meaning: "A piece of rock.",
    context: "Symbolic of the First Intifada (1987), where stones were used by a grassroots civil uprising against heavily armed occupation."
  },
  {
    word: "ROOTS",
    arabic: "جذور",
    category: "History",
    meaning: "The origin or cultural origins of a people.",
    context: "A metaphor frequently used by Palestinians to describe their unbreakable ancestral ties to the land of Palestine."
  },
  {
    word: "GAZAN",
    arabic: "غزاوي",
    category: "History",
    meaning: "A person from the Gaza Strip.",
    context: "Gaza is one of the oldest cities in the world, renowned historically for its port, weavers, and immense resilience."
  },

  // --- VALUES & SOLIDARITY ---
  {
    word: "SALAM",
    arabic: "سلام",
    category: "Values",
    meaning: "Peace.",
    context: "The traditional greeting in Palestine ('As-salamu alaykum') and the ultimate hope for the region's future."
  },
  {
    word: "RIGHT",
    arabic: "حق",
    category: "Values",
    meaning: "Moral or legal entitlement.",
    context: "Central to the Palestinian cause, particularly 'The Right of Return' (Haq al-Awda) for refugees as enshrined in UN Resolution 194."
  },
  {
    word: "TRUTH",
    arabic: "حقيقة",
    category: "Values",
    meaning: "That which is true or in accordance with fact.",
    context: "A vital aspect of Palestinian journalism and oral history—documenting the truth to combat the erasure of their narrative."
  },
  {
    word: "FAITH",
    arabic: "إيمان",
    category: "Values",
    meaning: "Complete trust or confidence.",
    context: "Whether religious (Muslim and Christian) or secular faith in justice, it is what sustains the Palestinian spirit."
  },

  // --- VARIABLE-LENGTH WORDS (4–7 letters) ---
  {
    word: "AKKA",
    arabic: "عكا",
    category: "Geography",
    meaning: "Acre, an ancient walled port city on the Mediterranean.",
    context: "One of the oldest continuously inhabited cities in the world, famous for its sea walls, markets, and resistance to Napoleon's siege in 1799."
  },
  {
    word: "GAZA",
    arabic: "غزة",
    category: "Geography",
    meaning: "A coastal city and strip in southern Palestine.",
    context: "A crossroads of civilizations for millennia, historically renowned for its port, pottery, and weaving traditions."
  },
  {
    word: "SABR",
    arabic: "صبر",
    category: "Values",
    meaning: "Patience and endurance; also the Arabic word for cactus.",
    context: "The cactus plant marks the sites of depopulated Palestinian villages, making 'sabr' a living symbol of patience and memory."
  },
  {
    word: "NABLUS",
    arabic: "نابلس",
    category: "Geography",
    meaning: "A major city in the northern West Bank between two mountains.",
    context: "Famous for its old city, olive-oil soap factories, and knafeh — it has been a center of Palestinian trade for centuries."
  },
  {
    word: "HEBRON",
    arabic: "الخليل",
    category: "Geography",
    meaning: "Al-Khalil, a historic city in the southern West Bank.",
    context: "Known for its old city, glassblowing, ceramics, and grapes, and home to the Ibrahimi Mosque."
  },
  {
    word: "KNAFEH",
    arabic: "كنافة",
    category: "Culture",
    meaning: "A warm dessert of sweet cheese and shredded pastry.",
    context: "Nablus is famed as the home of knafeh nabulsiyeh, served at celebrations and beloved across Palestine."
  },
  {
    word: "HUMMUS",
    arabic: "حمص",
    category: "Culture",
    meaning: "A dish of blended chickpeas, tahini, lemon, and garlic.",
    context: "A cornerstone of the Palestinian table, traditionally shared from one plate — a symbol of hospitality."
  },
  {
    word: "KARAMA",
    arabic: "كرامة",
    category: "Values",
    meaning: "Dignity.",
    context: "A central value in Palestinian life and struggle — the insistence on living with dignity regardless of circumstance."
  },
  {
    word: "TATREEZ",
    arabic: "تطريز",
    category: "Culture",
    meaning: "Traditional Palestinian cross-stitch embroidery.",
    context: "Each region has distinct motifs and colors; tatreez patterns stitch village identity and women's stories into cloth, and are recognized by UNESCO."
  },
  {
    word: "MAQLUBA",
    arabic: "مقلوبة",
    category: "Culture",
    meaning: "'Upside-down' — a layered dish of rice, vegetables, and meat.",
    context: "Flipped dramatically onto the platter at family gatherings, maqluba is a beloved centerpiece of Palestinian cuisine."
  },
  {
    word: "AMAL",
    arabic: "أمل",
    category: "Values",
    meaning: "Hope.",
    context: "A word woven through Palestinian poetry and daily speech — the quiet engine of perseverance across generations."
  }
];