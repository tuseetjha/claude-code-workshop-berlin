import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType, brewMethod } = await req.json();

  if (!imageBase64 || !brewMethod) {
    return NextResponse.json({ error: "Missing image or brew method" }, { status: 400 });
  }

  const prompt = `You are an expert specialty coffee barista and Q Grader.

The user has uploaded a photo of a coffee bean package. Carefully read and extract:
- Producer / Farm name
- Country or region of origin
- Altitude (if shown, e.g. "1800 masl")
- Variety / cultivar (e.g. Bourbon, Gesha, Typica)
- Processing method (e.g. Washed, Natural, Honey)
- Roast level if visible (e.g. Light, Medium, Dark)

Then, using those bean characteristics, produce a precise brew guide for the following method: **${brewMethod}**.

Respond ONLY with valid JSON in this exact shape:
{
  "coffeeDetails": {
    "producer": "string",
    "origin": "string",
    "altitude": "string or null",
    "variety": "string or null",
    "processing": "string",
    "roastLevel": "string or null"
  },
  "brewGuide": {
    "temperature": "string (e.g. '93°C / 200°F')",
    "coffeeAmount": "string (e.g. '18g')",
    "waterAmount": "string (e.g. '300ml')",
    "ratio": "string (e.g. '1:16.7')",
    "totalBrewTime": "string (e.g. '3:30 min')",
    "grindSize": "string (e.g. 'Medium-fine')",
    "steps": [
      { "step": 1, "title": "string", "instruction": "string", "time": "string or null" }
    ],
    "tasterNotes": "string (2-3 sentences on expected flavour based on the bean details)"
  }
}

Do not include any text outside the JSON object.`;

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to parse brew guide", raw: text }, { status: 500 });
  }
}
