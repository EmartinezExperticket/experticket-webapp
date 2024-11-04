import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/catalog/multilanguage');
    // const data = await response.json();

    return NextResponse.json({ message: 'Catalog Multilanguage Data' });
}
