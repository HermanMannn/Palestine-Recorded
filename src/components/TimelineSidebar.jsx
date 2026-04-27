import { useState } from "react";
import { mapEvents } from "../lib/mapEvents";
import EventDetails from "@/components/EventDetails";

const DEFAULT = { lat: 31.9, lng: 35.2, zoom: 9 };

const timelineData = [
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
            coords: { lat: 31.9, lng: 35.2, zoom: 7 },
            location: "Palestine (General)",
            startDate: "05/06/1967",
            endDate: "10/06/1967",
            category: "Military",
            tags: ["High Impact", "Regional", "Conflict", "Crisis"],
            status: "Concluded",
            description:
              "A brief but profoundly impactful war resulting in Israel occupying the West Bank, East Jerusalem, and the Gaza Strip. This event drastically redrew the map of control in the region and led to a second massive wave of Palestinian displacement.",
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
            coords: { lat: 31.9, lng: 35.2, zoom: 8 },
            location: "West Bank and Gaza Strip",
            startDate: "08/12/1987",
            endDate: "13/09/1993",
            category: "Social",
            tags: ["Revolution", "National", "Conflict"],
            status: "Concluded",
            description:
              "A sustained series of Palestinian protests and civil disobedience against the Israeli occupation of the West Bank and Gaza. It shifted the global conversation and led to significant grassroots mobilization.",
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
