"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

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
  pmName: string;
  pmEmail: string;
  pmPhone: string;
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
  score: number;
};

// ─── Raw Data ─────────────────────────────────────────────────────────────────

const RAW: RawProperty[] = [
  // ── Chattanooga ───────────────────────────────────────────────────────────
  {
    id: 1, name: "Downtown Loft", market: "Chattanooga",
    address: "215 Market St, Chattanooga, TN",
    beds: 1, baths: 1, sqft: 650,
    monthlyRent: 1800, adr: 185, occupancy: 0.72,
    cleaningPerTurn: 85, utilities: 140, supplies: 60, startupCost: 12000,
    description: "Industrial-chic loft steps from the Tennessee Aquarium. High walkability score and strong weekend demand from outdoor and aquarium visitors.",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(423) 591-4782",
  },
  {
    id: 2, name: "North Shore Cottage", market: "Chattanooga",
    address: "418 Tremont St, Chattanooga, TN",
    beds: 2, baths: 1, sqft: 950,
    monthlyRent: 2200, adr: 225, occupancy: 0.68,
    cleaningPerTurn: 100, utilities: 180, supplies: 75, startupCost: 15000,
    description: "Charming renovated cottage in the walkable North Shore neighborhood. Covered porch, private parking, and five-minute walk to the pedestrian bridge.",
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(423) 591-4782",
  },
  {
    id: 3, name: "Southside Bungalow", market: "Chattanooga",
    address: "820 McCallie Ave, Chattanooga, TN",
    beds: 3, baths: 2, sqft: 1400,
    monthlyRent: 2800, adr: 295, occupancy: 0.65,
    cleaningPerTurn: 130, utilities: 220, supplies: 90, startupCost: 20000,
    description: "Spacious bungalow near UTC campus and Finley Stadium. Perfect for groups visiting Chattanooga's outdoor attractions and rock-climbing scene.",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(423) 591-4782",
  },
  {
    id: 4, name: "Signal Mountain Retreat", market: "Chattanooga",
    address: "1840 Taft Hwy, Signal Mountain, TN",
    beds: 2, baths: 1, sqft: 1100,
    monthlyRent: 1950, adr: 210, occupancy: 0.63,
    cleaningPerTurn: 105, utilities: 165, supplies: 70, startupCost: 14000,
    description: "Cozy cabin-style retreat on Signal Mountain with sweeping valley views. A 15-minute drive to downtown draws nature seekers and weekend escapists.",
    imageUrl: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(423) 591-4782",
  },
  {
    id: 5, name: "St. Elmo Victorian", market: "Chattanooga",
    address: "3912 Tennessee Ave, Chattanooga, TN",
    beds: 3, baths: 2, sqft: 1550,
    monthlyRent: 2600, adr: 265, occupancy: 0.66,
    cleaningPerTurn: 125, utilities: 205, supplies: 85, startupCost: 19000,
    description: "Fully restored Victorian in the St. Elmo historic district at the foot of Lookout Mountain. Original woodwork, updated kitchen, and wraparound porch.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(423) 591-4782",
  },
  {
    id: 6, name: "Riverfront Condo", market: "Chattanooga",
    address: "264 Riverfront Pkwy, Chattanooga, TN",
    beds: 1, baths: 1, sqft: 720,
    monthlyRent: 2500, adr: 195, occupancy: 0.58,
    cleaningPerTurn: 95, utilities: 175, supplies: 65, startupCost: 11000,
    description: "Modern condo with Tennessee River views and building amenities including pool and gym. High rent-to-ADR ratio makes margins razor-thin.",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(423) 591-4782",
  },
  // ── Savannah ──────────────────────────────────────────────────────────────
  {
    id: 7, name: "Historic District Gem", market: "Savannah",
    address: "124 Bull St, Savannah, GA",
    beds: 2, baths: 1, sqft: 1100,
    monthlyRent: 2500, adr: 280, occupancy: 0.74,
    cleaningPerTurn: 110, utilities: 175, supplies: 80, startupCost: 18000,
    description: "Stunning antebellum flat on Savannah's most iconic street. Steps from Forsyth Park with original heart-pine floors and 12-foot ceilings.",
    imageUrl: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=75",
    pmName: "Coastal Keys Property Co", pmEmail: "marwan@coastalkeysco.com", pmPhone: "(912) 344-8156",
  },
  {
    id: 8, name: "Victorian Row House", market: "Savannah",
    address: "307 Jones St, Savannah, GA",
    beds: 3, baths: 2, sqft: 1600,
    monthlyRent: 3200, adr: 340, occupancy: 0.70,
    cleaningPerTurn: 140, utilities: 240, supplies: 95, startupCost: 24000,
    description: "Grand Victorian row house on one of Savannah's most photographed streets. Wraparound balcony, period details, and two blocks from the squares.",
    imageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=75",
    pmName: "Coastal Keys Property Co", pmEmail: "marwan@coastalkeysco.com", pmPhone: "(912) 344-8156",
  },
  {
    id: 9, name: "Forsyth Park Carriage House", market: "Savannah",
    address: "516 Whitaker St, Savannah, GA",
    beds: 1, baths: 1, sqft: 780,
    monthlyRent: 1800, adr: 230, occupancy: 0.72,
    cleaningPerTurn: 105, utilities: 155, supplies: 70, startupCost: 13000,
    description: "Intimate carriage house behind a Forsyth Park mansion. Exposed brick, private garden entrance, and the fountain view from the upstairs bedroom.",
    imageUrl: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=75",
    pmName: "Coastal Keys Property Co", pmEmail: "marwan@coastalkeysco.com", pmPhone: "(912) 344-8156",
  },
  {
    id: 10, name: "Starland District Bungalow", market: "Savannah",
    address: "2402 DeSoto Ave, Savannah, GA",
    beds: 2, baths: 1, sqft: 1050,
    monthlyRent: 2100, adr: 225, occupancy: 0.68,
    cleaningPerTurn: 100, utilities: 170, supplies: 75, startupCost: 15000,
    description: "Artsy bungalow in the Starland Design District. Walking distance to local galleries, SCAD studios, and the city's best coffee shops.",
    imageUrl: "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=75",
    pmName: "Coastal Keys Property Co", pmEmail: "marwan@coastalkeysco.com", pmPhone: "(912) 344-8156",
  },
  {
    id: 11, name: "River Street Penthouse", market: "Savannah",
    address: "100 E Bay St #PH4, Savannah, GA",
    beds: 2, baths: 2, sqft: 1200,
    monthlyRent: 4500, adr: 300, occupancy: 0.65,
    cleaningPerTurn: 140, utilities: 240, supplies: 100, startupCost: 22000,
    description: "Penthouse condo above River Street with panoramic Savannah River views. Premium finishes but aggressive rent leaves almost no margin — buyers beware.",
    imageUrl: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&q=75",
    pmName: "Coastal Keys Property Co", pmEmail: "marwan@coastalkeysco.com", pmPhone: "(912) 344-8156",
  },
  {
    id: 12, name: "Thomas Square Townhouse", market: "Savannah",
    address: "2118 Bull St, Savannah, GA",
    beds: 3, baths: 2, sqft: 1700,
    monthlyRent: 2900, adr: 310, occupancy: 0.72,
    cleaningPerTurn: 130, utilities: 200, supplies: 95, startupCost: 21000,
    description: "Stylish townhouse in the Thomas Square Streetcar Historic District. Three floors, private courtyard, and a 10-minute walk to Forsyth Park.",
    imageUrl: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=75",
    pmName: "Coastal Keys Property Co", pmEmail: "marwan@coastalkeysco.com", pmPhone: "(912) 344-8156",
  },
  // ── Nashville ─────────────────────────────────────────────────────────────
  {
    id: 13, name: "East Nashville Bungalow", market: "Nashville",
    address: "632 Forrest Ave, Nashville, TN",
    beds: 2, baths: 1, sqft: 1000,
    monthlyRent: 2800, adr: 310, occupancy: 0.76,
    cleaningPerTurn: 115, utilities: 185, supplies: 80, startupCost: 19000,
    description: "Hip bungalow in booming East Nashville. Walking distance to 5 Points bars, coffee shops, and the best brunch spots in the city.",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(615) 847-3921",
  },
  {
    id: 14, name: "Gulch Studio", market: "Nashville",
    address: "1100 Demonbreun St, Nashville, TN",
    beds: 1, baths: 1, sqft: 580,
    monthlyRent: 2200, adr: 250, occupancy: 0.78,
    cleaningPerTurn: 90, utilities: 130, supplies: 65, startupCost: 14000,
    description: "Sleek high-rise studio in the Gulch with rooftop pool access. Top occupancy performer thanks to proximity to Broadway and the honky-tonk strip.",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(615) 847-3921",
  },
  {
    id: 15, name: "The Nations Retreat", market: "Nashville",
    address: "5204 Centennial Blvd, Nashville, TN",
    beds: 3, baths: 2, sqft: 1500,
    monthlyRent: 3500, adr: 420, occupancy: 0.72,
    cleaningPerTurn: 145, utilities: 260, supplies: 100, startupCost: 28000,
    description: "Designer retreat in The Nations — Nashville's fastest-growing neighborhood. Hot tub, game room, and stylish interiors drive premium ADR.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(615) 847-3921",
  },
  {
    id: 16, name: "12 South Craftsman", market: "Nashville",
    address: "2218 Belmont Blvd, Nashville, TN",
    beds: 2, baths: 1, sqft: 1100,
    monthlyRent: 3100, adr: 345, occupancy: 0.74,
    cleaningPerTurn: 120, utilities: 195, supplies: 85, startupCost: 23000,
    description: "Meticulously restored craftsman in the 12 South corridor. One block from Sevier Park and surrounded by the boutiques and restaurants that keep occupancy high year-round.",
    imageUrl: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(615) 847-3921",
  },
  {
    id: 17, name: "Germantown Condo", market: "Nashville",
    address: "1104 4th Ave N, Nashville, TN",
    beds: 1, baths: 1, sqft: 640,
    monthlyRent: 2600, adr: 280, occupancy: 0.72,
    cleaningPerTurn: 100, utilities: 165, supplies: 70, startupCost: 17000,
    description: "Contemporary condo in Nashville's oldest neighborhood. Farmers market on weekends, Germantown café culture, and a 7-minute walk to Nissan Stadium.",
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(615) 847-3921",
  },
  {
    id: 18, name: "Berry Hill Studio", market: "Nashville",
    address: "2613 Nolensville Pike, Nashville, TN",
    beds: 1, baths: 1, sqft: 520,
    monthlyRent: 3200, adr: 225, occupancy: 0.58,
    cleaningPerTurn: 90, utilities: 170, supplies: 70, startupCost: 13000,
    description: "Converted recording-studio complex unit in Berry Hill. Trendy vibe but aggressive rent and below-average ADR for the market create a negative margin — test your numbers carefully.",
    imageUrl: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=75",
    pmName: "Skyline STR Partners", pmEmail: "marwan@skylinestrpartners.com", pmPhone: "(615) 847-3921",
  },
  // ── Scottsdale ────────────────────────────────────────────────────────────
  {
    id: 19, name: "Old Town Casita", market: "Scottsdale",
    address: "7340 E Shoeman Ln, Scottsdale, AZ",
    beds: 1, baths: 1, sqft: 700,
    monthlyRent: 2400, adr: 290, occupancy: 0.68,
    cleaningPerTurn: 100, utilities: 200, supplies: 70, startupCost: 16000,
    description: "Breezy Spanish casita one block from Old Town's restaurant row. Private courtyard with heated plunge pool and strong snowbird repeat bookings.",
    imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=75",
    pmName: "Desert Stays Management", pmEmail: "marwan@desertstays.com", pmPhone: "(480) 723-9144",
  },
  {
    id: 20, name: "Desert Modern Villa", market: "Scottsdale",
    address: "9820 N Pima Rd, Scottsdale, AZ",
    beds: 3, baths: 2, sqft: 1800,
    monthlyRent: 4200, adr: 520, occupancy: 0.65,
    cleaningPerTurn: 160, utilities: 340, supplies: 110, startupCost: 32000,
    description: "Architectural gem with panoramic McDowell Mountain views. Infinity pool, outdoor kitchen, and Tesla EV charger command top-tier nightly rates.",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=75",
    pmName: "Desert Stays Management", pmEmail: "marwan@desertstays.com", pmPhone: "(480) 723-9144",
  },
  {
    id: 21, name: "McCormick Ranch Condo", market: "Scottsdale",
    address: "8888 E Raintree Dr, Scottsdale, AZ",
    beds: 2, baths: 2, sqft: 1150,
    monthlyRent: 2800, adr: 340, occupancy: 0.70,
    cleaningPerTurn: 115, utilities: 210, supplies: 85, startupCost: 20000,
    description: "Golf-course condo in McCormick Ranch with lake views and resort-style pools. Peak winter season drives 130%+ ADR versus summer lows.",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=75",
    pmName: "Desert Stays Management", pmEmail: "marwan@desertstays.com", pmPhone: "(480) 723-9144",
  },
  {
    id: 22, name: "North Scottsdale Retreat", market: "Scottsdale",
    address: "20750 N 87th St, Scottsdale, AZ",
    beds: 3, baths: 2, sqft: 2100,
    monthlyRent: 3600, adr: 480, occupancy: 0.68,
    cleaningPerTurn: 145, utilities: 280, supplies: 105, startupCost: 28000,
    description: "Luxury desert retreat near Pinnacle Peak with mountain views, heated pool, and outdoor kitchen. Massive demand Nov–Mar from snowbirds and spring training fans.",
    imageUrl: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=75",
    pmName: "Desert Stays Management", pmEmail: "marwan@desertstays.com", pmPhone: "(480) 723-9144",
  },
  {
    id: 23, name: "Tempe Arts District Loft", market: "Scottsdale",
    address: "525 W University Dr, Tempe, AZ",
    beds: 1, baths: 1, sqft: 680,
    monthlyRent: 1700, adr: 195, occupancy: 0.58,
    cleaningPerTurn: 85, utilities: 175, supplies: 65, startupCost: 12000,
    description: "Industrial loft near ASU and the Tempe Arts District. Budget-friendly rent keeps margins slim but positive — good entry-level STR with room to grow ADR.",
    imageUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=75",
    pmName: "Desert Stays Management", pmEmail: "marwan@desertstays.com", pmPhone: "(480) 723-9144",
  },
  {
    id: 24, name: "Gainey Ranch Townhouse", market: "Scottsdale",
    address: "7760 E Gainey Ranch Rd, Scottsdale, AZ",
    beds: 2, baths: 2, sqft: 1300,
    monthlyRent: 3400, adr: 380, occupancy: 0.60,
    cleaningPerTurn: 125, utilities: 240, supplies: 90, startupCost: 24000,
    description: "Townhouse inside the gated Gainey Ranch resort community with three pools and golf. Summer occupancy craters with the desert heat — underwrite conservatively.",
    imageUrl: "https://images.unsplash.com/photo-1464146072230-91cabc968774?auto=format&fit=crop&w=800&q=75",
    pmName: "Desert Stays Management", pmEmail: "marwan@desertstays.com", pmPhone: "(480) 723-9144",
  },
  // ── Knoxville ─────────────────────────────────────────────────────────────
  {
    id: 25, name: "Old City Flat", market: "Knoxville",
    address: "126 S Gay St, Knoxville, TN",
    beds: 1, baths: 1, sqft: 620,
    monthlyRent: 1500, adr: 160, occupancy: 0.70,
    cleaningPerTurn: 80, utilities: 120, supplies: 55, startupCost: 10000,
    description: "Exposed-brick flat in Knoxville's lively Old City arts district. Easy walk to UT games, Market Square, and the Tennessee Theatre.",
    imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=75",
    pmName: "Summit STR Partners", pmEmail: "marwan@summitstrs.com", pmPhone: "(865) 412-6730",
  },
  {
    id: 26, name: "Market Square Studio", market: "Knoxville",
    address: "28 Market Square, Knoxville, TN",
    beds: 2, baths: 1, sqft: 890,
    monthlyRent: 2000, adr: 210, occupancy: 0.72,
    cleaningPerTurn: 95, utilities: 155, supplies: 70, startupCost: 13500,
    description: "Loft-style studio above the best farmers market in Tennessee. Front-row views of outdoor concerts and festivals from the Juliet balcony.",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=75",
    pmName: "Summit STR Partners", pmEmail: "marwan@summitstrs.com", pmPhone: "(865) 412-6730",
  },
  {
    id: 27, name: "UT Campus Loft", market: "Knoxville",
    address: "1714 Cumberland Ave, Knoxville, TN",
    beds: 2, baths: 1, sqft: 920,
    monthlyRent: 1800, adr: 200, occupancy: 0.74,
    cleaningPerTurn: 95, utilities: 145, supplies: 65, startupCost: 13000,
    description: "Bright loft on the Strip steps from Neyland Stadium. Football weekends push ADR to 3× and occupancy to 100% — the rest of the year carries easily.",
    imageUrl: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=75",
    pmName: "Summit STR Partners", pmEmail: "marwan@summitstrs.com", pmPhone: "(865) 412-6730",
  },
  {
    id: 28, name: "Fourth & Gill Victorian", market: "Knoxville",
    address: "412 Gill Ave, Knoxville, TN",
    beds: 3, baths: 2, sqft: 1650,
    monthlyRent: 2300, adr: 245, occupancy: 0.68,
    cleaningPerTurn: 120, utilities: 190, supplies: 85, startupCost: 17000,
    description: "Beautifully restored Victorian in the Fourth & Gill historic neighborhood. Wrap-around porch, clawfoot tub, and original stained glass throughout.",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=75",
    pmName: "Summit STR Partners", pmEmail: "marwan@summitstrs.com", pmPhone: "(865) 412-6730",
  },
  {
    id: 29, name: "Downtown High-Rise Studio", market: "Knoxville",
    address: "600 Gay St #1408, Knoxville, TN",
    beds: 1, baths: 1, sqft: 540,
    monthlyRent: 1900, adr: 175, occupancy: 0.62,
    cleaningPerTurn: 80, utilities: 140, supplies: 60, startupCost: 11000,
    description: "14th-floor studio with skyline views and building amenities. Solid midweek corporate bookings but weekend leisure demand is softer than nearby properties.",
    imageUrl: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=75",
    pmName: "Summit STR Partners", pmEmail: "marwan@summitstrs.com", pmPhone: "(865) 412-6730",
  },
  {
    id: 30, name: "Sequoyah Hills Bungalow", market: "Knoxville",
    address: "3218 Kingston Pike, Knoxville, TN",
    beds: 2, baths: 1, sqft: 980,
    monthlyRent: 2200, adr: 175, occupancy: 0.58,
    cleaningPerTurn: 90, utilities: 155, supplies: 65, startupCost: 14000,
    description: "Quiet bungalow in prestigious Sequoyah Hills — beautiful neighborhood but the low ADR relative to rent produces near-zero margin. A cautionary tale about location vs. demand.",
    imageUrl: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=800&q=75",
    pmName: "Summit STR Partners", pmEmail: "marwan@summitstrs.com", pmPhone: "(865) 412-6730",
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

  // Score 0–100: profit(40) + margin(20) + occupancy(20) + ADR cushion(20)
  const cushionRatio = p.adr > 0 ? (p.adr - breakEvenAdr) / p.adr : 0;
  const score = Math.min(100, Math.round(
    Math.min(40, Math.max(0, (netProfit / 2500) * 40)) +
    Math.min(20, Math.max(0, (profitMargin / 0.35) * 20)) +
    Math.min(20, Math.max(0, ((p.occupancy - 0.5) / 0.3) * 20)) +
    Math.min(20, Math.max(0, (cushionRatio / 0.35) * 20))
  ));

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
    score,
  };
}

