import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;

    if (!baseUrl || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables' },
            { status: 500 }
        );
    }

    // Extract query parameters
    const urlParams = req.nextUrl.searchParams;
    const productBaseIds = urlParams.get('ProductBaseIds') || '';
    const productIds = urlParams.get('ProductIds') || '';
    const sessionIds = urlParams.get('SessionIds') || '';
    const dates = urlParams.get('Dates') || '';
    const fromDate = urlParams.get('FromDate') || '';
    const toDate = urlParams.get('ToDate') || '';
    const includePrices = urlParams.get('IncludePrices') || 'false';

    // Construct the API URL with dynamic query parameters
    const apiUrl = `${baseUrl}/availablecapacity?PartnerId=${encodeURIComponent(partnerId)}${
        productBaseIds ? `&ProductBaseIds=${encodeURIComponent(productBaseIds)}` : ''
    }${productIds ? `&ProductIds=${encodeURIComponent(productIds)}` : ''}${
        sessionIds ? `&SessionIds=${encodeURIComponent(sessionIds)}` : ''
    }${dates ? `&Dates=${encodeURIComponent(dates)}` : ''}${
        fromDate ? `&FromDate=${encodeURIComponent(fromDate)}` : ''
    }${toDate ? `&ToDate=${encodeURIComponent(toDate)}` : ''}${
        includePrices ? `&IncludePrices=${encodeURIComponent(includePrices)}` : ''
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
