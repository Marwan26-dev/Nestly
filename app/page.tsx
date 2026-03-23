"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RawProperty = {
  id: number;
  name: string;
  market: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  monthlyRent: number;
  adr: number;
  occupancy: number;
  cleaningPerTurn: number;
  utilities: number;
  supplies: number;
  startupCost: number;
  description: string;
  imageUrl: string;
};

type Property = RawProperty & {
  revenue: number;
  platformFee: number;
  cleaningCost: number;
  turnovers: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueExpenseRatio: number;
  breakEvenAdr: number;
  paybackMonths: number;
};

// ─── Raw Data ─────────────────────────────────────────────────────────────────

const RAW: RawProperty[] = [
  // Chattanooga
  {
    id: 1,
    name: "Downtown Loft",
    market: "Chattanooga",
    address: "215 Market St, Chattanooga, TN",
    beds: 1, baths: 1, sqft: 650,
    monthlyRent: 1800, adr: 185, occupancy: 0.72,
    cleaningPerTurn: 85, utilities: 140, supplies: 60,
    startupCost: 12000,
    description: "Industrial-chic loft steps from the Tennessee Aquarium. High walkability score and strong weekend demand.",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=75",
  },
  {
    id: 2,
    name: "North Shore Cottage",
    market: "Chattanooga",
    address: "418 Tremont St, Chattanooga, TN",
    beds: 2, baths: 1, sqft: 950,
    monthlyRent: 2200, adr: 225, occupancy: 0.68,
    cleaningPerTurn: 100, utilities: 180, supplies: 75,
    startupCost: 15000,
    description: "Charming renovated cottage in the walkable North Shore neighborhood. Covered porch and private parking.",
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=75",
  },
  {
    id: 3,
    name: "Southside Bungalow",
    market: "Chattanooga",
    address: "820 McCallie Ave, Chattanooga, TN",
    beds: 3, baths: 2, sqft: 1400,
    monthlyRent: 2800, adr: 295, occupancy: 0.65,
    cleaningPerTurn: 130, utilities: 220, supplies: 90,
    startupCost: 20000,
    description: "Spacious bungalow near UTC campus and Finley Stadium. Perfect for groups visiting Chattanooga's outdoor attractions.",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=75",
  },
  // Savannah
  {
    id: 4,
    name: "Historic District Gem",
    market: "Savannah",
    address: "124 Bull St, Savannah, GA",
    beds: 2, baths: 1, sqft: 1100,
    monthlyRent: 2500, adr: 280, occupancy: 0.74,
    cleaningPerTurn: 110, utilities: 175, supplies: 80,
    startupCost: 18000,
    description: "Stunning antebellum flat on Savannah's most iconic street. Steps from Forsyth Park with original heart-pine floors.",
    imageUrl: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=75",
  },
  {
    id: 5,
    name: "Victorian Row House",
    market: "Savannah",
    address: "307 Jones St, Savannah, GA",
    beds: 3, baths: 2, sqft: 1600,
    monthlyRent: 3200, adr: 340, occupancy: 0.70,
    cleaningPerTurn: 140, utilities: 240, supplies: 95,
    startupCost: 24000,
    description: "Grand Victorian row house on one of Savannah's most photographed streets. Wraparound balcony and period details throughout.",
    imageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=75",
  },
  // Nashville
  {
    id: 6,
    name: "East Nashville Bungalow",
    market: "Nashville",
    address: "632 Forrest Ave, Nashville, TN",
    beds: 2, baths: 1, sqft: 1000,
    monthlyRent: 2800, adr: 310, occupancy: 0.76,
    cleaningPerTurn: 115, utilities: 185, supplies: 80,
    startupCost: 19000,
    description: "Hip bungalow in booming East Nashville. Walking distance to 5 Points bars, coffee shops, and the best brunch spots in the city.",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=75",
  },
  {
    id: 7,
    name: "Gulch Studio",
    market: "Nashville",
    address: "1100 Demonbreun St, Nashville, TN",
    beds: 1, baths: 1, sqft: 580,
    monthlyRent: 2200, adr: 250, occupancy: 0.78,
    cleaningPerTurn: 90, utilities: 130, supplies: 65,
    startupCost: 14000,
    description: "Sleek high-rise studio in the Gulch with rooftop pool access. Top occupancy performer thanks to proximity to Broadway.",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=75",
  },
  {
    id: 8,
    name: "The Nations Retreat",
    market: "Nashville",
    address: "5204 Centennial Blvd, Nashville, TN",
    beds: 3, baths: 2, sqft: 1500,
    monthlyRent: 3500, adr: 420, occupancy: 0.72,
    cleaningPerTurn: 145, utilities: 260, supplies: 100,
    startupCost: 28000,
    description: "Designer retreat in The Nations — Nashville's fastest-growing neighborhood. Hot tub, game room, and stylish interiors drive premium ADR.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=75",
  },
  // Scottsdale
  {
    id: 9,
    name: "Old Town Casita",
    market: "Scottsdale",
    address: "7340 E Shoeman Ln, Scottsdale, AZ",
    beds: 1, baths: 1, sqft: 700,
    monthlyRent: 2400, adr: 290, occupancy: 0.68,
    cleaningPerTurn: 100, utilities: 200, supplies: 70,
    startupCost: 16000,
    description: "Breezy Spanish casita one block from Old Town's restaurant row. Private courtyard with heated plunge pool.",
    imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=75",
  },
  {
    id: 10,
    name: "Desert Modern Villa",
    market: "Scottsdale",
    address: "9820 N Pima Rd, Scottsdale, AZ",
    beds: 3, baths: 2, sqft: 1800,
    monthlyRent: 4200, adr: 520, occupancy: 0.65,
    cleaningPerTurn: 160, utilities: 340, supplies: 110,
    startupCost: 32000,
    description: "Architectural gem with panoramic McDowell Mountain views. Infinity pool, outdoor kitchen, and Tesla EV charger command top-tier nightly rates.",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=75",
  },
  // Knoxville
  {
    id: 11,
    name: "Old City Flat",
    market: "Knoxville",
    address: "126 S Gay St, Knoxville, TN",
    beds: 1, baths: 1, sqft: 620,
    monthlyRent: 1500, adr: 160, occupancy: 0.70,
    cleaningPerTurn: 80, utilities: 120, supplies: 55,
    startupCost: 10000,
    description: "Exposed-brick flat in Knoxville's lively Old City arts district. Easy walk to UT games, Market Square, and the Tennessee Theatre.",
    imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=75",
  },
  {
    id: 12,
    name: "Market Square Studio",
    market: "Knoxville",
    address: "28 Market Square, Knoxville, TN",
    beds: 2, baths: 1, sqft: 890,
    monthlyRent: 2000, adr: 210, occupancy: 0.72,
    cleaningPerTurn: 95, utilities: 155, supplies: 70,
    startupCost: 13500,
    description: "Loft-style studio above the best farmers market in Tennessee. Front-row views of outdoor concerts and festivals.",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=75",
  },
];

