# Coffee Brew Guide

An AI-powered coffee brew guide. The user uploads a photo of a coffee bag; Claude reads the label (altitude, producer, variety, processing method) and returns a precise brew recipe for their chosen method.

## How it works

1. User uploads a photo of their coffee bag and picks a brew method.
2. The image is sent (base64) to `/api/brew` along with the chosen method.
3. The API route calls Claude `claude-opus-4-8` with vision — extracting bean details and generating a brew guide.
4. The page renders: coffee details, brew parameters (temp / dose / water / ratio / time / grind), step-by-step instructions, and tasting notes.

## Where things live

- **`app/page.tsx`** — all UI: image upload, method selector, results display.
- **`app/api/brew/route.ts`** — the server action that calls the Anthropic API.
- **`app/globals.css`** — base styles.
- **`tailwind.config.ts`** — color palette (`cream`, `espresso`, `roast`, `caramel`, `steam`).

## Environment variable

Create a `.env.local` file in this directory:

```
ANTHROPIC_API_KEY=your-api-key-here
```

You can copy `.env.local.example` as a starting point.

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Things to customise

- **Brew methods list** — edit the `BREW_METHODS` array at the top of `app/page.tsx`.
- **Claude model** — change `model` in `app/api/brew/route.ts` (default: `claude-opus-4-8`).
- **Prompt** — the brew guide prompt is in `app/api/brew/route.ts`. Adjust it to change what details are extracted or how the guide is structured.
- **Colors** — edit `tailwind.config.ts`.
