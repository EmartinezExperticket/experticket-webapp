import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;

    if (!baseUrl || !apiKey || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables.' },
            { status: 500 }
        );
    }

    try {
        const url = new URL(`${baseUrl}/sessions`);

        // Add query parameters
        url.searchParams.append('PartnerId', partnerId);

        // Optional parameters from request query
        const searchParams = req.nextUrl.searchParams;
        if (searchParams.has('FromDate')) {
            url.searchParams.append('FromDate', searchParams.get('FromDate')!);
        }
        if (searchParams.has('ToDate')) {
            url.searchParams.append('ToDate', searchParams.get('ToDate')!);
        }
        if (searchParams.has('Dates')) {
            searchParams.getAll('Dates').forEach(date => {
                url.searchParams.append('Dates', date);
            });
        }
        if (searchParams.has('SessionsGroupProfileIds')) {
            searchParams.getAll('SessionsGroupProfileIds').forEach(id => {
                url.searchParams.append('SessionsGroupProfileIds', id);
            });
        }
        if (searchParams.has('SessionsGroupIds')) {
            searchParams.getAll('SessionsGroupIds').forEach(id => {
                url.searchParams.append('SessionsGroupIds', id);
            });
        }
        if (searchParams.has('SessionContentProfileIds')) {
            searchParams.getAll('SessionContentProfileIds').forEach(id => {
                url.searchParams.append('SessionContentProfileIds', id);
            });
        }

        // Default API version
        const apiVersion = searchParams.get('api-version') || '3.21';
        url.searchParams.append('api-version', apiVersion);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred.';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