// ─── Computed Financials ──────────────────────────────────────────────────────

function computeFinancials(p: RawProperty): Property {
  const revenue = Math.round(p.adr * 30 * p.occupancy);
  const turnovers = Math.round(p.occupancy * 30 / 3);
  const cleaningCost = turnovers * p.cleaningPerTurn;
  const platformFee = Math.round(revenue * 0.03);
  const totalExpenses = p.monthlyRent + cleaningCost + platformFee + p.utilities + p.supplies;
  const netProfit = revenue - totalExpenses;
  const profitMargin = netProfit / revenue;
  const revenueExpenseRatio = revenue / totalExpenses;
  // Break-even ADR: revenue needed = totalExpenses - netProfit variable components
  // Fixed costs per month = rent + utilities + supplies
  // Variable = cleaning (per turn) + platform (3% of revenue)
  // turns = occupancy*30/3 = 10*occupancy → adr-independent, so cleaning is fixed per month
  // 0 = adr*30*occ*(1-0.03) - cleaning_cost - (rent+utilities+supplies)
  const fixedMonthly = p.monthlyRent + cleaningCost + p.utilities + p.supplies;
  const breakEvenAdr = Math.round(fixedMonthly / (30 * p.occupancy * 0.97));
  const paybackMonths = p.startupCost / netProfit;

  return {
    ...p,
    revenue,
    turnovers,
    cleaningCost,
    platformFee,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueExpenseRatio,
    breakEvenAdr,
    paybackMonths,
  };
}

const PROPERTIES: Property[] = RAW.map(computeFinancials);
const MARKETS = ["All", ...Array.from(new Set(RAW.map((p) => p.market)))];

// ─── Expense Overrides (editable per-property) ────────────────────────────────

type ExpenseOverrides = {
  monthlyRent: number;
  cleaningPerTurn: number;
  platformFeeRate: number; // percentage, e.g. 3 = 3%
  utilities: number;
  wifi: number;
  insurance: number;
  supplies: number;
  furnishingAmortization: number;
  maintenanceReserve: number;
};

function getDefaultOverrides(p: RawProperty): ExpenseOverrides {
  return {
    monthlyRent: p.monthlyRent,
    cleaningPerTurn: p.cleaningPerTurn,
    platformFeeRate: 3,
    utilities: p.utilities,
    wifi: 50,
    insurance: Math.round(p.monthlyRent * 0.025),
    supplies: p.supplies,
    furnishingAmortization: Math.round(p.startupCost / 24),
    maintenanceReserve: 75,
  };
}

type ComputedFinancials = {
  revenue: number;
  turnovers: number;
  cleaningCost: number;
  platformFee: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueExpenseRatio: number;
  breakEvenAdr: number;
  paybackMonths: number;
};

function computeWithOverrides(p: RawProperty, ov: ExpenseOverrides): ComputedFinancials {
  const revenue = Math.round(p.adr * 30 * p.occupancy);
  const turnovers = Math.round((p.occupancy * 30) / 3);
  const cleaningCost = turnovers * ov.cleaningPerTurn;
  const platformFee = Math.round(revenue * (ov.platformFeeRate / 100));
  const totalExpenses =
    ov.monthlyRent + cleaningCost + platformFee +
    ov.utilities + ov.wifi + ov.insurance +
    ov.supplies + ov.furnishingAmortization + ov.maintenanceReserve;
  const netProfit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? netProfit / revenue : 0;
  const revenueExpenseRatio = totalExpenses > 0 ? revenue / totalExpenses : 0;
  const fixedMonthly =
    ov.monthlyRent + cleaningCost +
    ov.utilities + ov.wifi + ov.insurance +
    ov.supplies + ov.furnishingAmortization + ov.maintenanceReserve;
  const platformFactor = 1 - ov.platformFeeRate / 100;
  const breakEvenAdr =
    platformFactor > 0
      ? Math.round(fixedMonthly / (30 * p.occupancy * platformFactor))
      : 0;
  const paybackMonths = netProfit > 0 ? p.startupCost / netProfit : Infinity;
  return {
    revenue, turnovers, cleaningCost, platformFee, totalExpenses,
    netProfit, profitMargin, revenueExpenseRatio, breakEvenAdr, paybackMonths,
  };
}

