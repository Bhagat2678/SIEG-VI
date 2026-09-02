import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "AyurLife AyurLife Care",
    timestamp: new Date().toISOString(),
  });
});

// AyurAI Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userDosha = "Vata-Pitta", query } = req.body;
    const client = getAIClient();

    const systemPrompt = `You are "AyurAI Assistant", an empathetic, highly knowledgeable Ayurvedic health and lifestyle specialist on the AyurLife AyurLife Care platform.
You combine authentic Ayurvedic wisdom (Tridosha: Vata, Pitta, Kapha, Agni, Dinacharya, Ahara, Dravyaguna herbs like Ashwagandha, Brahmi, Triphala, CCF Tea) with holistic modern lifestyle guidance.
The user's current Prakriti context is: ${userDosha}.

When answering:
1. Provide a warm, calm, grounding response.
2. If recommending herbal teas, dietary adjustments, or habits, provide clear rationale (e.g., explaining Agni, balancing excess Vata dryness/coldness, or cooling Pitta heat).
3. If relevant, format key herbal remedies or recipes with concise bullet points.
4. Always maintain safety and conclude with a gentle note when clinical review is warranted.`;

    if (client) {
      const chatMessages = (messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      if (query) {
        chatMessages.push({
          role: "user",
          parts: [{ text: query }],
        });
      }

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...chatMessages,
        ],
      });

      const replyText = response.text || "I am here to guide your Ayurvedic vitality journey. How can I assist your Agni and Dosha balance today?";
      return res.json({ reply: replyText });
    } else {
      // Intelligent fallback Ayurvedic response when GEMINI_API_KEY is not configured
      const qLower = (query || "").toLowerCase();
      let fallbackReply = "";

      if (qLower.includes("digest") || qLower.includes("sluggish") || qLower.includes("tea") || qLower.includes("ccf")) {
        fallbackReply = `That feeling of heaviness often points to sluggish Agni (digestive fire) or a slight Kapha-Vata imbalance after eating.\n\nI recommend CCF Tea (Cumin, Coriander, Fennel seeds in equal parts steeped in hot water). This classic tridoshic blend gently kindles Agni without aggravating Pitta, while relieving bloating and gas.\n\nWould you like the exact recipe and steeping time?`;
      } else if (qLower.includes("sleep") || qLower.includes("insomnia") || qLower.includes("restless") || qLower.includes("ashwagandha")) {
        fallbackReply = `Restless sleep and waking frequently are characteristic signs of elevated Vata in the nervous system (Prana Vayu).\n\nTo restore deep, grounded rest, try warm spiced golden milk (turmeric, pinch of nutmeg, cardamom) 45 minutes before bed, coupled with 300mg of organic Ashwagandha and a 5-minute foot massage with warm sesame oil.`;
      } else if (qLower.includes("pitta") || qLower.includes("heat") || qLower.includes("acid") || qLower.includes("skin")) {
        fallbackReply = `For cooling excess Pitta (fire and water elements), prioritize sweet, bitter, and astringent tastes. Hydrate with room-temperature water infused with fresh mint or cucumber slices, and incorporate fresh coriander, ghee, and sweet fruits like melons and pears.`;
      } else if (qLower.includes("vata") || qLower.includes("anxious") || qLower.includes("dry")) {
        fallbackReply = `To pacify Vata, focus on grounding, warm, moist, and nourishing routines (Snigdha and Ushna). Enjoy warm cooked soups, healthy fats like A2 ghee, regular meal times, and Abhyanga (warm oil self-massage).`;
      } else {
        fallbackReply = `According to Ayurvedic principles, maintaining balance requires aligning your daily routine (Dinacharya) with your unique constitution (Prakriti). How are your current sleep, digestion (Agni), and energy levels throughout the day?`;
      }

      return res.json({ reply: fallbackReply });
    }
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      reply: "I am taking a mindful pause to recalibrate. Kindly verify your query or consult our Ayurvedic specialist.",
    });
  }
});

// Vite middleware & Static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AyurLife server running on http://0.0.0.0:${PORT}`);
  });
}

start();
