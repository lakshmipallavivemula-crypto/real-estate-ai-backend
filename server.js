const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Real Estate AI Backend is Running!");
});

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.VERIFY_TOKEN
  ) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive WhatsApp messages
app.post("/webhook", async (req, res) => {
  try {
    console.log(JSON.stringify(req.body, null, 2));

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for a Dubai real estate agency.",
        },
        {
          role: "user",
          content: "A customer says: Hello",
        },
      ],
    });

    console.log("AI Response:");
    console.log(aiResponse.choices[0].message.content);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});