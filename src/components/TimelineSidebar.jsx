import { useState } from "react";
import { mapEvents } from "../lib/mapEvents";
import EventDetails from "@/components/EventDetails";

const DEFAULT = { lat: 31.9, lng: 35.2, zoom: 9 };

const timelineData = [
  {
    year: 1516,
    months: [
      {
        month: "August",
        events: [
          {
            title: "Ottoman Conquest of Palestine",
            type: "battle",
            coords: { lat: 36.3833, lng: 36.85, zoom: 7 },
            location: "Marj Dabiq, near Aleppo",
            startDate: "24/08/1516",
            endDate: "24/08/1516",
            category: "Military",
            tags: ["High Impact", "Regional", "Conflict"],
            status: "Concluded",
            description:
              "At the Battle of Marj Dabiq, Ottoman Sultan Selim I defeated the Mamluk Sultanate, bringing Palestine under Ottoman rule. This began four centuries of Ottoman administration over the region, shaping its governance, demographics, and religious institutions until WWI.",
            articles: [
              { title: "Battle of Marj Dabiq — Wikipedia", url: "https://en.wikipedia.org/wiki/Battle_of_Marj_Dabiq" },
              { title: "Ottoman Syria — Wikipedia", url: "https://en.wikipedia.org/wiki/Ottoman_Syria" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1799,
    months: [
      {
        month: "March",
        events: [
          {
            title: "Napoleon's Siege of Acre",
            type: "battle",
            coords: { lat: 32.9281, lng: 35.0818, zoom: 11 },
            location: "Acre (Akka), Palestine",
            startDate: "20/03/1799",
            endDate: "21/05/1799",
            category: "Military",
            tags: ["High Impact", "Regional", "Conflict"],
            status: "Concluded",
            description:
              "Napoleon Bonaparte's French army besieged the Ottoman-held coastal city of Acre as part of his Egyptian campaign. Defended by Ahmad Pasha al-Jazzar with British naval support, the city held out for over two months, forcing Napoleon's first major defeat and his retreat from the Levant.",
            articles: [
              { title: "Siege of Acre (1799) — Wikipedia", url: "https://en.wikipedia.org/wiki/Siege_of_Acre_(1799)" },
              { title: "Napoleon's invasion of Egypt and Syria — Britannica", url: "https://www.britannica.com/event/French-campaign-in-Egypt-and-Syria" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1834,
    months: [
      {
        month: "May",
        events: [
          {
            title: "Peasants' Revolt in Palestine",
            type: "battle",
            coords: { lat: 31.7683, lng: 35.2137, zoom: 8 },
            location: "Palestine (General)",
            startDate: "01/05/1834",
            endDate: "04/08/1834",
            category: "Political",
            tags: ["Revolution", "National", "Conflict"],
            status: "Concluded",
            description:
              "A widespread Arab uprising against the conscription and taxation policies of the Egyptian ruler Ibrahim Pasha, who controlled Palestine from 1831–1840. The revolt spread across Jerusalem, Hebron, Nablus, and Galilee, and is considered one of the earliest large-scale expressions of Palestinian collective political action.",
            articles: [
              { title: "Peasants' revolt in Palestine — Wikipedia", url: "https://en.wikipedia.org/wiki/Peasants%27_revolt_in_Palestine" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1882,
    months: [
      {
        month: "July",
        events: [
          {
            title: "First Aliyah Begins",
            type: "resolution",
            coords: { lat: 32.0853, lng: 34.7818, zoom: 9 },
            location: "Jaffa and surrounding areas, Palestine",
            startDate: "01/07/1882",
            endDate: "31/12/1903",
            category: "Social",
            tags: ["High Impact", "National"],
            status: "Concluded",
            description:
              "The First Aliyah marked the beginning of large-scale Zionist Jewish immigration to Ottoman Palestine, with around 25,000–35,000 immigrants — mostly from the Russian Empire and Yemen — arriving between 1882 and 1903. Settlements such as Rishon LeZion and Petah Tikva were established, marking the start of organized Zionist colonization.",
            articles: [
              { title: "First Aliyah — Wikipedia", url: "https://en.wikipedia.org/wiki/First_Aliyah" },
              { title: "Aliyah — Jewish Virtual Library", url: "https://www.jewishvirtuallibrary.org/aliyah-immigration-to-israel" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1897,
    months: [
      {
        month: "August",
        events: [
          {
            title: "First Zionist Congress",
            type: "resolution",
            coords: { lat: 47.5596, lng: 7.5886, zoom: 5 },
            location: "Basel, Switzerland",
            startDate: "29/08/1897",
            endDate: "31/08/1897",
            category: "Diplomatic",
            tags: ["High Impact", "National", "Reform"],
            status: "Concluded",
            description:
              "Convened by Theodor Herzl, the First Zionist Congress in Basel established the World Zionist Organization and adopted the Basel Program, which sought to create 'a home for the Jewish people in Palestine secured under public law.' This formalized political Zionism as a movement.",
            articles: [
              { title: "First Zionist Congress — Wikipedia", url: "https://en.wikipedia.org/wiki/First_Zionist_Congress" },
              { title: "Theodor Herzl and the Basel Program — Britannica", url: "https://www.britannica.com/topic/Zionism" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1909,
    months: [
      {
        month: "April",
        events: [
          {
            title: "Founding of Tel Aviv",
            type: "resolution",
            coords: { lat: 32.0853, lng: 34.7818, zoom: 12 },
            location: "Near Jaffa, Palestine",
            startDate: "11/04/1909",
            endDate: "11/04/1909",
            category: "Social",
            tags: ["Regional", "National"],
            status: "Concluded",
            description:
              "Sixty-six Jewish families gathered on the sand dunes north of Jaffa to allocate plots for a new neighborhood, originally called Ahuzat Bayit. It was renamed Tel Aviv in 1910 and became the first modern all-Jewish city in Palestine, growing rapidly during subsequent decades of immigration.",
            articles: [
              { title: "History of Tel Aviv — Wikipedia", url: "https://en.wikipedia.org/wiki/History_of_Tel_Aviv" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1915,
    months: [
      {
        month: "July",
        events: [
          {
            title: "McMahon–Hussein Correspondence",
            type: "resolution",
            coords: { lat: 21.4225, lng: 39.8262, zoom: 4 },
            location: "Cairo, Egypt and Mecca, Hejaz",
            startDate: "14/07/1915",
            endDate: "30/01/1916",
            category: "Diplomatic",
            tags: ["High Impact", "Regional", "Reform"],
            status: "Concluded",
            description:
              "A series of letters between Sharif Hussein of Mecca and British High Commissioner in Egypt Sir Henry McMahon, in which Britain pledged to support Arab independence — including Palestine, in Arab interpretation — in exchange for an Arab revolt against the Ottoman Empire. The promises were later contradicted by the Sykes–Picot Agreement and the Balfour Declaration.",
            articles: [
              { title: "McMahon–Hussein Correspondence — Wikipedia", url: "https://en.wikipedia.org/wiki/McMahon%E2%80%93Hussein_Correspondence" },
              { title: "The Hussein-McMahon Correspondence — Jewish Virtual Library", url: "https://www.jewishvirtuallibrary.org/the-hussein-mcmahon-correspondence" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1916,
    months: [
      {
        month: "May",
        events: [
          {
            title: "Sykes–Picot Agreement",
            type: "resolution",
            coords: { lat: 48.8566, lng: 2.3522, zoom: 4 },
            location: "London and Paris (secret agreement)",
            startDate: "16/05/1916",
            endDate: "16/05/1916",
            category: "Diplomatic",
            tags: ["High Impact", "Regional", "Crisis"],
            status: "Concluded",
            description:
              "A secret wartime agreement between Britain and France (with Russian assent) to partition the Ottoman Arab provinces into spheres of influence. Palestine was designated for international administration. When exposed in 1917, it revealed contradictions with promises made to the Arabs and shaped the post-WWI carving of the Middle East.",
            articles: [
              { title: "Sykes–Picot Agreement — Wikipedia", url: "https://en.wikipedia.org/wiki/Sykes%E2%80%93Picot_Agreement" },
              { title: "How the Sykes-Picot Agreement carved up the Middle East — BBC", url: "https://www.bbc.com/news/world-middle-east-36300224" },
            ],
          },
          {
            title: "Great Arab Revolt Begins",
            type: "battle",
            coords: { lat: 21.4225, lng: 39.8262, zoom: 5 },
            location: "Hejaz (Arabian Peninsula)",
            startDate: "10/06/1916",
            endDate: "25/10/1918",
            category: "Military",
            tags: ["High Impact", "Regional", "Revolution", "Conflict"],
            status: "Concluded",
            description:
              "Launched by Sharif Hussein of Mecca with British backing, the Arab Revolt aimed to establish an independent Arab state stretching from Aleppo to Aden. Arab forces, alongside the British, helped drive Ottoman forces out of the Hejaz, Transjordan, and Palestine, paving the way for the post-war reorganization of the region.",
            articles: [
              { title: "Arab Revolt — Wikipedia", url: "https://en.wikipedia.org/wiki/Arab_Revolt" },
              { title: "The Arab Revolt, 1916–18 — Imperial War Museum", url: "https://www.iwm.org.uk/history/the-arab-revolt-of-1916" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1917,
    months: [
      {
        month: "November",
        events: [
          {
            title: "Balfour Declaration",
            type: "resolution",
            coords: { lat: 51.5074, lng: -0.1278, zoom: 5 },
            location: "London, UK (Impacting Palestine)",
            startDate: "02/11/1917",
            endDate: "02/11/1917",
            category: "Diplomatic",
            tags: ["High Impact", "National", "Crisis"],
            status: "Concluded",
            description:
              'A public statement issued by the British government during WWI announcing support for the establishment of a "national home for the Jewish people" in Palestine, setting the stage for decades of geopolitical shifts and demographic changes.',
            articles: [
              { title: "Balfour Declaration — Wikipedia", url: "https://en.wikipedia.org/wiki/Balfour_Declaration" },
              { title: "Balfour Declaration — Britannica", url: "https://www.britannica.com/event/Balfour-Declaration" },
              { title: "100 years on: The Balfour Declaration explained — Al Jazeera", url: "https://www.aljazeera.com/news/2018/11/2/more-than-a-century-on-the-balfour-declaration-explained" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1936,
    months: [
      {
        month: "April",
        events: [
          {
            title: "The Great Arab Revolt",
            type: "battle",
            coords: { lat: 31.9, lng: 35.2, zoom: 8 },
            location: "Palestine (General)",
            startDate: "19/04/1936",
            endDate: "26/08/1939",
            category: "Political",
            tags: ["High Impact", "Revolution", "National", "Conflict"],
            status: "Concluded",
            description:
              "A massive nationalist uprising by Palestinian Arabs against the British administration, demanding independence and an end to open-ended Jewish immigration and land purchases. It deeply shaped Palestinian national identity and British policy.",
            articles: [
              { title: "1936–1939 Arab revolt in Palestine — Wikipedia", url: "https://en.wikipedia.org/wiki/1936%E2%80%931939_Arab_revolt_in_Palestine" },
              { title: "The Great Revolt of 1936-1939 — Institute for Palestine Studies", url: "https://www.palestine-studies.org/en/node/41961" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1947,
    months: [
      {
        month: "November",
        events: [
          {
            title: "UN General Assembly Resolution 181",
            type: "resolution",
            coords: { lat: 40.7128, lng: -74.006, zoom: 5 },
            location: "New York, USA",
            startDate: "29/11/1947",
            endDate: "29/11/1947",
            category: "Diplomatic",
            tags: ["High Impact", "National", "Reform"],
            status: "Concluded",
            description:
              "UN General Assembly Resolution 181 (II), adopted on November 29, 1947, recommended the partition of Mandatory Palestine into independent Arab and Jewish states, with a special international regime for Jerusalem. The plan, which passed with 33 votes in favor, 13 against, and 10 abstentions, sought to divide the territory, with the Jewish community accepting it and the Arab world rejecting it.",
            articles: [
              { title: "United Nations Partition Plan — Wikipedia", url: "https://en.wikipedia.org/wiki/United_Nations_Partition_Plan_for_Palestine" },
              { title: "UN Resolution 181 — UN", url: "https://www.un.org/unispal/document/auto-insert-185393/" },
            ],
          },
        ],
      },
      {
        month: "December",
        events: [
          {
            title: "Haifa Oil Refinery Massacre",
            type: "massacre",
            coords: { lat: 32.794, lng: 35.0423, zoom: 12 },
            location: "Haifa, Palestine",
            startDate: "30/12/1947",
            endDate: "30/12/1947",
            category: "Political",
            tags: ["Regional", "Conflict"],
            status: "Concluded",
            description:
              "A massacre occured in December 30, 1947 in the Haifa Oil Refinery in response to an attack conducted by Irgun terrorists threw two hand grenades at a gathering of Palestinians, resulting in 6 deaths and 42 injured. Palestinian day-labourers entered the complex and attacked Jewish workers, killing 39 and injuring 49, before being halted by the British Army and Palestine Police. Sources confirmed that Palestinian workers in the complex helped the Jews flee and hide from the attackers.",
            articles: [
              { title: "Haifa Oil Refinery massacre — Wikipedia", url: "https://en.wikipedia.org/wiki/Haifa_Oil_Refinery_massacre" },
            ],
          },
          {
            title: "Balad Al-Shaykh Massacre",
            type: "massacre",
            coords: { lat: 32.7667, lng: 35.05, zoom: 13 },
            location: "Balad Al-Shaykh village, Palestine",
            startDate: "31/12/1947",
            endDate: "01/01/1948",
            category: "Political",
            tags: ["High Impact", "Local", "Conflict"],
            status: "Concluded",
            description:
              "A massacre was conducted by the zionist paramilitary group Haganah in December 31, 1947, targeting Palestinians in the village of Balad Al-Shaykh, killing between 60 and 70 villagers in retaliation to the Haifa Oil Refinery Massacre. This event escalated matters to what would become the 1947-1948 Palestinian Civil War.",
            articles: [
              { title: "Balad al-Shaykh massacre — Wikipedia", url: "https://en.wikipedia.org/wiki/Balad_al-Shaykh_massacre" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1948,
    months: [
      {
        month: "February",
        events: [
          {
            title: "Khirbat Sa'sa' Massacre",
            type: "massacre",
            coords: { lat: 33.0333, lng: 35.3833, zoom: 13 },
            location: "Sa'Sa' village, Palestine",
            startDate: "14/02/1948",
            endDate: "15/02/1948",
            category: "Military",
            tags: ["Local", "Conflict"],
            status: "Concluded",
            description:
              "During the 1948 Palestine war, two massacres were perpetrated by Zionist forces in the Palestinian village of Sa'sa'. The first occurred on the night of 14-15 February 1948, when Palmach forces attacked the village killing approximately 60 people.",
            articles: [
              { title: "Sa'sa' massacre (1948) — Wikipedia", url: "https://en.wikipedia.org/wiki/Sa%27sa%27_massacre_(1948)" },
            ],
          },
        ],
      },
      {
        month: "March",
        events: [
          {
            title: "al-Husayniyah Massacre",
            type: "massacre",
            coords: { lat: 33.0167, lng: 35.5, zoom: 13 },
            location: "al-Husayniyah, Safad, Palestine",
            startDate: "13/03/1948",
            endDate: "16/03/1948",
            category: "Military",
            tags: ["Local", "Conflict"],
            status: "Concluded",
            description:
              "Palmach forces attacked the village of al-Husayniyah in the Safad subdistrict, destroying homes and resulting in the deaths of dozens of Palestinian villagers.",
            articles: [
              { title: "Al-Husayniyya — Palestine Remembered", url: "https://www.palestineremembered.com/Safad/al-Husayniyya/index.html" },
            ],
          },
          {
            title: "Cairo-Haifa Train Bombings",
            type: "battle",
            coords: { lat: 31.8947, lng: 34.8094, zoom: 11 },
            location: "Rehovot, Palestine and Binyamina, Palestine",
            startDate: "29/03/1948",
            endDate: "31/03/1948",
            category: "Military",
            tags: ["Local", "Conflict"],
            status: "Concluded",
            description:
              "During the 1948 Palestine war, on February 29 and again on March 31, the military coaches of the Cairo-Haifa train were mined by the Zionist militant group Lehi. In February 29, the mines killed 28 British soldiers and injured 35 others, and Lehi claimed the attack was in revenge for the Ben Yahuda Street Bombing in Jerusalem. On March 31, Lehi mined the train again, killing 40 Arab civilians and wounding 60.",
            articles: [
              { title: "Cairo–Haifa train bombings — Wikipedia", url: "https://en.wikipedia.org/wiki/Cairo%E2%80%93Haifa_train_bombings" },
            ],
          },
        ],
      },
      {
        month: "April",
        events: [
          {
            title: "Mishmar HaEmek Battle",
            type: "battle",
            coords: { lat: 32.6167, lng: 35.15, zoom: 12 },
            location: "Mishmar HaEmek area, Palestine",
            startDate: "04/04/1948",
            endDate: "15/04/1948",
            category: "Military",
            tags: ["Regional", "Conflict"],
            status: "Concluded",
            description:
              "The Arab Liberation Army launched an offensive against Mishmar HaEmek but was repelled by Haganah forces. The subsequent counter-offensive led to the depopulation of several surrounding Palestinian villages.",
            articles: [
              { title: "Battle of Mishmar HaEmek — Wikipedia", url: "https://en.wikipedia.org/wiki/Battle_of_Mishmar_HaEmek" },
            ],
          },
        ],
      },
      {
        month: "May",
        events: [
          {
            title: "Qadas Battle",
            type: "battle",
            coords: { lat: 33.1064, lng: 35.4711, zoom: 12 },
            location: "Qadas, Safad, Palestine",
            startDate: "14/05/1948",
            endDate: "15/05/1948",
            category: "Military",
            tags: ["Regional", "Conflict"],
            status: "Concluded",
            description:
              "A significant engagement near the Lebanese border during Operation Yiftach, detailed in the oral history of 'Ali Sa'id al-Mughrabi. Palmach forces captured the village on the night of May 14, 1948. However, Lebanese units crossed the border and mounted a heavy counteroffensive the next day, temporarily forcing the Zionist forces to withdraw.",
            articles: [
              { title: "Operation Yiftach — Wikipedia", url: "https://en.wikipedia.org/wiki/Operation_Yiftach" },
            ],
          },
        ],
      },
      {
        month: "December",
        events: [
          {
            title: "UN General Assembly Resolution 194",
            type: "resolution",
            coords: { lat: 40.7128, lng: -74.006, zoom: 5 },
            location: "New York, USA",
            startDate: "11/12/1948",
            endDate: "11/12/1948",
            category: "Diplomatic",
            tags: ["Reform", "High Impact", "National"],
            status: "Concluded",
            description:
              "Adopted near the end of the 1948 war, this resolution established the Conciliation Commission for Palestine. Most notably, Article 11 declared that refugees wishing to return to their homes and live at peace should be permitted to do so, laying the foundational international legal basis for the Palestinian Right of Return.",
            articles: [
              { title: "UN General Assembly Resolution 194 — Wikipedia", url: "https://en.wikipedia.org/wiki/United_Nations_General_Assembly_Resolution_194" },
              { title: "Resolution 194 — UNRWA", url: "https://www.unrwa.org/content/resolution-194" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1967,
    months: [
      {
        month: "June",
        events: [
          {
            title: "The Naksa (Six-Day War)",
            type: "battle",
            coords: { lat: 31.9, lng: 35.2, zoom: 10 },
            location: "Palestine (General)",
            startDate: "05/06/1967",
            endDate: "10/06/1967",
            category: "Military",
            tags: ["High Impact", "Regional", "Conflict", "Crisis"],
            status: "Concluded",
            description:
              "A brief but profoundly impactful war resulting in Israel occupying the West Bank, East Jerusalem, and the Gaza Strip. This event drastically redrew the map of control in the region and led to a second massive wave of Palestinian displacement.",
            articles: [
              { title: "Six-Day War — Wikipedia", url: "https://en.wikipedia.org/wiki/Six-Day_War" },
              { title: "The Naksa: How Israel occupied the whole of Palestine in 1967 — Al Jazeera", url: "https://www.aljazeera.com/news/2018/6/4/the-naksa-how-israel-occupied-the-whole-of-palestine-in-1967" },
              { title: "Six-Day War — Britannica", url: "https://www.britannica.com/event/Six-Day-War" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: 1987,
    months: [
      {
        month: "December",
        events: [
          {
            title: "First Intifada",
            type: "battle",
            coords: { lat: 31.9, lng: 35.2, zoom: 10 },
            location: "West Bank and Gaza Strip",
            startDate: "08/12/1987",
            endDate: "13/09/1993",
            category: "Social",
            tags: ["Revolution", "National", "Conflict"],
            status: "Concluded",
            description:
              "A sustained series of Palestinian protests and civil disobedience against the Israeli occupation of the West Bank and Gaza. It shifted the global conversation and led to significant grassroots mobilization.",
            articles: [
              { title: "First Intifada — Wikipedia", url: "https://en.wikipedia.org/wiki/First_Intifada" },
              { title: "The First Intifada, 30 years on — Al Jazeera", url: "https://www.aljazeera.com/news/2017/12/8/the-first-intifada-30-years-on" },
            ],
          },
        ],
      },
    ],
  },
];

function getEventDotClass(type) {
  switch (type) {
    case "battle":
      return "bg-timeline-event-battle";
    case "massacre":
      return "bg-timeline-event-massacre";
    case "resolution":
      return "bg-primary";
    default:
      return "bg-muted-foreground";
  }
}

export default function TimelineSidebar() {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filtered = timelineData
    .map((year) => ({
      ...year,
      months: year.months
        .map((m) => ({
          ...m,
          events: m.events.filter((e) =>
            e.title.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((m) => m.events.length > 0),
    }))
    .filter((y) => y.months.length > 0);

  const handleSelect = (event) => {
    mapEvents.flyTo(event.coords ?? DEFAULT);
    setSelectedEvent(event);
  };

  return (
    <>
      <aside className="absolute top-0 left-0 z-10 h-full w-72 overflow-y-auto bg-card/90 backdrop-blur-sm border-r border-border">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-3 border-b border-border">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <svg
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>

        <div className="p-3 space-y-4">
          {filtered.map((year) => (
            <div key={year.year}>
              <h2 className="text-2xl font-black text-timeline-year italic">
                {year.year}
              </h2>
              {year.months.map((month) => (
                <div key={month.month} className="mt-1.5 ml-1">
                  <h3 className="text-sm font-bold italic text-timeline-month">
                    {month.month}
                  </h3>
                  <div className="ml-1 border-l-2 border-timeline-border pl-2 space-y-0.5">
                    {month.events.map((event) => {
                      const isActive = selectedEvent?.title === event.title;
                      return (
                        <button
                          type="button"
                          key={event.title}
                          onClick={() => handleSelect(event)}
                          className={`w-full text-left flex items-center gap-1.5 cursor-pointer rounded px-1 py-0.5 transition-colors ${
                            isActive ? "bg-accent/50" : "hover:bg-accent/30"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${getEventDotClass(event.type)}`}
                          />
                          <span className="text-xs text-foreground leading-tight truncate">
                            {event.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}
