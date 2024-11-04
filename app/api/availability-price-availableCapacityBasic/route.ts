import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    // const response = await fetchFromExternalApi('/availability/price/availableCapacityBasic');
    // const data = await response.json();

    return NextResponse.json({ message: 'Availability Price Available Capacity Basic Data' });
}