function useExpenseOverrides(propertyId: number, defaults: ExpenseOverrides) {
  const key = `nestly_expenses_v1_${propertyId}`;
  const [overrides, setOverrides] = useState<ExpenseOverrides>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return defaults;
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(overrides)); } catch { /* ignore */ }
  }, [key, overrides]);

  const set = useCallback(
    <K extends keyof ExpenseOverrides>(field: K, val: ExpenseOverrides[K]) =>
      setOverrides((prev) => ({ ...prev, [field]: val })),
    []
  );

  const reset = useCallback(() => setOverrides(defaults), [defaults]);

  return { overrides, set, reset };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const marketColors: Record<string, string> = {
  Chattanooga: "#10b981",
  Savannah: "#34d399",
  Nashville: "#6ee7b7",
  Scottsdale: "#a7f3d0",
  Knoxville: "#059669",
};

// ─── Seasonal Forecast ────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Demand multipliers per market type — normalized so annual avg = 1.0
const SEASONAL_PROFILES: Record<string, number[]> = {
  // Southern tourist: peak spring (Apr) and fall (Oct), quiet mid-summer and January
  southern: [0.76, 0.83, 1.11, 1.23, 1.19, 0.93, 0.89, 0.86, 1.09, 1.26, 1.06, 0.81],
  // Desert: peak Jan–Mar (snowbirds + spring training), very slow Jun–Aug (extreme heat)
  desert:   [1.30, 1.36, 1.33, 1.12, 0.87, 0.59, 0.53, 0.55, 0.80, 1.06, 1.22, 1.26],
};

function getSeasonalProfile(market: string): number[] {
  if (market === "Scottsdale") return SEASONAL_PROFILES.desert;
  return SEASONAL_PROFILES.southern;
}

type MonthData = { month: string; revenue: number; expenses: number; net: number };

function computeMonthlyForecast(property: RawProperty, ov: ExpenseOverrides): MonthData[] {
  const profile = getSeasonalProfile(property.market);
  const baseRevenue = Math.round(property.adr * 30 * property.occupancy);
  const baseTurnovers = Math.round((property.occupancy * 30) / 3);
  const fixed =
    ov.monthlyRent + ov.utilities + ov.wifi + ov.insurance +
    ov.supplies + ov.furnishingAmortization + ov.maintenanceReserve;
  return profile.map((mult, i) => {
    const revenue = Math.round(baseRevenue * mult);
    const cleaning = Math.round(baseTurnovers * mult) * ov.cleaningPerTurn;
    const platform = Math.round(revenue * (ov.platformFeeRate / 100));
    const expenses = fixed + cleaning + platform;
    return { month: MONTH_NAMES[i], revenue, expenses, net: revenue - expenses };
  });
}

