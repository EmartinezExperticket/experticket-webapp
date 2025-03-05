import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { detectAction } from "../../utils/intentDetector";

// Configuración de OpenAI
const openai = new OpenAI({
    apiKey: process.env.NEXT_OPENAI_API_KEY,
});

const BASE_URL = process.env.EXPERTICKET_API_BASEURL || "https://yourbaseurl";

// Endpoint dedicado a generación de código técnico
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

        if (!action) {
            return NextResponse.json({
                error: "No technical action detected for this message.",
                code: null
            });
        }

        const code = await generateTechnicalCode(action, message);

        return NextResponse.json({ code });

    } catch (error) {
        console.error("Error in /api/chat-ai-generate-code:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Unknown error",
            code: null
        }, { status: 500 });
    }
}

// Generar código técnico con prompt dinámico
async function generateTechnicalCode(action: any, userMessage: string): Promise<string | null> {
    const technicalPrompt = getTechnicalPrompt(action, userMessage);

    const response = await openai.chat.completions.create({
        model: "ft:gpt-3.5-turbo-0125:personal::B1piw0MB",
        messages: [{ role: "system", content: technicalPrompt }],
        max_tokens: 1000,
        temperature: 0.5,
    });

    return extractCode(response.choices[0]?.message?.content || "");
}

// Crear el prompt técnico limpio y especializado
function getTechnicalPrompt(action: any, userMessage: string): string {
    const { endpoint, method, params } = action;

    const paramsString = JSON.stringify(params, null, 4)
        .replace(/"string"/g, '"<valor>"')
        .replace(/"number"/g, '0')
        .replace(/"boolean"/g, 'true');

    return `
You are a code generator specialized in Experticket's API.
Your task is to generate a complete working JavaScript function using fetch.
Start the code with the required params object, like this:

const params = ${paramsString};

- If the method is GET, serialize 'params' using 'new URLSearchParams(params)'.
- If the method is POST, send 'params' directly as the JSON body.

This is the action to implement:
- Endpoint: ${endpoint}
- Method: ${method}
- Headers: { "Content-Type": "application/json", "Accept": "application/json" }

This was the original user request:
"${userMessage}"

Return only the complete code inside a markdown code block like this:
\`\`\`javascript
// Código aquí
\`\`\`

The final result must:
- Be complete and runnable.
- Use modern JavaScript (ES Modules).
- Work in browser context (no node-fetch).
- Accept 'baseURL' as argument.
- Start by declaring 'params' (the complete object).
- For GET, convert params into query string.
- For POST, send params directly in the body.
- Use try/catch and proper error handling.
`.trim();
}

// Extraer código de bloques markdown
function extractCode(text: string): string | null {
    const match = text.match(/```javascript\n([\s\S]*?)\n```/);
    return match ? match[1].trim() : null;
}
