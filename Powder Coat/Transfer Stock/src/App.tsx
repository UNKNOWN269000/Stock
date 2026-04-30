import { useEffect, useState } from "react";
import logo from "../public/logo.png";

type IconName =
  | "menu"
  | "home"
  | "palette"
  | "arrow"
  | "chip"
  | "clock"
  | "alert"
  | "eye"
  | "chevron";

const navItems = [
  { label: "Mill Finish Transfer Stock", key: "transfer", icon: "arrow" as IconName },
  { label: "Production", key: "production", icon: "chip" as IconName },
  { label: "Pending", key: "pending", icon: "clock" as IconName },
  { label: "Damage", key: "damage", icon: "alert" as IconName },
  { label: "Overview", key: "overview", icon: "eye" as IconName },
];

const damageSubItems = [
  { label: "Scrap", key: "scrap" },
  { label: "Damage", key: "damage-entry" },
];

const MENU_LINK = "https://bucketstock.netlify.app/";

interface StockItem {
  bucketNo: string;
  profile: string;
  length: string;
  type: string;
  qty: string;
}

function Icon({ name, className = "" }: { name: IconName | "search" | "refresh"; className?: string }) {
  const shared = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "menu") {
    return (
      <svg {...shared}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg {...shared}>
        <path d="m3 10.8 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-6h4v6" />
      </svg>
    );
  }

  if (name === "palette") {
    return (
      <svg {...shared}>
        <path d="M12 3a9 9 0 0 0 0 18h1.2a2.2 2.2 0 0 0 1.5-3.8 1.3 1.3 0 0 1 .9-2.2H17a4 4 0 0 0 0-8h-.2A8.9 8.9 0 0 0 12 3Z" />
        <circle cx="7.8" cy="10" r=".7" />
        <circle cx="10.5" cy="7.5" r=".7" />
        <circle cx="14" cy="7.8" r=".7" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...shared}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "chip") {
    return (
      <svg {...shared}>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 2v3" />
        <path d="M15 2v3" />
        <path d="M9 19v3" />
        <path d="M15 19v3" />
        <path d="M2 9h3" />
        <path d="M2 15h3" />
        <path d="M19 9h3" />
        <path d="M19 15h3" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l4 2" />
      </svg>
    );
  }

  if (name === "alert") {
    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg {...shared}>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...shared}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...shared}>
        <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPowderOpen, setIsPowderOpen] = useState(true);
  const [isDamageOpen, setIsDamageOpen] = useState(true);
  const [activePage, setActivePage] = useState("transfer");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const API_URL =
    "https://script.google.com/macros/s/AKfycbyBZA20HB307KUBaQ0rwRR5f_Kr4Y0CY-gQdwteu3Z0wIEUeyZoM4U019H4JuL_5w5o/exec";

  const fetchStockData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();

      // Data is a 2D array: row 0 is headers, rest are values.
      // Headers: Bucket No, Extrusion date, Shift, Billet Batch No, Type,
      // Profile, Die No, Length, Qty, Surface, Aging Date, In Time, Out Time, Hardness
      const rows: any[][] = Array.isArray(raw) ? raw.slice(1) : [];

      const mapped: StockItem[] = rows
        .filter((r) => r && r.length > 0 && r[0] !== "" && r[0] !== null)
        // Only show stock that came from MF -> PC (Surface == "PC")
        .filter((r) => String(r[9] ?? "").toUpperCase() === "PC")
        .map((r) => ({
          bucketNo: String(r[0] ?? ""),
          profile: String(r[5] ?? ""),
          length: r[7] !== "" && r[7] != null ? `${r[7]} m` : "-",
          type: String(r[4] ?? ""),
          qty: String(r[8] ?? ""),
        }));

      setStockData(mapped);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
      setErrorMsg("Could not fetch stock data. Please try again.");
      setStockData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const filteredStock = stockData.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#050708] text-white selection:bg-[#ff5cff]/30 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-44 top-24 h-72 w-72 rounded-full bg-[#20e26a]/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#ff5cff]/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/12 bg-[#0b0f14]/95 backdrop-blur-xl">
        <div className="flex h-[72px] items-center gap-4 px-5 sm:px-6">
          <button
            aria-label="Toggle navigation menu"
            onClick={() => setIsSidebarOpen((open) => !open)}
            className="group grid h-11 w-11 place-items-center rounded-xl text-white transition hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-[#8cff9c]/70"
          >
            <Icon name="menu" className="h-7 w-7 transition group-hover:text-[#8cff9c]" />
          </button>

          <img
            src={logo}
            alt="Ultra Aluminium Logo"
            className="h-12 w-12 rounded-full border-2 border-[#8cff9c] bg-white object-contain shadow-[0_0_30px_rgba(49,255,112,0.18)]"
          />

          <div className="min-w-0">
            <p className="truncate text-xl font-black tracking-tight text-[#8cff9c] drop-shadow-[0_0_10px_rgba(140,255,156,0.25)]">
              ULTRA ALUMINIUM
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[calc(100vh-72px)]">
        <aside
          className={`fixed bottom-0 left-0 top-[72px] z-20 w-[300px] border-r border-white/12 bg-[#0c1015]/98 transition-transform duration-300 ease-out lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="h-full overflow-y-auto px-5 py-5">
            <a
              href={MENU_LINK}
              onClick={() => setActivePage("home")}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-sm font-bold transition ${
                activePage === "home"
                  ? "bg-[#2a2035] text-[#ff68ff]"
                  : "text-white hover:bg-white/6 hover:text-[#8cff9c]"
              }`}
            >
              <Icon name="home" className="h-6 w-6" />
              Home
            </a>

            <div className="mt-5">
              <button
                onClick={() => setIsPowderOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-white/6"
              >
                <span className="flex items-center gap-4">
                  <Icon name="palette" className="h-6 w-6" />
                  Powder Coat
                </span>
                <Icon
                  name="chevron"
                  className={`h-4 w-4 text-slate-300 transition ${isPowderOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`ml-6 overflow-hidden border-l border-white/15 transition-all duration-300 ${
                  isPowderOpen ? "mt-3 max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-1 pl-4">
                  {navItems.map((item) =>
                    item.key === "damage" ? (
                      <div key={item.key}>
                        <button
                          type="button"
                          aria-expanded={isDamageOpen}
                          onClick={() => {
                            setActivePage(item.key);
                            setIsDamageOpen((open) => !open);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                            activePage === item.key || activePage === "scrap" || activePage === "damage-entry"
                              ? "bg-white/[0.04] text-[#ff5cff]"
                              : "text-[#b9d7ea] hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon name={item.icon} className="h-4 w-4" />
                            {item.label}
                          </span>
                          <Icon
                            name="chevron"
                            className={`h-4 w-4 text-slate-400 transition ${isDamageOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        <div
                          className={`ml-5 overflow-hidden border-l border-white/10 transition-all duration-300 ${
                            isDamageOpen ? "mt-1 max-h-32 opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="space-y-1 pl-3">
                            {damageSubItems.map((subItem) => (
                              <a
                                key={subItem.key}
                                href={MENU_LINK}
                                onClick={() => setActivePage(subItem.key)}
                                className={`block rounded-lg px-4 py-2.5 text-left text-sm transition ${
                                  activePage === subItem.key
                                    ? "bg-white/[0.04] text-[#ff5cff]"
                                    : "text-[#b9d7ea] hover:bg-white/[0.04] hover:text-white"
                                }`}
                              >
                                {subItem.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <a
                        key={item.key}
                        href={MENU_LINK}
                        onClick={() => setActivePage(item.key)}
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                          activePage === item.key
                            ? "bg-white/[0.04] text-[#ff5cff]"
                            : "text-[#b9d7ea] hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {isSidebarOpen && (
          <button
            aria-label="Close menu overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[72px] z-10 bg-black/55 backdrop-blur-sm lg:hidden"
          />
        )}

        <main className="flex-1 overflow-x-hidden">
          <section className="mx-auto flex w-full max-w-[1200px] flex-col px-6 py-8 sm:px-8">
            <div className="mb-10 flex flex-col items-center gap-8 text-center">
              <div className="relative flex w-full max-w-2xl items-center gap-3 animate-rise">
                <div className="relative flex-1">
                  <Icon
                    name="search"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by bucket, profile, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-white/12 bg-[#0c1015]/80 pl-12 pr-4 text-white outline-none transition-all focus:border-[#8cff9c]/50 focus:bg-[#11171f] focus:ring-4 focus:ring-[#8cff9c]/5"
                  />
                </div>
                <button
                  onClick={fetchStockData}
                  disabled={isLoading}
                  aria-label="Refresh stock"
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/12 bg-[#0c1015]/80 text-[#8cff9c] transition hover:border-[#8cff9c]/50 hover:bg-[#11171f] disabled:opacity-50"
                >
                  <Icon
                    name="refresh"
                    className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              <div className="animate-rise" style={{ animationDelay: "100ms" }}>
                <h1 className="animate-soft-glow text-3xl font-black tracking-tight text-[#f8bcff] sm:text-4xl">
                  MF To PC Incoming Stock
                </h1>
                <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-[#ff5cff] to-transparent" />
                {!isLoading && !errorMsg && stockData.length > 0 && (
                  <p className="mt-3 text-sm text-slate-400">
                    Showing{" "}
                    <span className="font-bold text-[#8cff9c]">
                      {filteredStock.length}
                    </span>{" "}
                    of <span className="font-bold text-white">{stockData.length}</span> stock items
                  </p>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                {errorMsg}
              </div>
            )}

            <div
              className="animate-rise overflow-hidden rounded-3xl border border-white/12 bg-[#0c1015]/60 shadow-2xl backdrop-blur-sm"
              style={{ animationDelay: "200ms" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/[0.02]">
                      {["Bucket No", "Profile", "Length", "Type", "Qty"].map((head) => (
                        <th
                          key={head}
                          className="px-6 py-5 text-xs font-black uppercase tracking-[0.15em] text-[#8cff9c]"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#ff5cff] border-t-transparent" />
                          <p className="mt-4 text-sm font-medium text-slate-400">Loading stock data...</p>
                        </td>
                      </tr>
                    ) : filteredStock.length > 0 ? (
                      filteredStock.map((item, i) => (
                        <tr
                          key={i}
                          className="group transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="whitespace-nowrap px-6 py-5">
                            <span className="rounded-lg bg-white/5 px-3 py-1.5 text-sm font-bold text-white">
                              {item.bucketNo}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-black text-[#b8d0e5]">{item.profile}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-slate-300">{item.length}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              item.type.includes('Powder') ? 'bg-[#ff5cff]/10 text-[#ff5cff]' : 'bg-[#8cff9c]/10 text-[#8cff9c]'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-black text-white">{item.qty}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <p className="text-slate-400">No matching stock items found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
