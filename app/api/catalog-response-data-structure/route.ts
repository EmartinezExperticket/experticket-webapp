import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/catalog/response-data-structure');
    // const data = await response.json();

    return NextResponse.json({ message: 'Catalog Response Data Structure' });
}