function ForecastChart({ property, overrides }: { property: RawProperty; overrides: ExpenseOverrides }) {
  const months = computeMonthlyForecast(property, overrides);
  const profits = months.map((m) => m.net);
  const annualNet = profits.reduce((s, v) => s + v, 0);
  const annualRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const annualExpenses = months.reduce((s, m) => s + m.expenses, 0);
  const bestIdx = profits.indexOf(Math.max(...profits));
  const worstIdx = profits.indexOf(Math.min(...profits));

  // SVG bar chart dimensions
  const W = 420, H = 140;
  const padL = 54, padR = 8, padT = 12, padB = 22;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const slotW = chartW / 12;
  const barW = slotW * 0.68;

  const maxVal = Math.max(0, ...profits);
  const minVal = Math.min(0, ...profits);
  const range = maxVal - minVal || 1;
  const zeroY = padT + chartH * (maxVal / range);

  const yTicks = [maxVal, 0, ...(minVal < 0 ? [minVal] : [])];

  return (
    <div>
      <h3
        className="font-heading text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: "#555" }}
      >
        12-Month Forecast
      </h3>

      {/* Summary pills */}
      <div className="flex gap-2 mb-4">
        {[
          { label: "Annual Net", value: fmt(annualNet), color: annualNet >= 0 ? "#10b981" : "#f59e0b" },
          { label: "Peak Month", value: `${MONTH_NAMES[bestIdx]}  ${fmt(profits[bestIdx])}`, color: "#34d399" },
          { label: "Slow Month", value: `${MONTH_NAMES[worstIdx]}  ${fmt(profits[worstIdx])}`, color: profits[worstIdx] < 0 ? "#f87171" : "#888" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 rounded-lg p-2.5" style={{ background: "#1a1a1a" }}>
            <p className="text-xs mb-0.5" style={{ color: "#555" }}>{label}</p>
            <p className="font-mono-nums font-semibold" style={{ color, fontSize: 11 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid #1e1e1e", background: "#0a0a0a" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          {/* Grid line at zero */}
          <line x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} stroke="#2a2a2a" strokeWidth={1} />

          {/* Y-axis ticks */}
          {yTicks.map((val) => {
            const y = padT + chartH * ((maxVal - val) / range);
            const label = Math.abs(val) >= 1000
              ? `${val < 0 ? "-" : ""}$${(Math.abs(val) / 1000).toFixed(1)}k`
              : `$${val}`;
            return (
              <g key={val}>
                <line x1={padL - 3} y1={y} x2={padL} y2={y} stroke="#333" strokeWidth={1} />
                <text x={padL - 6} y={y + 3.5} textAnchor="end"
                  style={{ fontSize: 8, fill: "#555", fontFamily: "var(--font-jetbrains)" }}>
                  {label}
                </text>
              </g>
            );
          })}

          {/* Bars + month labels */}
          {months.map((m, i) => {
            const barH = Math.max(2, (Math.abs(m.net) / range) * chartH);
            const x = padL + i * slotW + (slotW - barW) / 2;
            const y = m.net >= 0 ? zeroY - barH : zeroY;
            const color = m.net >= 0 ? "#10b981" : "#f87171";
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH} fill={color} rx={2} opacity={0.85} />
                <text
                  x={padL + i * slotW + slotW / 2}
                  y={H - 5}
                  textAnchor="middle"
                  style={{ fontSize: 8, fill: "#555", fontFamily: "var(--font-outfit)" }}
                >
                  {m.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Monthly breakdown table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e1e" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#0f0f0f" }}>
              {["Month", "Revenue", "Expenses", "Net"].map((h, hi) => (
                <th key={h} style={{
                  padding: "8px 10px",
                  textAlign: hi === 0 ? "left" : "right",
                  color: "#555", fontWeight: 600, fontSize: 10,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  fontFamily: "var(--font-outfit)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((m, i) => (
              <tr key={i} style={{ borderTop: "1px solid #1a1a1a", background: i % 2 ? "#0d0d0d" : "transparent" }}>
                <td style={{ padding: "5px 10px", color: "#aaa", fontFamily: "var(--font-outfit)" }}>{m.month}</td>
                <td className="font-mono-nums" style={{ padding: "5px 10px", textAlign: "right", color: "#777" }}>{fmt(m.revenue)}</td>
                <td className="font-mono-nums" style={{ padding: "5px 10px", textAlign: "right", color: "#555" }}>{fmt(m.expenses)}</td>
                <td className="font-mono-nums" style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600,
                  color: m.net >= 0 ? "#10b981" : "#f87171" }}>{fmt(m.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid #2a2a2a", background: "#0f0f0f" }}>
              <td style={{ padding: "7px 10px", color: "#666", fontWeight: 700, fontSize: 11, fontFamily: "var(--font-outfit)" }}>Annual</td>
              <td className="font-mono-nums" style={{ padding: "7px 10px", textAlign: "right", color: "#888", fontWeight: 600 }}>{fmt(annualRevenue)}</td>
              <td className="font-mono-nums" style={{ padding: "7px 10px", textAlign: "right", color: "#666", fontWeight: 600 }}>{fmt(annualExpenses)}</td>
              <td className="font-mono-nums" style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700,
                color: annualNet >= 0 ? "#34d399" : "#f87171" }}>{fmt(annualNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Filter state ─────────────────────────────────────────────────────────────

type Filters = {
  market: string;
  minProfit: number;
  maxRent: number;
  beds: number;
  sortBy: string;
};

const DEFAULT_FILTERS: Filters = {
  market: "All",
  minProfit: 0,
  maxRent: 999999,
  beds: 0,
  sortBy: "profit-desc",
};

// ─── PropertyCard ─────────────────────────────────────────────────────────────

function PropertyCard({
  property,
  selected,
  onClick,
}: {
  property: Property;
  selected: boolean;
  onClick: () => void;
}) {
  const profitColor =
    property.netProfit >= 2000 ? "#34d399" : property.netProfit >= 1000 ? "#10b981" : "#f59e0b";

  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-xl overflow-hidden border transition-all duration-200"
      style={{
        background: selected ? "#111d16" : "#111111",
        borderColor: selected ? "#10b981" : "#222222",
        boxShadow: selected ? "0 0 0 1px #10b981" : "none",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient scrim */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
          }}
        />
        {/* Market badge — top left */}
        <span
          className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: `${marketColors[property.market]}22`,
            color: marketColors[property.market],
            backdropFilter: "blur(6px)",
            border: `1px solid ${marketColors[property.market]}44`,
          }}
        >
          {property.market}
        </span>
        {/* Profit badge — bottom left, overlaid on image */}
        <div className="absolute bottom-3 left-3">
          <div
            className="rounded-lg px-3 py-1.5 flex items-baseline gap-1"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          >
            <span
              className="font-mono-nums text-2xl font-bold tracking-tight"
              style={{ color: profitColor }}
            >
              {fmt(property.netProfit)}
            </span>
            <span className="text-xs" style={{ color: "#888" }}>
              /mo net
            </span>
          </div>
        </div>
        {/* Beds/baths/sqft — bottom right */}
        <span
          className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded"
          style={{ background: "rgba(0,0,0,0.65)", color: "#bbb", backdropFilter: "blur(6px)" }}
        >
          {property.beds}bd · {property.baths}ba · {property.sqft.toLocaleString()} sqft
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Property name */}
        <h3
          className="font-heading text-base font-semibold leading-snug mb-1"
          style={{ color: "#f0f0f0" }}
        >
          {property.name}
        </h3>

        {/* Address */}
        <p className="text-xs mb-2.5" style={{ color: "#555" }}>
          {property.address}
        </p>

        {/* Description */}
        <p
          className="text-sm leading-relaxed mb-3"
          style={{
            color: "#888",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {property.description}
        </p>

        {/* Key stats row */}
        <div
          className="grid grid-cols-3 gap-2 pt-3"
          style={{ borderTop: "1px solid #1e1e1e" }}
        >
          <Stat label="ADR" value={`$${property.adr}`} />
          <Stat label="Occupancy" value={pct(property.occupancy)} />
          <Stat label="Rent" value={fmt(property.monthlyRent)} />
        </div>
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "#555" }}>
        {label}
      </p>
      <p className="font-mono-nums text-sm font-medium" style={{ color: "#ccc" }}>
        {value}
      </p>
    </div>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────

const TONES = ["Data-Driven", "Relationship", "Direct"] as const;
type Tone = (typeof TONES)[number];

function DetailPanel({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  // ── Expense overrides (editable, localStorage-persisted) ──────────────────
  const defaults = useMemo(() => getDefaultOverrides(property), [property]);
  const { overrides, set, reset } = useExpenseOverrides(property.id, defaults);
  const computed = useMemo(() => computeWithOverrides(property, overrides), [property, overrides]);

  const hasCustom = useMemo(
    () => (Object.keys(defaults) as (keyof ExpenseOverrides)[]).some((k) => overrides[k] !== defaults[k]),
    [defaults, overrides]
  );

  const profitColor =
    computed.netProfit >= 2000 ? "#34d399" :
    computed.netProfit >= 1000 ? "#10b981" : "#f59e0b";

  const [activeTone, setActiveTone] = useState<Tone | null>(null);
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generatePitch(tone: Tone) {
    setActiveTone(tone);
    setPitch("");
    setLoading(true);
    setCopied(false);

    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone,
          name: property.name,
          address: property.address,
          market: property.market,
          beds: property.beds,
          baths: property.baths,
          monthlyRent: overrides.monthlyRent,
          revenue: computed.revenue,
          netProfit: computed.netProfit,
          adr: property.adr,
          occupancy: property.occupancy,
          profitMargin: computed.profitMargin,
          breakEvenAdr: computed.breakEvenAdr,
          paybackMonths: computed.paybackMonths,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to generate pitch");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setPitch((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setPitch("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyPitch() {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto flex flex-col"
        style={{
          width: "min(480px, 100vw)",
          background: "#111111",
          borderLeft: "1px solid #222",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-start justify-between p-6 pb-5"
          style={{ background: "#111111", borderBottom: "1px solid #1e1e1e" }}
        >
          <div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
              style={{
                background: `${marketColors[property.market]}18`,
                color: marketColors[property.market],
              }}
            >
              {property.market}
            </span>
            <h2
              className="font-heading text-xl font-bold leading-tight"
              style={{ color: "#f0f0f0" }}
            >
              {property.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#666" }}>
              {property.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#1e1e1e]"
            style={{ color: "#666" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: "#888" }}>
            {property.description}
          </p>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Beds", value: `${property.beds}` },
              { label: "Baths", value: `${property.baths}` },
              { label: "Sq Ft", value: property.sqft.toLocaleString() },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg p-3 text-center"
                style={{ background: "#1a1a1a" }}
              >
                <p
                  className="font-mono-nums text-lg font-semibold"
                  style={{ color: "#f0f0f0" }}
                >
                  {value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* P&L Breakdown — editable */}
          <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-heading text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#555" }}
              >
                Monthly P&L
              </h3>
              <div className="flex items-center gap-2">
                {hasCustom && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{ background: "#0d1a14", color: "#10b981", border: "1px solid #1a3a28" }}
                  >
                    customized
                  </span>
                )}
                <button
                  onClick={reset}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{
                    background: "transparent",
                    color: hasCustom ? "#10b981" : "#333",
                    border: `1px solid ${hasCustom ? "#1a3a28" : "#222"}`,
                    cursor: hasCustom ? "pointer" : "default",
                  }}
                >
                  Reset to defaults
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e1e" }}>
              {/* Revenue (read-only) */}
              <PLRow
                label="Gross Revenue"
                value={fmt(computed.revenue)}
                valueColor="#f0f0f0"
                sublabel={`$${property.adr} ADR × 30 days × ${pct(property.occupancy)} occ`}
                topBorder={false}
              />

              {/* Editable expenses */}
              <div style={{ background: "#0d0d0d" }}>
                <div
                  className="flex items-center justify-between px-4 pt-3 pb-1.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#444" }}>
                    Expenses — edit to match your deal
                  </p>
                  <p className="text-xs font-mono" style={{ color: "#e55" }}>
                    − {fmt(computed.totalExpenses)}
                  </p>
                </div>

                <EditableExpenseRow
                  label="Monthly Rent"
                  value={overrides.monthlyRent}
                  recommended={defaults.monthlyRent}
                  onChange={(v) => set("monthlyRent", v)}
                />
                <EditableExpenseRow
                  label="Platform Fee"
                  sublabel={`${fmt(computed.platformFee)}/mo at current rate`}
                  value={overrides.platformFeeRate}
                  recommended={defaults.platformFeeRate}
                  isPercent
                  onChange={(v) => set("platformFeeRate", v)}
                />
                <EditableExpenseRow
                  label="Cleaning Cost per Turnover"
                  sublabel={`${computed.turnovers} turns/mo → ${fmt(computed.cleaningCost)}`}
                  value={overrides.cleaningPerTurn}
                  recommended={defaults.cleaningPerTurn}
                  onChange={(v) => set("cleaningPerTurn", v)}
                />
                <EditableExpenseRow
                  label="Utilities"
                  value={overrides.utilities}
                  recommended={defaults.utilities}
                  onChange={(v) => set("utilities", v)}
                />
                <EditableExpenseRow
                  label="WiFi"
                  value={overrides.wifi}
                  recommended={defaults.wifi}
                  onChange={(v) => set("wifi", v)}
                />
                <EditableExpenseRow
                  label="Insurance"
                  value={overrides.insurance}
                  recommended={defaults.insurance}
                  onChange={(v) => set("insurance", v)}
                />
                <EditableExpenseRow
                  label="Supplies & Toiletries"
                  value={overrides.supplies}
                  recommended={defaults.supplies}
                  onChange={(v) => set("supplies", v)}
                />
                <EditableExpenseRow
                  label="Furnishing Amortization"
                  sublabel={`${fmt(property.startupCost)} startup ÷ 24 mo`}
                  value={overrides.furnishingAmortization}
                  recommended={defaults.furnishingAmortization}
                  onChange={(v) => set("furnishingAmortization", v)}
                />
                <EditableExpenseRow
                  label="Maintenance Reserve"
                  value={overrides.maintenanceReserve}
                  recommended={defaults.maintenanceReserve}
                  onChange={(v) => set("maintenanceReserve", v)}
                />
              </div>

              {/* Net Profit */}
              <div className="px-4 py-4" style={{ background: "#0d1a14", borderTop: "1px solid #1e1e1e" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-heading font-bold text-sm" style={{ color: "#10b981" }}>
                      Net Profit
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: "#2d6b4a" }}>
                      {pct(computed.profitMargin)} margin · {computed.revenueExpenseRatio.toFixed(2)}× ratio
                    </p>
                  </div>
                  <span className="font-mono-nums text-2xl font-bold" style={{ color: profitColor }}>
                    {fmt(computed.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div>
            <h3
              className="font-heading text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#555" }}
            >
              Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Profit Margin"
                value={pct(computed.profitMargin)}
                sub="of gross revenue"
                highlight={computed.profitMargin >= 0.25}
              />
              <MetricCard
                label="Rev / Expense Ratio"
                value={computed.revenueExpenseRatio.toFixed(2)}
                sub="revenue per $1 spent"
                highlight={computed.revenueExpenseRatio >= 1.3}
              />
              <MetricCard
                label="Break-even ADR"
                value={`$${computed.breakEvenAdr}`}
                sub={`vs $${property.adr} current`}
                highlight={computed.breakEvenAdr < property.adr * 0.75}
              />
              <MetricCard
                label="ADR Cushion"
                value={pct((property.adr - computed.breakEvenAdr) / property.adr)}
                sub="before losing money"
                highlight={(property.adr - computed.breakEvenAdr) / property.adr >= 0.25}
              />
            </div>
          </div>

          {/* Investment */}
          <div>
            <h3
              className="font-heading text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#555" }}
            >
              Investment
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Startup Cost"
                value={fmt(property.startupCost)}
                sub="furnishing + setup"
              />
              <MetricCard
                label="Payback Period"
                value={
                  computed.paybackMonths === Infinity
                    ? "∞"
                    : `${computed.paybackMonths.toFixed(1)} mo`
                }
                sub={
                  computed.paybackMonths === Infinity
                    ? "not profitable yet"
                    : `≈ ${(computed.paybackMonths / 12).toFixed(1)} years`
                }
                highlight={computed.paybackMonths > 0 && computed.paybackMonths <= 18}
              />
            </div>
          </div>

          {/* 12-Month Forecast */}
          <ForecastChart property={property} overrides={overrides} />

          {/* Landlord Pitch Generator */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="font-heading text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#555" }}
              >
                Landlord Pitch Generator
              </h3>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono-nums"
                style={{ background: "#1a1a1a", color: "#444", fontSize: 10 }}
              >
                AI
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#444" }}>
              Generate a personalized email pitch for this property's landlord.
            </p>

            {/* Tone buttons */}
            <div className="flex gap-2 mb-4">
              {TONES.map((tone) => {
                const isActive = activeTone === tone;
                const isThisLoading = loading && activeTone === tone;
                return (
                  <button
                    key={tone}
                    onClick={() => generatePitch(tone)}
                    disabled={loading}
                    className="flex-1 text-xs font-semibold py-2.5 rounded-lg transition-all"
                    style={{
                      background: isActive ? "#10b981" : "#1a1a1a",
                      color: isActive ? "#000" : "#888",
                      border: `1px solid ${isActive ? "#10b981" : "#2a2a2a"}`,
                      opacity: loading && !isThisLoading ? 0.4 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isThisLoading ? "···" : tone}
                  </button>
                );
              })}
            </div>

            {/* Output area */}
            {(pitch || loading) && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #1e1e1e" }}
              >
                {/* Output header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a" }}
                >
                  <span className="text-xs font-semibold" style={{ color: "#555" }}>
                    {activeTone} Tone
                    {loading && (
                      <span style={{ color: "#10b981" }}> · Generating…</span>
                    )}
                  </span>
                  {pitch && !loading && (
                    <button
                      onClick={copyPitch}
                      className="text-xs px-2.5 py-1 rounded-md transition-colors"
                      style={{
                        background: copied ? "#0d1a14" : "#1a1a1a",
                        color: copied ? "#34d399" : "#888",
                        border: `1px solid ${copied ? "#1a3a28" : "#2a2a2a"}`,
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>

                {/* Email text */}
                <div
                  className="p-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    color: "#ccc",
                    background: "#0a0a0a",
                    minHeight: 120,
                    fontFamily: "inherit",
                    maxHeight: 420,
                    overflowY: "auto",
                  }}
                >
                  {pitch || (
                    <span style={{ color: "#333" }}>
                      {"▌"}
                    </span>
                  )}
                  {loading && pitch && (
                    <span
                      className="inline-block w-0.5 h-3.5 ml-0.5 align-middle"
                      style={{ background: "#10b981", animation: "pulse 1s infinite" }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function PLRow({
  label,
  value,
  valueColor,
  sublabel,
  topBorder = true,
  indent = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  sublabel?: string;
  topBorder?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 ${indent ? "pl-6" : ""}`}
      style={{
        borderTop: topBorder ? "1px solid #1e1e1e" : undefined,
      }}
    >
      <div>
        <p className="text-sm" style={{ color: indent ? "#888" : "#aaa" }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ color: "#555" }}>
            {sublabel}
          </p>
        )}
      </div>
      <p
        className="font-mono-nums text-sm font-medium ml-4 flex-shrink-0"
        style={{ color: valueColor ?? "#f0f0f0" }}
      >
        {value}
      </p>
    </div>
  );
}

function EditableExpenseRow({
  label,
  sublabel,
  value,
  recommended,
  isPercent = false,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  recommended: number;
  isPercent?: boolean;
  onChange: (v: number) => void;
}) {
  const changed = value !== recommended;
  const recLabel = isPercent ? `${recommended}%` : `$${recommended.toLocaleString()}`;

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 pl-5"
      style={{ borderTop: "1px solid #1e1e1e" }}
    >
      <div className="flex-1 mr-3 min-w-0">
        <p className="text-sm" style={{ color: changed ? "#d0d0d0" : "#888" }}>
          {label}
          {changed && (
            <span className="ml-1.5 text-xs font-mono" style={{ color: "#10b981" }}>
              ✦
            </span>
          )}
        </p>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ color: "#444" }}>
            {sublabel}
          </p>
        )}
        <p className="text-xs mt-0.5" style={{ color: changed ? "#10b98155" : "#333" }}>
          Recommended: {recLabel}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!isPercent && (
          <span className="text-xs font-mono" style={{ color: "#444" }}>
            $
          </span>
        )}
        <input
          type="number"
          min={0}
          step={isPercent ? 0.5 : 1}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="text-right rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none transition-all"
          style={{
            width: 80,
            background: "#161616",
            border: `1px solid ${changed ? "#10b98166" : "#252525"}`,
            color: changed ? "#f0f0f0" : "#ccc",
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "#10b981")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = changed ? "#10b98166" : "#252525")
          }
        />
        {isPercent && (
          <span className="text-xs font-mono" style={{ color: "#444" }}>
            %
          </span>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-3.5"
      style={{
        background: highlight ? "#0d1a14" : "#1a1a1a",
        border: `1px solid ${highlight ? "#1a3a28" : "#222"}`,
      }}
    >
      <p className="text-xs mb-1.5" style={{ color: "#666" }}>
        {label}
      </p>
      <p
        className="font-mono-nums text-lg font-bold"
        style={{ color: highlight ? "#34d399" : "#f0f0f0" }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "#555" }}>
        {sub}
      </p>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

function FilterBar({
  filters,
  onChange,
  totalShown,
  totalCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  totalShown: number;
  totalCount: number;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const selectCls =
    "bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ccc] focus:outline-none focus:border-[#10b981] transition-colors appearance-none cursor-pointer hover:border-[#333]";

  return (
    <div
      className="sticky top-0 z-30 px-6 py-4"
      style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
        {/* Market */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: "#555" }}>
            Market
          </label>
          <select
            value={filters.market}
            onChange={(e) => set("market", e.target.value)}
            className={selectCls}
            style={{ minWidth: 140 }}
          >
            {MARKETS.map((m) => (
              <option key={m} value={m}>
                {m === "All" ? "All Markets" : m}
              </option>
            ))}
          </select>
        </div>

        {/* Min Profit */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: "#555" }}>
            Min Profit
          </label>
          <select
            value={filters.minProfit}
            onChange={(e) => set("minProfit", Number(e.target.value))}
            className={selectCls}
          >
            <option value={0}>Any profit</option>
            <option value={500}>$500+</option>
            <option value={1000}>$1,000+</option>
            <option value={1500}>$1,500+</option>
            <option value={2000}>$2,000+</option>
            <option value={2500}>$2,500+</option>
          </select>
        </div>

        {/* Max Rent */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: "#555" }}>
            Max Rent
          </label>
          <select
            value={filters.maxRent}
            onChange={(e) => set("maxRent", Number(e.target.value))}
            className={selectCls}
          >
            <option value={999999}>Any rent</option>
            <option value={1500}>≤ $1,500</option>
            <option value={2000}>≤ $2,000</option>
            <option value={2500}>≤ $2,500</option>
            <option value={3000}>≤ $3,000</option>
            <option value={4000}>≤ $4,000</option>
          </select>
        </div>

        {/* Beds */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: "#555" }}>
            Beds
          </label>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
            {[0, 1, 2, 3].map((b) => (
              <button
                key={b}
                onClick={() => set("beds", b)}
                className="px-3 py-2 text-sm transition-colors"
                style={{
                  background: filters.beds === b ? "#10b981" : "#1a1a1a",
                  color: filters.beds === b ? "#000" : "#999",
                  fontWeight: filters.beds === b ? 600 : 400,
                  borderLeft: b > 0 ? "1px solid #2a2a2a" : undefined,
                }}
              >
                {b === 0 ? "All" : b === 3 ? "3+" : b}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: "#555" }}>
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => set("sortBy", e.target.value)}
            className={selectCls}
          >
            <option value="profit-desc">Profit: High → Low</option>
            <option value="profit-asc">Profit: Low → High</option>
            <option value="rent-asc">Rent: Low → High</option>
            <option value="rent-desc">Rent: High → Low</option>
            <option value="occupancy-desc">Occupancy: High → Low</option>
            <option value="payback-asc">Payback: Fastest first</option>
          </select>
        </div>

        {/* Results count + reset */}
        <div className="ml-auto flex items-end gap-3 pb-0.5">
          <span className="text-sm" style={{ color: "#555" }}>
            <span style={{ color: "#888" }}>{totalShown}</span> of {totalCount} properties
          </span>
          {(filters.market !== "All" ||
            filters.minProfit !== 0 ||
            filters.maxRent !== 999999 ||
            filters.beds !== 0 ||
            filters.sortBy !== "profit-desc") && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-xs px-2.5 py-1.5 rounded-lg transition-colors hover:bg-[#1a1a1a]"
              style={{ color: "#10b981", border: "1px solid #1a3a28" }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return PROPERTIES.filter((p) => {
      if (filters.market !== "All" && p.market !== filters.market) return false;
      if (p.netProfit < filters.minProfit) return false;
      if (p.monthlyRent > filters.maxRent) return false;
      if (filters.beds === 3 && p.beds < 3) return false;
      if (filters.beds > 0 && filters.beds < 3 && p.beds !== filters.beds) return false;
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "profit-desc":    return b.netProfit - a.netProfit;
        case "profit-asc":    return a.netProfit - b.netProfit;
        case "rent-asc":      return a.monthlyRent - b.monthlyRent;
        case "rent-desc":     return b.monthlyRent - a.monthlyRent;
        case "occupancy-desc": return b.occupancy - a.occupancy;
        case "payback-asc":   return a.paybackMonths - b.paybackMonths;
        default:              return b.netProfit - a.netProfit;
      }
    });
  }, [filters]);

  const selectedProperty = selectedId != null
    ? PROPERTIES.find((p) => p.id === selectedId) ?? null
    : null;

  const totalMonthlyProfit = filtered.reduce((s, p) => s + p.netProfit, 0);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <header
        className="px-6 py-5"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "#10b981", color: "#000" }}
            >
              N
            </div>
            <div>
              <span
                className="font-heading text-xl font-bold tracking-tight"
                style={{ color: "#f0f0f0" }}
              >
                Nestly
              </span>
              <span
                className="ml-2 text-sm hidden sm:inline"
                style={{ color: "#555" }}
              >
                STR Profit Intelligence
              </span>
            </div>
          </div>

          {/* Portfolio summary */}
          {filtered.length > 0 && (
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs" style={{ color: "#555" }}>
                  Avg Monthly Profit
                </p>
                <p
                  className="font-mono-nums text-sm font-semibold"
                  style={{ color: "#10b981" }}
                >
                  {fmt(totalMonthlyProfit / filtered.length)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#555" }}>
                  Top Performer
                </p>
                <p
                  className="font-mono-nums text-sm font-semibold"
                  style={{ color: "#34d399" }}
                >
                  {fmt(filtered[0]?.netProfit ?? 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 pt-10 pb-8">
        <div className="max-w-7xl mx-auto">
          <h1
            className="font-heading text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-3"
            style={{ color: "#f0f0f0" }}
          >
            Find STRs by{" "}
            <span style={{ color: "#10b981" }}>monthly profit</span>
            ,<br className="hidden sm:block" /> not just rent.
          </h1>
          <p className="text-lg max-w-xl" style={{ color: "#666" }}>
            Every property analyzed for net profit after rent, cleaning, platform
            fees, and operating costs. Click any card for a full P&L breakdown.
          </p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalShown={filtered.length}
        totalCount={PROPERTIES.length}
      />

      {/* Grid */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p
                className="font-heading text-2xl font-semibold mb-2"
                style={{ color: "#333" }}
              >
                No properties match
              </p>
              <p className="text-sm mb-6" style={{ color: "#555" }}>
                Try adjusting your filters
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: "#10b981",
                  color: "#000",
                  fontWeight: 600,
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  selected={selectedId === property.id}
                  onClick={() =>
                    setSelectedId(
                      selectedId === property.id ? null : property.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Panel */}
      {selectedProperty && (
        <DetailPanel
          property={selectedProperty}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Footer */}
      <footer
        className="px-6 py-8 mt-8"
        style={{ borderTop: "1px solid #1a1a1a" }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "#444" }}>
            © 2026 Nestly · Sample data for illustration purposes.
          </p>
          <p className="text-xs" style={{ color: "#333" }}>
            Profit estimates assume 3-night avg stay · 3% platform fee · market
            cleaning rates
          </p>
        </div>
      </footer>
    </div>
  );
}
