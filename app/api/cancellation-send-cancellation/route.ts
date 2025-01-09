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

        const { SaleId, Reason, ReasonComments, IsTest = false } = body;
        if (!SaleId || !Reason) {
            return NextResponse.json(
                { error: 'Missing required fields: SaleId or Reason.' },
                { status: 400 }
            );
        }

        const requestBody = {
            ApiKey: apiKey,
            SaleId,
            Reason,
            ReasonComments,
            IsTest,
        };

        const apiUrl = `${baseUrl}/cancellationrequest`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Failed to send cancellation request: ${response.statusText}`);
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
