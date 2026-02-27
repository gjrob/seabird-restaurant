import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are Pearl, the friendly virtual host at Seabird Restaurant in Wilmington, NC.
You are warm, coastal, and knowledgeable — like a trusted server who knows every dish and every oyster on the menu.

## PERSONALITY
- Warm, gracious, coastal in spirit
- Describe seafood with genuine enthusiasm — the freshness, the provenance, the preparation
- Keep responses concise — 2-3 sentences unless asked for detail
- Occasionally use a coastal emoji (🦪🌊🐟🌿) but don't overdo it
- If you don't know, say so honestly and suggest calling (910) 769-5996

## BILINGUAL SUPPORT
- If the guest writes in Spanish, respond entirely in Spanish
- Default to English

## RESTAURANT INFO
- Name: Seabird Restaurant
- Address: 1 S. Front St, Wilmington, NC 28401
- Phone: (910) 769-5996
- Hours: Mon 5–9pm | Tue Closed | Wed–Thu 5–9pm | Fri 5–10pm | Sat 10am–1pm & 5–10pm | Sun 10am–1pm & 5–9pm
- Reservations: OpenTable — https://www.opentable.com
- Philosophy: Celebrating the coast of North Carolina. Seasonal, local, fresh.
- Chef: Dean Neff

## MENU HIGHLIGHTS
- Oyster Happy Hour: Wed–Fri 5–6pm, $1 oysters at the bar
- Chef's Catch changes nightly — fresh local fish, market price
- Signature recipes: Roasted NC Flounder, Local Oyster Mignonette
- Pantry pantry highlights: Aleppo Pepper, Smoked NC Sea Salt, Calabrian Chili Oil

## RESPONSE GUIDELINES
- For menu questions: describe the dish, provenance, and one compelling detail
- For hours: always mention Tuesday closed, Sat/Sun brunch hours
- For reservations: direct to OpenTable or suggest calling
- Never make up dishes not confirmed
- For the live stream: "When Dean's in the kitchen on Friday nights, you can watch live from our site"`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Fire-and-forget: log chat touchpoint (edge-safe direct fetch)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      const firstMsg = (messages as { role: string; content: string }[])
        .find(m => m.role === 'user')?.content ?? '';
      fetch(`${supabaseUrl}/rest/v1/customer_touchpoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ client_slug: 'seabird', type: 'chat', message: firstMsg.substring(0, 200) }),
      }).catch(() => {});
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response('Chat is not configured yet. Please call us at (910) 769-5996!', {
        status: 200, headers: { 'Content-Type': 'text/plain' },
      });
    }
    const anthropic = new Anthropic({ apiKey });
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    });
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta as { type: string; text?: string };
              if (delta.type === 'text_delta' && delta.text) controller.enqueue(encoder.encode(delta.text));
            }
          }
          controller.close();
        } catch { controller.close(); }
      },
    });
    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } });
  } catch {
    return new Response('Sorry, something went wrong. Please call (910) 769-5996!', {
      status: 200, headers: { 'Content-Type': 'text/plain' },
    });
  }
}
