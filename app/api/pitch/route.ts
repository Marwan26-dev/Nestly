import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const TONE_INSTRUCTIONS: Record<string, string> = {
  "Data-Driven":
    "Be highly analytical. Lead with specific ROI numbers, profit margins, and break-even analysis. Use bullet points for key metrics. The landlord is a numbers-focused investor who responds to data and financial projections. Reference the exact figures for this property.",
  Relationship:
    "Be warm, personal, and trust-building. Focus on partnership, transparent communication, and care for the property. Emphasize long-term relationship and peace of mind. The landlord values trust and a hands-off experience. Feel genuine and conversational, not salesy.",
  Direct:
    "Be short, punchy, and decisive. No fluff — get straight to the point. 3–4 short paragraphs maximum. Clear call to action at the end. The landlord is busy and wants the bottom line fast.",
};

export async function POST(request: Request) {
  const body = await request.json();
  const {
    tone,
    name,
    address,
    market,
    beds,
    baths,
    monthlyRent,
    revenue,
    netProfit,
    adr,
    occupancy,
    profitMargin,
    breakEvenAdr,
    paybackMonths,
  } = body;

  const toneInstruction = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS["Direct"];

  const systemPrompt = `You are an expert copywriter for a short-term rental property management company called Nestly. You write compelling landlord pitch emails to convince property owners to allow STR (short-term rental) management of their units.

Nestly's credentials:
- 4+ years managing STR properties across Tennessee, Georgia, and Arizona
- 94% average guest satisfaction rating across all managed properties
- Full-service management: listing creation & optimization, dynamic pricing, cleaning coordination, guest communication, and maintenance coordination
- We manage all platform accounts (Airbnb, VRBO, direct booking site)
- Transparent monthly P&L statements sent to every owner on the 1st of the month
- No hidden fees — owners see every dollar in and every dollar out
- Average 18% higher revenue than self-managed comparables in the same market

Tone instruction: ${toneInstruction}

Write only the email — no preamble, no meta-commentary. Start with "Subject:" on the first line, then a blank line, then the email body. Sign off as "The Nestly Team."`;

  const userMessage = `Write a landlord pitch email for this specific property:

Property: ${name}
Address: ${address}
Market: ${market},
Beds/Baths: ${beds} bed / ${baths} bath
Monthly Rent: $${monthlyRent.toLocaleString()}/month
Projected Gross STR Revenue: $${revenue.toLocaleString()}/month
Projected Net Profit to Owner: $${netProfit.toLocaleString()}/month
ADR: $${adr}/night
Occupancy Rate: ${(occupancy * 100).toFixed(0)}%
Profit Margin: ${(profitMargin * 100).toFixed(1)}%
Break-even ADR: $${breakEvenAdr}/night (current ADR is ${Math.round(((adr - breakEvenAdr) / adr) * 100)}% above break-even)
Payback Period: ${paybackMonths.toFixed(1)} months

Reference the specific numbers above to make the email feel tailored to this exact property and landlord.`;

  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
