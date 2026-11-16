const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

// Initialise Gemini
const agent = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Models to try, in order
const models = [
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash-lite",
];

let primaryModelUnavailableUntil = 0;

const COOLDOWN_MS = 5 * 60 * 1000;

// Instructions for Tina
const systemInstruction = `
    You are Tina, an AI insurance consultant for Turners
    in New Zealand.

    Your role is to interview customers, understand their
    insurance needs, and recommend suitable products.

    START OF CONVERSATION:
    Introduce yourself and ask:
    "I'm Tina. I help you choose the right insurance policy.
    May I ask you a few questions about your vehicle to make sure
    I recommend the best policy for you?"

    Do not begin the interview until the customer agrees.
    If they decline, politely end the consultation.

    AVAILABLE PRODUCTS:
    1. Mechanical Breakdown Insurance (MBI)
    2. Comprehensive Car Insurance
    3. Third Party Car Insurance

    BUSINESS RULES:
    - MBI is not available for trucks or racing cars.
    - Comprehensive Car Insurance is only available for
      motor vehicles less than 10 years old.
    - Never recommend a product if the customer is ineligible.

    INTERVIEW RULES:
    - Generate questions dynamically based on the
      customer's previous answers.
    - Ask one question at a time.
    - Do not ask the customer which insurance product
      they want.
    - Gather enough information about the vehicle,
      its age, and the customer's insurance needs.
    - Do not assume missing information.
    - Keep the conversation natural and concise.
    - Use New Zealand terminology.

    RECOMMENDATION:
    Once you have enough information, recommend one
    or more of the three available products.

    Explain why each recommendation suits the customer.
    Do not recommend products outside the available three.
    Do not invent specific Turners policy terms or prices.
    Do not claim that the customer has purchased insurance
    or that their cover is active.

    After making your recommendation, ask whether the
    customer would like to proceed or has any questions.

    If the customer wants to arrange cover, provide
    the following official Turners contact details:

    Phone: 0800 TURNERS (0800 887 637)
    Email: contact@turners.co.nz

    When providing the contact email address, always format it as a Markdown link:
    [contact@turners.co.nz](mailto:contact@turners.co.nz)

    Do not invent alternative contact details or
    claim that cover can be purchased directly
    through this chat.

    CONSULTATION COMPLETION:
    After recommending insurance, allow the customer to
    ask follow-up questions.

    Only mark the consultation as complete when the
    customer clearly indicates they are finished, or
    when they decline consent at the beginning.

    When the consultation is complete, provide a
    brief, polite closing message and set interviewComplete to true.
`;

// Receive a message from the frontend
router.post("/", async (req, res) => {
    const { message, history = [] } = req.body;

    // Check that the message is valid
    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            error: "Please enter a valid message.",
        });
    }

    try {
        let response;

        // Try each model until one succeeds
        const availableModels =
            Date.now() < primaryModelUnavailableUntil ? [models[1]] : models;

        for (const model of availableModels) {
            try {
                console.log(`Trying ${model}...`);

                response = await agent.models.generateContent({
                    model: model,
                    contents: [
                        ...history,
                        {
                            role: "user",
                            parts: [{ text: message }],
                        },
                    ],
                    config: {
                        systemInstruction: systemInstruction,
                        responseMimeType: "application/json",

                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                reply: {
                                    type: "STRING",
                                },
                                interviewComplete: {
                                    type: "BOOLEAN",
                                },
                            },
                            required: ["reply", "interviewComplete"],
                        },

                        httpOptions: {
                            timeout: model === models[0] ? 15000 : 30000,
                        },
                    },
                });

                console.log(`Success with ${model}`);
                break;
            } catch (error) {
                console.error(`${model} failed:`, error.message);

                // Only switch models for temporary API failures
                if (
                    error.status !== 503 &&
                    error.status !== 429 &&
                    error.status !== 504
                ) {
                    throw error;
                }

                // If the last available model fails, return the error
                if (model === availableModels[availableModels.length - 1]) {
                    throw error;
                }

                // Start cooldown if the primary model failed
                if (model === models[0]) {
                    primaryModelUnavailableUntil = Date.now() + COOLDOWN_MS;
                }

                console.log("Switching to backup model...");
            }
        }

        // Return Gemini's response
        const result = JSON.parse(response.text);

        res.status(200).json({
            reply: result.reply,
            interviewComplete: result.interviewComplete,
        });
    } catch (error) {
        console.error(error);

        if (error.status === 503 || error.status === 429) {
            return res.status(503).json({
                error: "Tina is currently busy. Please try again shortly.",
            });
        }

        res.status(500).json({
            error: "Failed to communicate with Gemini.",
        });
    }
});

module.exports = router;
