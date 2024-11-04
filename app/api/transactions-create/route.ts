import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    // const body = await req.json();
    // const response = await fetchFromExternalApi('/transactions/create', { method: 'POST', body: JSON.stringify(body) });
    // const data = await response.json();

    return NextResponse.json({ message: 'Transaction Created' });
}
