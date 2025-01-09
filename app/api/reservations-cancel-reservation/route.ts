import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest): Promise<NextResponse> {
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

        if (!body.ReservationId) {
            return NextResponse.json(
                { error: 'Missing required field: ReservationId.' },
                { status: 400 }
            );
        }

        const requestBody = {
            ApiKey: apiKey,
            ReservationId: body.ReservationId,
            IsTest: body.IsTest || 'false',
        };

        const apiUrl = `${baseUrl}/reservation`;

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Failed to cancel reservation: ${response.statusText}`);
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
