import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;
    const defaultApiVersion: string = '3.21'; 
    const defaultLanguageCode: string = 'en'; // Default language code if not provided

    if (!baseUrl || !apiKey || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables' },
            { status: 500 }
        );
    }

    // Retrieve optional query parameters
    const urlParams = req.nextUrl.searchParams;
    const providerIds = urlParams.get('ProviderIds') || ''; // Comma-separated provider IDs
    const languageCode = urlParams.get('LanguageCode') || defaultLanguageCode;
    const apiVersion = urlParams.get('api-version') || defaultApiVersion;


    const apiUrl = `${baseUrl}/providers?PartnerId=${encodeURIComponent(
        partnerId
    )}&LanguageCode=${encodeURIComponent(languageCode)}&api-version=${encodeURIComponent(apiVersion)}${
        providerIds ? `&ProviderIds=${encodeURIComponent(providerIds)}` : ''
    }`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
