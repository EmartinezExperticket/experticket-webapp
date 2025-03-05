import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.NEXT_OPENAI_API_KEY,
});

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { code, targetLanguage } = await req.json();

        if (!code || !targetLanguage) {
            return NextResponse.json({ error: "Both 'code' and 'targetLanguage' are required" }, { status: 400 });
        }

        const translationPrompt = `
You are a professional code translator.
You will receive a block of source code written in any language.
Your task is to translate this code **directly** into the target language: ${targetLanguage}.
Preserve the original logic, structure, comments (if any), function names, parameters, and purpose.

This is the source code to translate:
\`\`\`
${code}
\`\`\`

Translate it into ${targetLanguage}, and return only the translated code wrapped like this:

\`\`\`${targetLanguage.toLowerCase()}
<translated code>
\`\`\`

Do not add explanations, introductions, or comments. Return only the code block.
`.trim();

        const response = await openai.chat.completions.create({
            model: "ft:gpt-3.5-turbo-0125:personal::B1piw0MB",
            messages: [{ role: "system", content: translationPrompt }],
            max_tokens: 1000,
            temperature: 0.3,
        });

        const translatedCode = extractCode(response.choices[0]?.message?.content || "", targetLanguage);

        return NextResponse.json({ code: translatedCode });

    } catch (error) {
        console.error("Error in /api/chat-ai-translate-code:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

// Extractor de bloques de código, adaptado a cualquier lenguaje
function extractCode(text: string, language: string): string | null {
    const lowerLang = language.toLowerCase();
    const match = text.match(new RegExp(`\`\`\`${lowerLang}\\n([\\s\\S]*?)\\n\`\`\``));
    return match ? match[1].trim() : text.trim(); // Fallback por si responde sin bloque
}