const PROPERTIES: Property[] = RAW.map(computeFinancials);
const MARKETS = ["All", ...Array.from(new Set(RAW.map((p) => p.market)))];

// ─── Expense Overrides (editable per-property) ────────────────────────────────

type ExpenseOverrides = {
  monthlyRent: number;
  avgStayNights: number;   // avg stay length → drives turnovers/mo
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
    avgStayNights: 3,
    cleaningPerTurn: p.cleaningPerTurn,
    platformFeeRate: 3,
    utilities: p.utilities,
    wifi: 60,
    insurance: 100,
    supplies: p.supplies,
    furnishingAmortization: 200,
    maintenanceReserve: 100,
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
  const stayLen = Math.max(1, ov.avgStayNights);
  const turnovers = Math.round((p.occupancy * 30) / stayLen);
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

const MARKET_ICONS: Record<string, string> = {
  Chattanooga: "🏔️",
  Savannah: "🌿",
  Nashville: "🎵",
  Scottsdale: "🌵",
  Knoxville: "🏈",
};

// ─── Seasonal Forecast ────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Demand multipliers per market type — normalized so annual avg ≈ 1.0
const SEASONAL_PROFILES: Record<string, number[]> = {
  // Southern tourist (Chattanooga, Savannah): peak spring (Apr) and fall (Oct), quiet Jan/mid-summer
  southern:  [0.76, 0.83, 1.11, 1.23, 1.19, 0.93, 0.89, 0.86, 1.09, 1.26, 1.06, 0.81],
  // Desert (Scottsdale): peak Jan–Mar snowbirds + spring training, crater Jun–Aug extreme heat
  desert:    [1.30, 1.36, 1.33, 1.12, 0.87, 0.59, 0.53, 0.55, 0.80, 1.06, 1.22, 1.26],
  // Nashville: peak summer (CMA Fest Jun) and fall (Oct country music), slow Jan–Feb
  nashville: [0.72, 0.78, 0.88, 0.98, 1.08, 1.28, 1.22, 1.10, 1.04, 1.20, 0.92, 0.74],
  // Knoxville: peak summer (Jun–Aug hiking/lakes) + football season (Sep–Nov), slow winter
  knoxville: [0.65, 0.68, 0.78, 0.88, 1.02, 1.20, 1.28, 1.22, 1.18, 1.15, 1.08, 0.72],
};

function getSeasonalProfile(market: string): number[] {
  if (market === "Scottsdale") return SEASONAL_PROFILES.desert;
  if (market === "Nashville") return SEASONAL_PROFILES.nashville;
  if (market === "Knoxville") return SEASONAL_PROFILES.knoxville;
  return SEASONAL_PROFILES.southern;
}

type MonthData = { month: string; revenue: number; expenses: number; net: number; occupancy: number; adr: number };

function computeMonthlyForecast(property: RawProperty, ov: ExpenseOverrides): MonthData[] {
  const profile = getSeasonalProfile(property.market);
  const baseRevenue = Math.round(property.adr * 30 * property.occupancy);
  const stayLen = Math.max(1, ov.avgStayNights);
  const baseTurnovers = Math.round((property.occupancy * 30) / stayLen);
  const fixed =
    ov.monthlyRent + ov.utilities + ov.wifi + ov.insurance +
    ov.supplies + ov.furnishingAmortization + ov.maintenanceReserve;
  return profile.map((mult, i) => {
    const revenue = Math.round(baseRevenue * mult);
    const cleaning = Math.round(baseTurnovers * mult) * ov.cleaningPerTurn;
    const platform = Math.round(revenue * (ov.platformFeeRate / 100));
    const expenses = fixed + cleaning + platform;
    const monthOccupancy = Math.min(1.0, property.occupancy * mult);
    const adr = monthOccupancy > 0 ? Math.round(revenue / (30 * monthOccupancy)) : 0;
    return { month: MONTH_NAMES[i], revenue, expenses, net: revenue - expenses, occupancy: monthOccupancy, adr };
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
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#0f0f0f" }}>
              {["Month", "Revenue", "Expenses", "Net", "Occ %", "ADR"].map((h, hi) => (
                <th key={h} style={{
                  padding: "8px 8px",
                  textAlign: hi === 0 ? "left" : "right",
                  color: "#555", fontWeight: 600, fontSize: 9,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  fontFamily: "var(--font-outfit)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((m, i) => (
              <tr key={i} style={{ borderTop: "1px solid #1a1a1a", background: i % 2 ? "#0d0d0d" : "transparent" }}>
                <td style={{ padding: "5px 8px", color: "#aaa", fontFamily: "var(--font-outfit)" }}>{m.month}</td>
                <td className="font-mono-nums" style={{ padding: "5px 8px", textAlign: "right", color: "#777" }}>{fmt(m.revenue)}</td>
                <td className="font-mono-nums" style={{ padding: "5px 8px", textAlign: "right", color: "#555" }}>{fmt(m.expenses)}</td>
                <td className="font-mono-nums" style={{ padding: "5px 8px", textAlign: "right", fontWeight: 600,
                  color: m.net >= 0 ? "#10b981" : "#f87171" }}>{fmt(m.net)}</td>
                <td className="font-mono-nums" style={{ padding: "5px 8px", textAlign: "right", color: "#666" }}>{(m.occupancy * 100).toFixed(0)}%</td>
                <td className="font-mono-nums" style={{ padding: "5px 8px", textAlign: "right", color: "#666" }}>${m.adr}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid #2a2a2a", background: "#0f0f0f" }}>
              <td style={{ padding: "7px 8px", color: "#666", fontWeight: 700, fontSize: 10, fontFamily: "var(--font-outfit)" }}>Annual</td>
              <td className="font-mono-nums" style={{ padding: "7px 8px", textAlign: "right", color: "#888", fontWeight: 600 }}>{fmt(annualRevenue)}</td>
              <td className="font-mono-nums" style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontWeight: 600 }}>{fmt(annualExpenses)}</td>
              <td className="font-mono-nums" style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700,
                color: annualNet >= 0 ? "#34d399" : "#f87171" }}>{fmt(annualNet)}</td>
              <td style={{ padding: "7px 8px" }} />
              <td style={{ padding: "7px 8px" }} />
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
    property.netProfit >= 2000 ? "#34d399" :
    property.netProfit >= 800  ? "#10b981" :
    property.netProfit >= 0    ? "#f59e0b" : "#f87171";

  const scoreColor =
    property.score >= 75 ? "#10b981" :
    property.score >= 60 ? "#f59e0b" : "#f87171";
  const scoreBg =
    property.score >= 75 ? "#0d1a14" :
    property.score >= 60 ? "#1a1400" : "#1a0a0a";

  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-xl overflow-hidden border transition-all duration-200"
      style={{
        background: selected ? "#111d16" : "#111111",
        borderColor: selected ? "#10b981" : "#1e1e1e",
        boxShadow: selected ? "0 0 0 1px #10b981" : "none",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 162 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.08) 52%, transparent 100%)" }}
        />
        {/* Market badge — top left */}
        <span
          className="absolute top-2.5 left-2.5 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: `${marketColors[property.market]}1e`,
            color: marketColors[property.market],
            backdropFilter: "blur(6px)",
            border: `1px solid ${marketColors[property.market]}40`,
          }}
        >
          {property.market}
        </span>
        {/* Score badge — top right */}
        <div
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: scoreBg,
            color: scoreColor,
            border: `1.5px solid ${scoreColor}66`,
            backdropFilter: "blur(6px)",
          }}
        >
          {property.score}
        </div>
        {/* Profit — bottom left */}
        <div className="absolute bottom-2.5 left-2.5">
          <div
            className="rounded-lg px-2.5 py-1 flex items-baseline gap-1"
            style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
          >
            <span className="font-mono-nums text-lg font-bold tracking-tight" style={{ color: profitColor }}>
              {fmt(property.netProfit)}
            </span>
            <span className="text-xs" style={{ color: "#666" }}>/mo</span>
          </div>
        </div>
        {/* Beds/baths — bottom right */}
        <span
          className="absolute bottom-2.5 right-2.5 text-xs px-2 py-0.5 rounded"
          style={{ background: "rgba(0,0,0,0.68)", color: "#aaa", backdropFilter: "blur(6px)" }}
        >
          {property.beds}bd · {property.baths}ba
        </span>
      </div>

      {/* Card body */}
      <div className="px-3.5 pt-3 pb-3.5">
        <h3 className="font-heading text-sm font-semibold leading-snug mb-0.5" style={{ color: "#f0f0f0" }}>
          {property.name}
        </h3>
        <p className="text-xs mb-3 truncate" style={{ color: "#505050" }}>
          {property.address}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1 pt-2.5" style={{ borderTop: "1px solid #1c1c1c" }}>
          <CompactStat label="ADR" value={`$${property.adr}`} />
          <CompactStat label="Occ" value={`${(property.occupancy * 100).toFixed(0)}%`} />
          <CompactStat label="Rent" value={`$${(property.monthlyRent / 1000).toFixed(1)}k`} />
        </div>

        {/* Sample badge + est. profit tooltip */}
        <div className="flex items-center justify-between mt-2">
          <span
            className="font-semibold uppercase tracking-widest"
            style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "#0e1520", color: "#3a5a80", border: "1px solid #1a2840" }}
          >
            Sample
          </span>
          <div className="relative group/tip inline-flex items-center gap-1 cursor-help">
            <span style={{ fontSize: 10, color: "#383838" }}>est. profit</span>
            <span
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#181818", border: "1px solid #252525", color: "#484848", fontSize: 9, lineHeight: 1 }}
            >
              i
            </span>
            {/* Tooltip popup — appears upward from bottom-right */}
            <div
              className="absolute bottom-full right-0 mb-2 w-52 rounded-xl p-2.5 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50"
              style={{ background: "#101a28", border: "1px solid #1e2e44", fontSize: 11, color: "#6a9abf", lineHeight: 1.55 }}
            >
              Estimated based on market averages for this neighborhood. Connect live data for accurate projections.
              <span
                className="absolute top-full right-4"
                style={{ display: "block", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1e2e44" }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-mono-nums text-xs font-semibold" style={{ color: "#c0c0c0" }}>{value}</p>
      <p style={{ fontSize: 10, color: "#444", marginTop: 1 }}>{label}</p>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: "#444" }}>{label}</p>
      <p className="font-mono-nums text-sm font-semibold" style={{ color: color ?? "#888" }}>{value}</p>
    </div>
  );
}

