import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest): Promise<NextResponse> {
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
        return NextResponse.json(
            { error: 'Missing required environment variables.' },
            { status: 500 }
        );
    }

    try {
        const formData = await req.formData();

        const saleId = formData.get('SaleId');
        const attachments = formData.getAll('Attachments'); // Handles multiple file uploads

        if (!saleId || attachments.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: SaleId or Attachments.' },
                { status: 400 }
            );
        }

        const externalFormData = new FormData();
        externalFormData.append('ApiKey', apiKey);
        externalFormData.append('SaleId', saleId as string);

        attachments.forEach((file) => {
            if (file instanceof Blob) {
                externalFormData.append('Attachments', file);
            }
        });

        const apiUrl = `${baseUrl}/transaction`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            body: externalFormData,
        });

        if (!response.ok) {
            throw new Error(`Failed to attach documents: ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
