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
        const body = await req.json();

        if (!body.ProductIds || !body.TicketsQuestionsProfileIds) {
            return NextResponse.json(
                { error: 'Missing required fields: ProductIds or TicketsQuestionsProfileIds.' },
                { status: 400 }
            );
        }

        const requestBody = {
            ...body,
            PartnerId: partnerId,
        };

        const apiUrl = `${baseUrl}/checkticketsquestions`;

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
