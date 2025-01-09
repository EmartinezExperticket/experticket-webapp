import { NextRequest, NextResponse } from 'next/server';

interface Provider {
    ProviderId: string;
}

interface CatalogData {
    Providers: Provider[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    
    const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;
    const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;
    const providerId: string | undefined = process.env.NEXT_PUBLIC_PROVIDER_ID;


    if (!baseUrl || !apiKey || !partnerId) {
        return NextResponse.json(
            { error: 'Missing required environment variables' },
            { status: 500 }
        );
    }

/*     const mockProviderId: string = 'mock-provider-id';
    const finalProviderId: string = providerId || mockProviderId; */

    const catalogUrl: string = `${baseUrl}/catalog?ApiKey=${encodeURIComponent(apiKey || '')}&PartnerId=${encodeURIComponent(partnerId || '')}`;

    const catalogResponse: Response = await fetch(catalogUrl, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!catalogResponse.ok) {

        throw new Error(`Failed to fetch Catalog: ${catalogResponse.statusText}`);
    }

    const catalogData: Record<string, any> = await catalogResponse.json();

    console.log('Catalog Data:', catalogData);

    const providerIds: string[] = (catalogData as CatalogData).Providers.map((provider: Provider) => provider.ProviderId);

    console.log('Provider IDs:', providerIds);

    const apiUrl: string = `${baseUrl}/catalog?PartnerId=${encodeURIComponent(partnerId)}&providerIds=${encodeURIComponent(providerIds.join(','))}`;

    console.log('API URL:', apiUrl);

    try {
        const response: Response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: Record<string, any> = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
