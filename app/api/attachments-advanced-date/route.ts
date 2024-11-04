import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/attachments/advanced-date');
    // const data = await response.json();

    return NextResponse.json({ message: 'Attachments Advanced Date Data' });
}
