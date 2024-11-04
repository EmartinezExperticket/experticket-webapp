import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/last-catalog/lastUpdatedDate');
    // const data = await response.json();

    return NextResponse.json({ message: 'Last Catalog Updated Date' });
}
