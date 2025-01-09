import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
        return NextResponse.json(
            { error: 'Missing required environment variables.' },
            { status: 500 }
        );
    }

    const urlParams = req.nextUrl.searchParams;
    const transactionId = urlParams.get('id');
    const includeLanguages = urlParams.get('IncludeTransactionDocumentsLanguages') || 'false';

    if (!transactionId) {
        return NextResponse.json(
            { error: 'Missing required query parameter: id (transaction identifier).' },
            { status: 400 }
        );
    }

    try {
        const encodedApiKey = encodeURIComponent(apiKey);
        const apiUrl = `${baseUrl}/transactiondocuments?ApiKey=${encodedApiKey}&id=${encodeURIComponent(
            transactionId
        )}&IncludeTransactionDocumentsLanguages=${encodeURIComponent(includeLanguages)}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
