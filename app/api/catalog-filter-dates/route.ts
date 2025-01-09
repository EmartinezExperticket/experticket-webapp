import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;

    // Default values for dates
    const today = new Date().toISOString().split('T')[0]; // ISO 8601 format yyyy-MM-dd
    const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0];

    const fromDate: string | undefined = req.nextUrl.searchParams.get('FromDate') || today;
    const toDate: string | undefined = req.nextUrl.searchParams.get('ToDate') || oneYearLater;
    const referenceDate: string | undefined =
        req.nextUrl.searchParams.get('ReferenceDate') || today;

    if (!baseUrl || !apiKey || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables' },
            { status: 500 }
        );
    }

    const apiUrl: string = `${baseUrl}/catalog?PartnerId=${encodeURIComponent(
        partnerId
    )}&FromDate=${encodeURIComponent(fromDate)}&ToDate=${encodeURIComponent(
        toDate
    )}&ReferenceDate=${encodeURIComponent(referenceDate)}`;

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
