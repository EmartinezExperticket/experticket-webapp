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
        const languageCode = urlParams.get('LanguageCode') || 'en';
        const saleId = urlParams.get('SaleId');
        const reservationId = urlParams.get('ReservationId');
        const partnerSaleId = urlParams.get('PartnerSaleId');
        const pointOfSaleId = urlParams.get('PointOfSaleId');
        const pointOfSaleCustomCode = urlParams.get('PointOfSaleCustomCode');
        const fromTransactionDateTime = urlParams.get('FromTransactionDateTime');
        const toTransactionDateTime = urlParams.get('ToTransactionDateTime');
        const fromAccessDateTime = urlParams.get('FromAccessDateTime');
        const toAccessDateTime = urlParams.get('ToAccessDateTime');
        const fromCancelledDateTime = urlParams.get('FromCancelledDateTime');
        const toCancelledDateTime = urlParams.get('ToCancelledDateTime');
        const pageSize = urlParams.get('PageSize') || '20';
        const page = urlParams.get('Page') || '1';
        const apiVersion = urlParams.get('api-version') || '3.21';

        const queryParams = new URLSearchParams({
            ApiKey: encodeURIComponent(apiKey),
            LanguageCode: languageCode,
            PageSize: pageSize,
            Page: page,
            ...(saleId && { SaleId: saleId }),
            ...(reservationId && { ReservationId: reservationId }),
            ...(partnerSaleId && { PartnerSaleId: partnerSaleId }),
            ...(pointOfSaleId && { PointOfSaleId: pointOfSaleId }),
            ...(pointOfSaleCustomCode && { PointOfSaleCustomCode: pointOfSaleCustomCode }),
            ...(fromTransactionDateTime && { FromTransactionDateTime: fromTransactionDateTime }),
            ...(toTransactionDateTime && { ToTransactionDateTime: toTransactionDateTime }),
            ...(fromAccessDateTime && { FromAccessDateTime: fromAccessDateTime }),
            ...(toAccessDateTime && { ToAccessDateTime: toAccessDateTime }),
            ...(fromCancelledDateTime && { FromCancelledDateTime: fromCancelledDateTime }),
            ...(toCancelledDateTime && { ToCancelledDateTime: toCancelledDateTime }),
            'api-version': apiVersion,
        }).toString();

        const apiUrl = `${baseUrl}/transaction?${queryParams}`;

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