// ─── Disclaimer banner (shown above the property grid) ────────────────────────

function DisclaimerBanner() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 mb-4"
      style={{ background: "#0d1520", border: "1px solid #1a2840" }}
    >
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        className="flex-shrink-0 mt-0.5"
        style={{ color: "#4a7ab5" }}
      >
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M7 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7" cy="4.25" r="0.75" fill="currentColor"/>
      </svg>
      <p className="text-xs leading-relaxed" style={{ color: "#527aaa" }}>
        <span className="font-semibold" style={{ color: "#6a9abf" }}>Sample data for demonstration</span>
        {" "}— projections are estimates based on market averages, not live listings.
        Always verify with your own research before signing a lease.
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
  const defaultComputed = useMemo(() => computeWithOverrides(property, defaults), [property, defaults]);
  const delta = computed.netProfit - defaultComputed.netProfit;

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

  function buildPitchText(tone: Tone): string {
    const rent = fmt(overrides.monthlyRent);
    const rev = fmt(computed.revenue);
    const net = fmt(computed.netProfit);
    const annualNet = fmt(computed.netProfit * 12);
    const margin = (computed.profitMargin * 100).toFixed(1);
    const occ = (property.occupancy * 100).toFixed(0);
    const coverage = computed.revenue > 0
      ? ((computed.revenue / overrides.monthlyRent) * 100).toFixed(0)
      : "0";

    if (tone === "Data-Driven") {
      return `Subject: Short-Term Rental Management Proposal — ${property.address}

Hi [Landlord Name],

My name is Marwan, and I specialize in managing short-term rentals across ${property.market}. I recently analyzed your property at ${property.address} and want to share what I found.

Current market data for this unit:
  • Market ADR:              $${property.adr}/night
  • Projected occupancy:     ${occ}%
  • Estimated gross revenue: ${rev}/mo
  • Net profit after expenses: ${net}/mo (${margin}% margin)

Revenue covers your ${rent}/mo rent by ${coverage}% — that's ${annualNet} in projected net profit annually.

My fee covers full-service management: dynamic pricing, guest screening, cleaning coordination, restocking, and 24/7 guest support. You receive a guaranteed payment schedule and a monthly P&L report.

I'd be glad to send you the full underwriting model. Can we connect for 15 minutes this week?

Best regards,
Marwan
${property.pmName}
${property.pmEmail}
${property.pmPhone}`;
    }

    if (tone === "Relationship") {
      return `Subject: A Partnership Opportunity for ${property.address}

Hi [Landlord Name],

My name is Marwan. I've been working with property owners in ${property.market} for several years, and I take a lot of pride in treating every home I manage as if it were my own.

I came across your property on ${property.address} and immediately saw its potential. This is exactly the kind of place guests in ${property.market} are looking for — and I'd love to explore whether we'd be a good fit to work together.

What I've found in my analysis is that properties like yours can realistically generate ${rev}/mo in gross revenue, translating to roughly ${net} in net profit each month after all costs. Over a year, that's ${annualNet} working for you — with zero extra effort on your part.

I handle everything so you don't have to: every guest interaction, every cleaning, every small repair coordination. Most landlords I work with tell me the relationship just feels easy.

If you're open to it, I'd love to grab a quick call or even meet at the property. No pressure at all — I just like to have honest conversations with owners who care about their homes.

Warmly,
Marwan
${property.pmName}
${property.pmEmail}
${property.pmPhone}`;
    }

    // Direct
    return `Subject: STR Offer — ${property.address}

Hi [Landlord Name],

I'm Marwan — I manage STRs in ${property.market} and want to make you an offer on ${property.address}.

Here's the deal:
  • Your rent: ${rent}/mo — paid on time, every month
  • Projected revenue: ${rev}/mo
  • Your net profit: ${net}/mo after all operating costs
  • Annual upside: ${annualNet}

I take care of everything. You collect rent. That's it.

Interested? Let's talk this week.

— Marwan
${property.pmName}
${property.pmEmail}
${property.pmPhone}`;
  }

  function generatePitch(tone: Tone) {
    setActiveTone(tone);
    setCopied(false);
    setLoading(true);
    setPitch("");
    // Simulate a brief "generating" moment, then show the template
    setTimeout(() => {
      setPitch(buildPitchText(tone));
      setLoading(false);
    }, 420);
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
                  label="Avg Stay Length"
                  sublabel={`→ ${computed.turnovers} turnovers/mo at ${pct(property.occupancy)} occ`}
                  value={overrides.avgStayNights}
                  recommended={defaults.avgStayNights}
                  suffix="nights"
                  step={0.5}
                  onChange={(v) => set("avgStayNights", Math.max(1, v))}
                />
                <EditableExpenseRow
                  label="Cleaning Cost per Turnover"
                  sublabel={`${computed.turnovers} turns × $${overrides.cleaningPerTurn} → ${fmt(computed.cleaningCost)}/mo`}
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
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-heading font-bold text-sm" style={{ color: "#10b981" }}>
                      Net Profit
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: "#2d6b4a" }}>
                      {pct(computed.profitMargin)} margin · {computed.revenueExpenseRatio.toFixed(2)}× ratio
                    </p>
                    {/* Comparison vs recommended */}
                    {hasCustom && (
                      <p
                        className="text-xs mt-1.5 font-mono"
                        style={{
                          color: delta > 0 ? "#34d399" : delta < 0 ? "#f87171" : "#555",
                        }}
                      >
                        Your numbers vs recommended:{" "}
                        <span className="font-semibold">
                          {delta > 0 ? "+" : ""}
                          {fmt(delta)}/mo
                        </span>
                        {" "}({delta > 0 ? "+" : ""}{fmt(delta * 12)}/yr)
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono-nums text-2xl font-bold" style={{ color: profitColor }}>
                      {fmt(computed.netProfit)}
                    </span>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: "#2d6b4a" }}>
                      {fmt(computed.netProfit * 12)}/yr
                    </p>
                  </div>
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
  prefix = "$",
  suffix,
  step = 1,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  recommended: number;
  isPercent?: boolean;
  prefix?: string;
  suffix?: string;
  step?: number;
  onChange: (v: number) => void;
}) {
  const changed = value !== recommended;
  const recLabel = isPercent
    ? `${recommended}%`
    : suffix
    ? `${recommended} ${suffix}`
    : `$${recommended.toLocaleString()}`;

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
        {!isPercent && !suffix && (
          <span className="text-xs font-mono" style={{ color: "#444" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={0}
          step={isPercent ? 0.5 : step}
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
          onFocus={(e) => (e.currentTarget.style.borderColor = "#10b981")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = changed ? "#10b98166" : "#252525")
          }
        />
        {(isPercent || suffix) && (
          <span className="text-xs font-mono" style={{ color: "#444" }}>
            {isPercent ? "%" : suffix}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  // ── Soft paywall (show after 3 property opens, only for guests) ────────────
  const [openCount, setOpenCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallSeen, setPaywallSeen] = useState(false);

  function handlePropertyClick(id: number) {
    if (!user && !paywallSeen) {
      const next = openCount + 1;
      setOpenCount(next);
      if (next >= 3) setShowPaywall(true);
    }
    setSelectedId(selectedId === id ? null : id);
  }

  // Close suggestions on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [] as { label: string; type: "market" | "property" | "address" }[];
    const results: { label: string; type: "market" | "property" | "address" }[] = [];
    MARKETS.filter(m => m !== "All" && m.toLowerCase().includes(q))
      .forEach(m => results.push({ label: m, type: "market" }));
    PROPERTIES.filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 3).forEach(p => results.push({ label: p.name, type: "property" }));
    PROPERTIES.filter(p => p.address.toLowerCase().includes(q))
      .slice(0, 2).forEach(p => results.push({ label: p.address.split(",")[0].trim(), type: "address" }));
    return results.slice(0, 6);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PROPERTIES.filter((p) => {
      if (filters.market !== "All" && p.market !== filters.market) return false;
      if (p.netProfit < filters.minProfit) return false;
      if (p.monthlyRent > filters.maxRent) return false;
      if (filters.beds === 3 && p.beds < 3) return false;
      if (filters.beds > 0 && filters.beds < 3 && p.beds !== filters.beds) return false;
      if (q.length >= 2) {
        if (!p.market.toLowerCase().includes(q) &&
            !p.address.toLowerCase().includes(q) &&
            !p.name.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "profit-desc":    return b.netProfit - a.netProfit;
        case "profit-asc":    return a.netProfit - b.netProfit;
        case "score-desc":    return b.score - a.score;
        case "rent-asc":      return a.monthlyRent - b.monthlyRent;
        case "rent-desc":     return b.monthlyRent - a.monthlyRent;
        case "occupancy-desc": return b.occupancy - a.occupancy;
        case "payback-asc":   return a.paybackMonths - b.paybackMonths;
        default:              return b.netProfit - a.netProfit;
      }
    });
  }, [filters, searchQuery]);

  const selectedProperty = selectedId != null
    ? PROPERTIES.find((p) => p.id === selectedId) ?? null
    : null;

  const avgProfit = filtered.length > 0
    ? Math.round(filtered.reduce((s, p) => s + p.netProfit, 0) / filtered.length)
    : 0;
  const topProfit = filtered.length > 0 ? Math.max(...filtered.map(p => p.netProfit)) : 0;
  const investableCount = filtered.filter(p => p.score >= 60).length;

  const isFiltered =
    filters.market !== "All" || filters.minProfit !== 0 ||
    filters.maxRent !== 999999 || filters.beds !== 0 ||
    searchQuery.trim().length >= 2;

  function handleSuggestionClick(label: string, type: string) {
    if (type === "market") {
      setFilters(prev => ({ ...prev, market: label }));
      setSearchQuery("");
    } else {
      setSearchQuery(label);
    }
    setShowSuggestions(false);
  }

  const selectCls =
    "bg-[#161616] border border-[#242424] rounded-lg px-3 py-1.5 text-sm text-[#ccc] focus:outline-none focus:border-[#10b981] transition-colors appearance-none cursor-pointer";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>

      {/* ── Sticky top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30" style={{ background: "#0a0a0a" }}>

        {/* Row 1: Logo + Search + Filters toggle */}
        <div className="px-4 sm:px-6 pt-4 pb-3" style={{ borderBottom: "1px solid #141414" }}>
          <div className="max-w-5xl mx-auto">
            {/* Logo row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "#10b981", color: "#000" }}
                >
                  N
                </div>
                <span className="font-heading text-lg font-bold tracking-tight" style={{ color: "#f0f0f0" }}>
                  Nestly
                </span>
                <span className="hidden sm:inline text-xs ml-0.5" style={{ color: "#3a3a3a" }}>
                  STR Profit Intelligence
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* User menu */}
                {user ? (
                  <>
                    <span className="hidden sm:block text-xs truncate max-w-[140px]" style={{ color: "#555" }}>
                      {user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-[#1e1e1e]"
                      style={{ color: "#777", border: "1px solid #242424", background: "#161616" }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <a
                    href="/auth"
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: "#10b981", border: "1px solid #1a3a28", background: "#0d1a14" }}
                  >
                    Sign in
                  </a>
                )}

                {/* Filters toggle */}
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: showFilters ? "#0d1a14" : "#161616",
                    color: showFilters ? "#10b981" : "#777",
                    border: `1px solid ${showFilters ? "#1a3a28" : "#242424"}`,
                  }}
                >
                  <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M0 1.5h13M3 5.5h7M5 9.5h3"/>
                  </svg>
                  Filters
                  {(filters.minProfit !== 0 || filters.maxRent !== 999999 || filters.beds !== 0) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] flex-shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative" ref={searchRef}>
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="15" height="15" viewBox="0 0 15 15" fill="none"
                style={{ color: "#404040" }}
              >
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={e => { setShowSuggestions(true); e.currentTarget.style.borderColor = "#10b981"; }}
                onBlur={e => (e.currentTarget.style.borderColor = "#222")}
                placeholder="Search any city, neighborhood, or address..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm"
                style={{
                  background: "#141414",
                  border: "1px solid #222",
                  color: "#f0f0f0",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-[#2a2a2a]"
                  style={{ color: "#555" }}
                >
                  ✕
                </button>
              )}

              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                  style={{ background: "#161616", border: "1px solid #252525", boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => handleSuggestionClick(s.label, s.type)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1e1e1e]"
                      style={{ color: "#c0c0c0", borderTop: i > 0 ? "1px solid #1c1c1c" : "none" }}
                    >
                      <span style={{ fontSize: 13 }}>
                        {s.type === "market" ? "📍" : s.type === "property" ? "🏠" : "📫"}
                      </span>
                      <span className="flex-1 truncate">{s.label}</span>
                      {s.type === "market" && (
                        <span className="text-xs flex-shrink-0" style={{ color: "#444" }}>Market</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Market pills */}
        <div className="px-4 sm:px-6 py-2" style={{ background: "#080808", borderBottom: "1px solid #141414" }}>
          <div className="max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto">
            {MARKETS.slice(1).map(market => {
              const active = filters.market === market;
              return (
                <button
                  key={market}
                  onClick={() => setFilters(prev => ({ ...prev, market: active ? "All" : market }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    background: active ? `${marketColors[market]}1a` : "#141414",
                    color: active ? marketColors[market] : "#555",
                    border: `1px solid ${active ? marketColors[market] + "44" : "#1e1e1e"}`,
                  }}
                >
                  <span>{MARKET_ICONS[market]}</span>
                  {market}
                </button>
              );
            })}
            {isFiltered && (
              <button
                onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); }}
                className="ml-auto flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{ color: "#f87171", border: "1px solid #3a1515", background: "#160808" }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Stats strip */}
        <div className="px-4 sm:px-6 py-2" style={{ background: "#0a0a0a", borderBottom: "1px solid #141414" }}>
          <div className="max-w-5xl mx-auto flex items-center gap-5 sm:gap-8">
            <StatPill label="Showing" value={`${filtered.length} props`} />
            <StatPill label="Avg Profit" value={fmt(avgProfit)} color="#10b981" />
            <StatPill label="Top Deal" value={fmt(topProfit)} color="#34d399" />
            <StatPill label="Investable" value={`${investableCount} / ${PROPERTIES.length}`} color="#f59e0b" />
          </div>
        </div>

        {/* Row 4: Expandable filters */}
        {showFilters && (
          <div className="px-4 sm:px-6 py-3" style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
            <div className="max-w-5xl mx-auto flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "#444" }}>Min Profit</label>
                <select value={filters.minProfit} onChange={e => setFilters(prev => ({ ...prev, minProfit: Number(e.target.value) }))} className={selectCls}>
                  <option value={0}>Any profit</option>
                  <option value={500}>$500+</option>
                  <option value={1000}>$1,000+</option>
                  <option value={1500}>$1,500+</option>
                  <option value={2000}>$2,000+</option>
                  <option value={2500}>$2,500+</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "#444" }}>Max Rent</label>
                <select value={filters.maxRent} onChange={e => setFilters(prev => ({ ...prev, maxRent: Number(e.target.value) }))} className={selectCls}>
                  <option value={999999}>Any rent</option>
                  <option value={1500}>≤ $1,500</option>
                  <option value={2000}>≤ $2,000</option>
                  <option value={2500}>≤ $2,500</option>
                  <option value={3000}>≤ $3,000</option>
                  <option value={4000}>≤ $4,000</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "#444" }}>Beds</label>
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #242424" }}>
                  {[0, 1, 2, 3].map(b => (
                    <button
                      key={b}
                      onClick={() => setFilters(prev => ({ ...prev, beds: b }))}
                      className="px-3 py-1.5 text-xs transition-colors"
                      style={{
                        background: filters.beds === b ? "#10b981" : "#161616",
                        color: filters.beds === b ? "#000" : "#888",
                        fontWeight: filters.beds === b ? 700 : 400,
                        borderLeft: b > 0 ? "1px solid #242424" : undefined,
                      }}
                    >
                      {b === 0 ? "Any" : b === 3 ? "3+" : b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "#444" }}>Sort</label>
                <select value={filters.sortBy} onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))} className={selectCls}>
                  <option value="profit-desc">Profit: High → Low</option>
                  <option value="profit-asc">Profit: Low → High</option>
                  <option value="score-desc">Score: Best First</option>
                  <option value="rent-asc">Rent: Low → High</option>
                  <option value="rent-desc">Rent: High → Low</option>
                  <option value="occupancy-desc">Occupancy: High → Low</option>
                  <option value="payback-asc">Payback: Fastest First</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Property Grid ────────────────────────────────────────────────── */}
      <main className="px-4 sm:px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <DisclaimerBanner />

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-heading text-2xl font-semibold mb-2" style={{ color: "#333" }}>
                No properties match
              </p>
              <p className="text-sm mb-5" style={{ color: "#555" }}>
                Try a different search or loosen your filters
              </p>
              <button
                onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); }}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ background: "#10b981", color: "#000", fontWeight: 600 }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  selected={selectedId === property.id}
                  onClick={() => handlePropertyClick(property.id)}
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

      {/* ── Soft paywall modal ─────────────────────────────────────────────── */}
      {showPaywall && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 text-center"
            style={{ background: "#111", border: "1px solid #1e1e1e", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-5"
              style={{ background: "#10b981", color: "#000" }}
            >
              N
            </div>

            <h2 className="font-heading text-xl font-bold mb-2" style={{ color: "#f0f0f0" }}>
              You&apos;re finding great deals
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#666" }}>
              Create a free account to save properties, compare deals, and get
              notified when new listings match your criteria.
            </p>

            <a
              href="/auth"
              className="block w-full py-3 rounded-xl text-sm font-bold mb-3 transition-opacity hover:opacity-90"
              style={{ background: "#10b981", color: "#000" }}
            >
              Sign up free
            </a>
            <a
              href="/auth"
              className="block w-full py-3 rounded-xl text-sm mb-4 transition-colors hover:bg-[#1a1a1a]"
              style={{ color: "#888", border: "1px solid #1e1e1e" }}
            >
              Log in
            </a>

            <button
              onClick={() => { setShowPaywall(false); setPaywallSeen(true); }}
              className="text-xs transition-colors hover:text-[#888]"
              style={{ color: "#444" }}
            >
              Maybe later — continue browsing
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-6 mt-4" style={{ borderTop: "1px solid #141414" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "#3a3a3a" }}>
            © 2026 Nestly · Sample data for illustration purposes.
          </p>
          <p className="text-xs" style={{ color: "#2a2a2a" }}>
            Profit estimates assume 3-night avg stay · 3% platform fee · market cleaning rates
          </p>
        </div>
      </footer>
    </div>
  );
}
