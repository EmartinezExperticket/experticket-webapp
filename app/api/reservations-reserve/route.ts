import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;
    const defaultApiVersion: string = '3.21'; // Default API version if not provided

    if (!baseUrl || !apiKey) {
        return NextResponse.json(
            { error: 'Missing required environment variables.' },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();

        console.log('body', body);

        if (!body.AccessDateTime || !body.Products) {
            return NextResponse.json(
                { error: 'Missing required fields: Products.' },
                { status: 400 }
            );
        }

        const requestBody = {
            ...body,
            apiKey: apiKey,
            isTest: body.isTest || 'false',
        };

        const apiVersion = req.nextUrl.searchParams.get('api-version') || defaultApiVersion;
        const apiUrl = `${baseUrl}/reservation?api-version=${encodeURIComponent(apiVersion)}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(requestBody),
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