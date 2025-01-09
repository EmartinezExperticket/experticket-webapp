import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;

    if (!baseUrl || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables' },
            { status: 500 }
        );
    }

    try {
        // Parse the body sent by the client
        const body = await req.json();

        // Ensure the body has the required fields
        if (!body.ProductIds || (!body.StartDate && !body.AccessDates)) {
            return NextResponse.json(
                { error: 'Missing required fields: ProductIds and either StartDate or AccessDates.' },
                { status: 400 }
            );
        }

        // Add PartnerId to the request body
        const requestBody = {
            ...body,
            PartnerId: partnerId,
        };


        const apiUrl = `${baseUrl}/RealTimePrices`;


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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
