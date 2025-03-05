import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { detectAction } from "../../utils/intentDetector";

const openai = new OpenAI({
    apiKey: process.env.NEXT_OPENAI_API_KEY,
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// System Prompt para preguntas generales (sin código)
const systemPrompt = `
You are a virtual assistant specializing in Ticketing and Experticket, with a relaxed, optimistic, and professional personality.
You explain concepts clearly and accessibly while ensuring users feel comfortable asking about Experticket or API integration.

If the user requests a working example, do not describe the URL, parameters, headers, or request body. Simply respond with:
"I'll show you the example on the right panel." (Or the equivalent in the language the user is using).

Do not generate or explain any code inside this chat. The code will appear in the side panel.
`.trim();

export async function POST(req: NextRequest): Promise<NextResponse> {
    if (!openai.apiKey) {
        return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
    }

    try {
        const { message } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const action = detectAction(message);

        let reply = "";
        let code = null;

        if (action) {
            // Cuando hay una intención técnica, responde fijo y genera código con nueva route
            reply = getTechnicalReplyMessage(message);
            code = await fetchGeneratedCode(action, message);  // Aquí se manda la acción COMPLETA
        } else {
            // Pregunta general → Chat normal
            reply = await getChatbotReply(message);
        }

        return NextResponse.json({ reply, code });
    } catch (error) {
        console.error("Error in /api/chat-ai-general:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// Chat amigable (sólo para preguntas generales)
async function getChatbotReply(userMessage: string): Promise<string> {
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
    ];

    const chatResponse = await openai.chat.completions.create({
        model: "ft:gpt-3.5-turbo-0125:personal::B1piw0MB",
        messages,
        max_tokens: 500,
        temperature: 0.8,
    });

    return chatResponse.choices[0]?.message?.content || "No response available.";
}

// Respuesta fija cuando hay intención técnica detectada
function getTechnicalReplyMessage(originalMessage: string): string {
    const isSpanish = /[a-záéíóúñ]/i.test(originalMessage) && !/[a-z]/i.test(originalMessage.replace(/[áéíóúñ]/gi, ""));
    return isSpanish
        ? "Te mostraré un ejemplo de código en el panel derecho."
        : "I'll show you an example on the right panel.";
}

// Aquí se manda `action` y `message` al nuevo endpoint
async function fetchGeneratedCode(action: any, message: string): Promise<string | null> {
    const response = await fetch(`${API_BASE_URL}/api/chat-ai-generate-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, message }),  // 👈 Aquí va el action completo
    });

    if (!response.ok) {
        console.error(`Failed to fetch generated code: ${response.statusText}`);
        return null;
    }

    const { code } = await response.json();
    return code;
}
