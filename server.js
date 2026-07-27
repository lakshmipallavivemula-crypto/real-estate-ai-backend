const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// OpenAI Client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Home Route
app.get("/", (req, res) => {
  res.send("Real Estate AI Backend is Running!");
});

// Meta Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("Webhook Verified!");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive WhatsApp Messages
app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming Webhook:");
    console.log(JSON.stringify(req.body, null, 2));

    const message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

    if (!message) {
      return res.sendStatus(200);
    }

    console.log("User:", message);

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for a Dubai real estate agency.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    console.log("AI Reply:");
    console.log(reply);

    res.sendStatus(200);
  } catch (err) {
    console.error("ERROR:", err);
    res.sendStatus(500);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});