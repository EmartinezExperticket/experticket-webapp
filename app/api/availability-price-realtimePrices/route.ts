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
        // Parse the request body
        const body = await req.json();

        // Helper function to validate ISO 8601 date format (yyyy-MM-dd)
        const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

        // Ensure required fields exist
        if (!Array.isArray(body.ProductIds) || body.ProductIds.length === 0) {
            return NextResponse.json(
                { error: 'ProductIds must be a non-empty array.' },
                { status: 400 }
            );
        }

        if (!Array.isArray(body.AccessDates) && (!body.StartDate || !body.EndDate)) {
            return NextResponse.json(
                { error: 'Either AccessDates (array) or StartDate and EndDate must be provided.' },
                { status: 400 }
            );
        }

        // Validate dates
        if (Array.isArray(body.AccessDates) && !body.AccessDates.every(isValidDate)) {
            return NextResponse.json(
                { error: 'AccessDates must be an array of dates in ISO 8601 format (yyyy-MM-dd).' },
                { status: 400 }
            );
        }

        if (body.StartDate && !isValidDate(body.StartDate)) {
            return NextResponse.json(
                { error: 'StartDate must be in ISO 8601 format (yyyy-MM-dd).' },
                { status: 400 }
            );
        }

        if (body.EndDate && !isValidDate(body.EndDate)) {
            return NextResponse.json(
                { error: 'EndDate must be in ISO 8601 format (yyyy-MM-dd).' },
                { status: 400 }
            );
        }

        // Validate CombinedProducts structure if provided
        if (body.CombinedProducts) {
            if (!Array.isArray(body.CombinedProducts)) {
                return NextResponse.json(
                    { error: 'CombinedProducts must be an array.' },
                    { status: 400 }
                );
            }
            for (const combinedProduct of body.CombinedProducts) {
                if (!combinedProduct.CombinedProductId || !Array.isArray(combinedProduct.Products)) {
                    return NextResponse.json(
                        { error: 'Each CombinedProduct must have a CombinedProductId and an array of Products.' },
                        { status: 400 }
                    );
                }
                for (const product of combinedProduct.Products) {
                    if (!product.ProductId || !product.AccessDate || !isValidDate(product.AccessDate)) {
                        return NextResponse.json(
                            { error: 'Each product inside CombinedProducts must have a valid ProductId and an AccessDate in ISO 8601 format (yyyy-MM-dd).' },
                            { status: 400 }
                        );
                    }
                }
            }
        }

        // Build the request body with PartnerId
        const requestBody = {
            ...body,
            PartnerId: partnerId,
        };

        const apiUrl = `${baseUrl}/RealTimePrices`;

        // Call the external API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        // Handle non-200 responses
        if (!response.ok) {
            const errorResponse = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch: ${response.statusText}`, details: errorResponse },
                { status: response.status }
            );
        }

        // Return API response
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
