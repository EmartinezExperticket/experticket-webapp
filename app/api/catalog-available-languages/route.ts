import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;
    const apiVersion: string = process.env.NEXT_PUBLIC_API_VERSION || '3.21';

    if (!baseUrl || !apiKey || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables' },
            { status: 500 }
        );
    }

    const apiUrl: string = `${baseUrl}/availablelanguages?PartnerId=${encodeURIComponent(
        partnerId
    )}&api-version=${encodeURIComponent(apiVersion)}`;

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

        const data: {
            Languages: Array<{
                Code: string;
                EnglishName: string;
                NativeName: string;
            }>;
            Success: boolean;
            TimeStamp: string;
            ErrorMessage?: string;
            ErrorCodes?: string[];
        } = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
