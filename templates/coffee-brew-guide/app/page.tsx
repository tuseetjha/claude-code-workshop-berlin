"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";

const BREW_METHODS = [
  "Filter / Pour Over (V60)",
  "French Press",
  "AeroPress",
  "Espresso",
  "Moka Pot",
  "Cold Brew",
  "Chemex",
  "Siphon / Vacuum Pot",
];

type CoffeeDetails = {
  producer: string;
  origin: string;
  altitude: string | null;
  variety: string | null;
  processing: string;
  roastLevel: string | null;
};

type BrewStep = {
  step: number;
  title: string;
  instruction: string;
  time: string | null;
};

type BrewGuide = {
  temperature: string;
  coffeeAmount: string;
  waterAmount: string;
  ratio: string;
  totalBrewTime: string;
  grindSize: string;
  steps: BrewStep[];
  tasterNotes: string;
};

type Result = {
  coffeeDetails: CoffeeDetails;
  brewGuide: BrewGuide;
};

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [brewMethod, setBrewMethod] = useState<string>(BREW_METHODS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent the browser from opening dropped files in a new tab
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("dragover", prevent);
    document.addEventListener("drop", prevent);
    return () => {
      document.removeEventListener("dragover", prevent);
      document.removeEventListener("drop", prevent);
    };
  }, []);

  function handleFile(file: File) {
    setResult(null);
    setError(null);
    const type = file.type || "image/jpeg";
    setMediaType(type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      // Strip the data URL prefix to get raw base64
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleSubmit() {
    if (!imageBase64) { setError("Please upload a photo of your coffee bag."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/brew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType, brewMethod }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">☕</div>
          <h1 className="text-4xl font-bold text-espresso tracking-tight">Coffee Brew Guide</h1>
          <p className="mt-2 text-roast text-lg">Upload your coffee bag — get a personalised recipe in seconds.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">
              1. Photo of your coffee bag
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                ${dragging ? "border-caramel bg-yellow-50" : "border-steam hover:border-caramel"}
              `}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Coffee bag" className="max-h-64 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="space-y-2 text-roast">
                  <div className="text-3xl">📷</div>
                  <p className="font-medium">Drag & drop or click to upload</p>
                  <p className="text-sm text-gray-400">JPG, PNG, WebP</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
            {imagePreview && (
              <button
                onClick={() => { setImagePreview(null); setImageBase64(null); setResult(null); }}
                className="mt-2 text-xs text-roast underline hover:text-espresso"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Brew method */}
          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">
              2. Brewing method
            </label>
            <select
              value={brewMethod}
              onChange={(e) => setBrewMethod(e.target.value)}
              className="w-full border border-steam rounded-xl px-4 py-3 text-espresso bg-cream focus:outline-none focus:ring-2 focus:ring-caramel"
            >
              {BREW_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !imageBase64}
            className="w-full bg-espresso text-cream font-semibold py-3 rounded-xl hover:bg-roast disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Analysing your beans…" : "Generate Brew Guide →"}
          </button>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 space-y-6">

            {/* Coffee details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-espresso mb-4">☕ Your Coffee</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["Producer", result.coffeeDetails.producer],
                  ["Origin", result.coffeeDetails.origin],
                  ["Processing", result.coffeeDetails.processing],
                  ["Roast Level", result.coffeeDetails.roastLevel],
                  ["Variety", result.coffeeDetails.variety],
                  ["Altitude", result.coffeeDetails.altitude],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label as string}>
                      <dt className="text-roast font-medium">{label}</dt>
                      <dd className="text-espresso font-semibold">{value}</dd>
                    </div>
                  ) : null
                )}
              </dl>
            </div>

            {/* Brew parameters */}
            <div className="bg-espresso text-cream rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold mb-4">🧪 Brew Parameters — {brewMethod}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ["💧 Water", result.brewGuide.waterAmount],
                  ["⚖️ Coffee", result.brewGuide.coffeeAmount],
                  ["📊 Ratio", result.brewGuide.ratio],
                  ["🌡️ Temperature", result.brewGuide.temperature],
                  ["🌀 Grind", result.brewGuide.grindSize],
                  ["⏱️ Total Time", result.brewGuide.totalBrewTime],
                ].map(([label, value]) => (
                  <div key={label as string} className="bg-roast rounded-xl p-4 text-center">
                    <p className="text-xs text-steam mb-1">{label}</p>
                    <p className="font-bold text-base">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-espresso mb-4">📋 Step-by-Step</h2>
              <ol className="space-y-4">
                {result.brewGuide.steps.map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-espresso text-cream text-sm font-bold flex items-center justify-center">
                      {s.step}
                    </span>
                    <div>
                      <p className="font-semibold text-espresso">
                        {s.title}
                        {s.time && <span className="ml-2 text-xs font-normal text-roast bg-steam px-2 py-0.5 rounded-full">{s.time}</span>}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">{s.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Taster notes */}
            {result.brewGuide.tasterNotes && (
              <div className="bg-caramel/10 border border-caramel/30 rounded-2xl p-6">
                <h2 className="text-base font-bold text-espresso mb-2">🎨 Tasting Notes</h2>
                <p className="text-sm text-roast leading-relaxed">{result.brewGuide.tasterNotes}</p>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}
