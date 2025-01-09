import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
        return NextResponse.json(
            { error: 'Missing required environment variables.' },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();

        if (!body.ReservationId || !body.AccessDateTime || !body.Products) {
            return NextResponse.json(
                { error: 'Missing required fields: ReservationId, AccessDateTime, or Products.' },
                { status: 400 }
            );
        }

        const requestBody = {
            ...body,
            ApiKey: apiKey,
        };

        const apiUrl = `${baseUrl}/transaction`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Failed to create transaction: ${response.statusText}`);
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
