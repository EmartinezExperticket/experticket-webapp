import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_OPENAI_API_KEY,
});

// SystemPrompt relajado (amigable, explicativo, personalidad definida)
const systemPrompt = `
You are a virtual assistant specializing in Ticketing and Experticket, with a relaxed, optimistic, and professional personality.
You explain concepts clearly and accessibly while ensuring users feel comfortable asking about Experticket or API integration.
`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!openai.apiKey) {
    return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const reply = await getChatbotReply(message);

    // Detectar flag oculta
    const triggerFlag = /<!--\s*CODEXPRTCKT:\s*(.*)\s*-->/;
    const match = reply.match(triggerFlag);

    let code = null;
    let cleanReply = reply;

    if (match) {
      const actionSummary = match[1].trim();
      cleanReply = reply.replace(triggerFlag, "").trim();
      code = await generateTechnicalCode(actionSummary);
    } else {
      code = extractCode(reply);
    }

    return NextResponse.json({ reply: cleanReply, code });
  } catch (error) {
    console.error("Error in /api/chat-ai-general endpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Primera llamada: chat amigable con el usuario
 */
async function getChatbotReply(userMessage: string): Promise<string> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `${userMessage}, If im asking for a working code example, explain the process naturally and end your response with this sentence: <!-- CODEXPRTCKT: {inside here a brief summary of what the user wants} -->` },
  ];

  const chatResponse = await openai.chat.completions.create({
    model: "ft:gpt-3.5-turbo-0125:personal::B1piw0MB",
    messages,
    max_tokens: 500,
    temperature: 0.8,
  });

  return chatResponse.choices[0]?.message?.content || "No response available.";
}

/**
 * Segunda llamada: generador técnico (solo si se detectó CODEXPRTCKT)
 */
async function generateTechnicalCode(actionSummary: string): Promise<string | null> {
  const technicalPrompt = `
You are a code generator specialized in Experticket's API.
Generate a complete working JavaScript function that performs the following action:

${actionSummary}

Return the result as a complete, runnable JavaScript function inside a markdown code block (\`\`\`javascript).
Prefer modern JavaScript (ES Modules) and use 'fetch' for HTTP requests.
Make sure to include necessary query params, headers, or body properties based on the endpoint and action.
`;

  const response = await openai.chat.completions.create({
    model: "ft:gpt-3.5-turbo-0125:personal::B1piw0MB",
    messages: [{ role: "system", content: technicalPrompt }],
    max_tokens: 1000,
    temperature: 0.5,
  });

  return extractCode(response.choices[0]?.message?.content || "");
}

/**
 * Utilidad para extraer bloques de código
 */
function extractCode(response: string): string | null {
  const codeBlockRegex = /```(?:javascript|js|json|bash|sh|curl)?\n([\s\S]*?)\n```/;
  const match = response.match(codeBlockRegex);
  return match ? match[1].trim() : null;
}
