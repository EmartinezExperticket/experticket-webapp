import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/ticket/questions/check');
    // const data = await response.json();

    return NextResponse.json({ message: 'Ticket Questions Check' });
}
