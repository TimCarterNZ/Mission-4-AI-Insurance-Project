require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const tinaRouter = require("./routes/tina");
const app = express();
const PORT = 4000;
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/api/tina", tinaRouter);

// Initialises the Tina AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Test route
app.get("/", (req, res) => {
    res.send("Tina backend is working!");
});

// Test Gemini connection
app.get("/test-gemini", async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say hello. Your name is Tina.",
        });

        res.json({ message: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to communicate with Gemini.",
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
