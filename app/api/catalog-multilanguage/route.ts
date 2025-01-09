import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;

    // Default language code
    const defaultLanguageCode: string = 'en'; // Default to 'en'
    const languageCode: string = req.nextUrl.searchParams.get('LanguageCode') || defaultLanguageCode;

    // Validate the language code
    const allowedLanguages: string[] = ['es', 'en', 'fr', 'it'];
    if (!allowedLanguages.includes(languageCode)) {
        return NextResponse.json(
            { error: `Invalid LanguageCode. Allowed values: ${allowedLanguages.join(', ')}` },
            { status: 400 }
        );
    }

    if (!baseUrl || !apiKey || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables' },
            { status: 500 }
        );
    }

    const apiUrl: string = `${baseUrl}/catalog?PartnerId=${encodeURIComponent(
        partnerId
    )}&LanguageCode=${encodeURIComponent(languageCode)}`;

    try {
        const response: Response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: Record<string, any> = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
