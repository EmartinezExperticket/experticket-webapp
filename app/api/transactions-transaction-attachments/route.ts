import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/transactions/get-access-codes');
    // const data = await response.json();

    return NextResponse.json({ message: 'Transaction Attachments' });
}
