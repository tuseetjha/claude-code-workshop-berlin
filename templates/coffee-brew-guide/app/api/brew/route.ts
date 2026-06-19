import { NextRequest, NextResponse } from "next/server";

const COFFEE_DETAILS = {
  producer: "Finca El Paraíso",
  origin: "Huila, Colombia",
  altitude: "1,850 masl",
  variety: "Pink Bourbon",
  processing: "Double Fermented Washed",
  roastLevel: "Light",
};

const BREW_GUIDES: Record<string, object> = {
  default: {
    temperature: "93°C / 200°F",
    coffeeAmount: "18g",
    waterAmount: "300ml",
    ratio: "1:16.7",
    totalBrewTime: "3:30 min",
    grindSize: "Medium-fine",
    steps: [
      { step: 1, title: "Heat & Rinse", instruction: "Heat water to 93°C. Place filter in dripper and rinse with hot water to remove paper taste. Discard rinse water.", time: "0:00" },
      { step: 2, title: "Add Coffee", instruction: "Add 18g of medium-fine ground coffee. Shake gently to level the bed.", time: "0:30" },
      { step: 3, title: "Bloom", instruction: "Pour 40ml of water in a slow spiral, saturating all the grounds. Wait 30 seconds for CO₂ to off-gas.", time: "0:45" },
      { step: 4, title: "First Pour", instruction: "Pour to 150ml total, keeping water level steady above the grounds. Use a slow, consistent spiral pour.", time: "1:15" },
      { step: 5, title: "Second Pour", instruction: "Once water drops to the level of the grounds, pour to 300ml total. Maintain gentle agitation.", time: "2:00" },
      { step: 6, title: "Drawdown", instruction: "Allow the remaining water to drain fully through the bed. Total brew time target: 3:30.", time: "2:45" },
      { step: 7, title: "Serve", instruction: "Remove dripper and give the carafe a gentle swirl. Pour immediately and enjoy.", time: "3:30" },
    ],
    tasterNotes: "Expect a vibrant, clean cup with pronounced berry sweetness — think strawberry and hibiscus — underpinned by a bright citric acidity. The Pink Bourbon variety and double fermentation process bring a unique floral complexity that lingers through a silky, tea-like finish.",
  },
  "French Press": {
    temperature: "94°C / 201°F",
    coffeeAmount: "30g",
    waterAmount: "500ml",
    ratio: "1:16.7",
    totalBrewTime: "4:00 min",
    grindSize: "Coarse",
    steps: [
      { step: 1, title: "Preheat", instruction: "Fill the French press with hot water and let it sit for 30 seconds to warm the glass. Discard the water.", time: "0:00" },
      { step: 2, title: "Add Coffee", instruction: "Add 30g of coarsely ground coffee to the empty French press.", time: "0:30" },
      { step: 3, title: "Pour", instruction: "Pour 500ml of 94°C water over the grounds in a circular motion, ensuring all grounds are saturated.", time: "0:45" },
      { step: 4, title: "Stir & Steep", instruction: "Give it a gentle stir to ensure even saturation. Place the lid on (plunger up) and steep for 4 minutes.", time: "1:00" },
      { step: 5, title: "Break the Crust", instruction: "After 4 minutes, remove the lid and scoop off the floating crust of coffee grounds from the surface.", time: "4:00" },
      { step: 6, title: "Plunge & Pour", instruction: "Slowly press the plunger down over 20–30 seconds. Pour immediately into your cup — don't let it sit or it will over-extract.", time: "4:15" },
    ],
    tasterNotes: "The French press brings out a fuller, more rounded body than filter methods. With the Pink Bourbon's natural sweetness, expect jammy red fruit and a rich, almost chocolatey mouthfeel, with the floral notes softened into a smooth, comforting finish.",
  },
  "Espresso": {
    temperature: "92°C / 198°F",
    coffeeAmount: "18g",
    waterAmount: "36ml",
    ratio: "1:2",
    totalBrewTime: "28 sec",
    grindSize: "Fine",
    steps: [
      { step: 1, title: "Warm Up", instruction: "Run a blank shot through the machine to heat the group head and portafilter evenly.", time: "0:00" },
      { step: 2, title: "Grind & Dose", instruction: "Grind 18g of coffee fine (slightly finer than table salt). Distribute evenly in the portafilter basket.", time: "0:15" },
      { step: 3, title: "Tamp", instruction: "Apply firm, level pressure — around 15–20kg. Ensure the tamp is perfectly flat to avoid channeling.", time: "0:30" },
      { step: 4, title: "Lock & Pull", instruction: "Lock the portafilter in. Start the shot immediately. Target 36ml yield in 25–30 seconds.", time: "0:45" },
      { step: 5, title: "Evaluate", instruction: "The shot should flow like warm honey — not gushing (too coarse) or dripping (too fine). Adjust grind for next shot if needed.", time: "1:15" },
    ],
    tasterNotes: "As espresso, the Pink Bourbon delivers an intensely sweet, syrupy shot with a thick hazelnut-coloured crema. Expect concentrated strawberry jam and rose water up front, transitioning to a lingering dark chocolate and citrus rind finish.",
  },
  "AeroPress": {
    temperature: "85°C / 185°F",
    coffeeAmount: "15g",
    waterAmount: "200ml",
    ratio: "1:13.3",
    totalBrewTime: "2:00 min",
    grindSize: "Medium",
    steps: [
      { step: 1, title: "Rinse Filter", instruction: "Place a paper filter in the AeroPress cap. Rinse with hot water, then attach to the chamber.", time: "0:00" },
      { step: 2, title: "Add Coffee", instruction: "Set the AeroPress on your cup. Add 15g of medium-ground coffee.", time: "0:20" },
      { step: 3, title: "Pour", instruction: "Pour 200ml of 85°C water over the grounds, starting a timer. Stir 3 times to ensure even saturation.", time: "0:30" },
      { step: 4, title: "Steep", instruction: "Place the plunger on top and pull up slightly to create a seal. Steep for 1 minute.", time: "0:45" },
      { step: 5, title: "Press", instruction: "Apply slow, steady downward pressure over 30 seconds. Stop when you hear a hiss of air.", time: "1:45" },
    ],
    tasterNotes: "The lower brew temperature and short steep time highlight the Pink Bourbon's delicate floral and citrus notes without over-extracting the natural sugars. Expect a clean, bright cup reminiscent of peach iced tea with a sweet, lingering finish.",
  },
};

function getBestGuide(brewMethod: string) {
  for (const key of Object.keys(BREW_GUIDES)) {
    if (brewMethod.toLowerCase().includes(key.toLowerCase())) {
      return BREW_GUIDES[key];
    }
  }
  return BREW_GUIDES["default"];
}

export async function POST(req: NextRequest) {
  const { brewMethod } = await req.json();

  // Simulate a short processing delay so the demo feels real
  await new Promise((r) => setTimeout(r, 1800));

  return NextResponse.json({
    coffeeDetails: COFFEE_DETAILS,
    brewGuide: getBestGuide(brewMethod ?? ""),
  });
}
