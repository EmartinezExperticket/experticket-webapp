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

    try {
        const urlParams = req.nextUrl.searchParams;
        const saleId = urlParams.get('SaleId');
        const internalCodes = urlParams.getAll('InternalCodes'); // Allows multiple internal codes

        if (!saleId && internalCodes.length === 0) {
            return NextResponse.json(
                { error: 'At least one of SaleId or InternalCodes must be provided.' },
                { status: 400 }
            );
        }

        const queryParams = new URLSearchParams({
            ApiKey: encodeURIComponent(apiKey),
            ...(saleId && { SaleId: saleId }),
            ...(internalCodes.length > 0 && { InternalCodes: internalCodes.join(',') }),
        }).toString();

        const apiUrl = `${baseUrl}/transactionaccesscodes?${queryParams}`;

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
