import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/catalog/basic');
    // const data = await response.json();

    return NextResponse.json({ message: 'Catalog Basic Data' });
}
