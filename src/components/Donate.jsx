import { useState } from "react";
import Navbar from "./Navbar.jsx";

const CHARITIES = [
  {
    category: "Medical & Emergency Aid",
    items: [
      {
        name: "Medical Aid for Palestinians (MAP)",
        desc: "Provides medical supplies and healthcare services to Palestinians in need.",
        url: "https://www.map.org.uk/donate",
      },
      {
        name: "Palestine Children's Relief Fund (PCRF)",
        desc: "Focuses on medical care and humanitarian relief for children.",
        url: "https://www.pcrf.net/",
      },
      {
        name: "Tarahum for Gaza (International Charity Organization)",
        desc: "Delivers emergency aid and relief efforts in Gaza.",
        url: "https://ico.org.ae/en/tarahum-for-gaza",
      },
      {
        name: "Dubai Charity Association",
        desc: "Involved in 'Birds of Goodness' for airdropping aid into Gaza.",
        url: "https://www.dubaicharity.ae/",
      },
      {
        name: "Emirates Red Crescent",
        desc: "Provides diverse aid including housing and medical support.",
        url: "https://www.emiratesrc.ae/",
      },
    ],
  },
  {
    category: "Food & Essential Supplies",
    items: [
      {
        name: "Muslims Around The World (MATW)",
        desc: "Supplies food packs, meals, and blankets via local Gaza warehouses.",
        url: "https://matwproject.org/",
      },
      {
        name: "Palestine Aid",
        desc: "Focuses on psycho-social support and humanitarian aid, particularly for orphans.",
        url: "https://palestineaid.org/",
      },
    ],
  },
  {
    category: "Refugee & General Support",
    items: [
      {
        name: "UNRWA",
        desc: "Provides essential services to Palestinian refugees across the region.",
        url: "https://donate.unrwa.org/",
      },
      {
        name: "Save the Children",
        desc: "Provides support, shelter, and education for children affected by conflict.",
        url: "https://www.savethechildren.org/us/where-we-work/west-bank-gaza",
      },
      {
        name: "Together For Palestine Fund (Choose Love)",
        desc: "Supplies vital aid to displaced people in Gaza and the West Bank.",
        url: "https://choose.love/",
      },
    ],
  },
  {
    category: "Other Initiatives",
    items: [
      {
        name: "War Child UK",
        desc: "Focuses on protecting children in conflict zones.",
        url: "https://www.warchild.org.uk/",
      },
      {
        name: "PaliRoots",
        desc: "Brand that supports charity initiatives in Palestine.",
        url: "https://www.paliroots.com/",
      },
      {
        name: "Wear The Peace",
        desc: "Brand that supports charity initiatives in Palestine.",
        url: "https://wearthepeace.com/",
      },
    ],
  },
];

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

export default function Donate() {
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleDonate = (e) => {
    e.preventDefault();
    if (!selectedCharity) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const finalAmount = customAmount ? Number(customAmount) : amount;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Support Palestine</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a verified charity below and contribute any amount. This is a mock checkout —
            no payment will be processed.
          </p>
        </div>

        <form onSubmit={handleDonate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charity list */}
          <div className="lg:col-span-2 space-y-6">
            {CHARITIES.map((group) => (
              <section key={group.category}>
                <h2 className="text-lg font-semibold mb-3 text-primary">{group.category}</h2>
                <div className="space-y-3">
                  {group.items.map((c) => {
                    const active = selectedCharity === c.name;
                    return (
                      <label
                        key={c.name}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="charity"
                          value={c.name}
                          checked={active}
                          onChange={() => setSelectedCharity(c.name)}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">{c.name}</span>
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline"
                            >
                              Visit ↗
                            </a>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Donation panel */}
          <aside className="lg:sticky lg:top-6 h-fit bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 className="text-xl font-semibold">Your Donation</h3>

            <div>
              <label className="text-sm font-medium block mb-2">Amount (USD)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESET_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setAmount(a);
                      setCustomAmount("");
                    }}
                    className={`py-2 rounded-md border text-sm font-medium transition-colors ${
                      !customAmount && amount === a
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="text-sm">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Charity</span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {selectedCharity || "— Select one —"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">${finalAmount || 0}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedCharity || !finalAmount}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Donate ${finalAmount || 0}
            </button>

            {submitted && (
              <div className="text-sm bg-primary/10 text-primary border border-primary/30 rounded-md p-3">
                ✓ Thank you! Your mock donation of ${finalAmount} to {selectedCharity} was recorded.
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              This is a demo page. No real payment is processed. Use the "Visit ↗" link to donate
              directly on the charity's website.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}
