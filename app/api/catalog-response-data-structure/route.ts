import { NextRequest, NextResponse } from 'next/server';

interface CancellationPolicy {
    IsRefundable: boolean;
    Rules: string;
    HoursInAdvanceOfAccess: number;
    Percentage: number;
}

interface PromotionalImage {
    IsMainImage: boolean;
    Url: string;
}

interface Provider {
    ProviderId: string;
    ProviderName: string;
    ProviderDescription: string;
    ProviderCommercialConditions?: string;
    ProviderAccessConditions?: string;
    AdvancedDateSelectorMethodName?: string;
    CancellationPolicy?: CancellationPolicy;
    Type: 0 | 1 | 2; // 0: Activity, 1: Accommodation, 2: Transport
    Logo?: string;
    PromotionalImages: PromotionalImage[];
    Tags: string[];
    Location?: {
        CountryCode: string;
        City: string;
        Address?: string;
        ZipCode?: string;
        Lat?: number;
        Lng?: number;
        Region?: string;
    };
}

interface ProductBase {
    ProductBaseId: string;
    ProductBaseName: string;
    ProductBaseDescription?: string;
    DaysWithLimitedCapacity?: string[];
    Products: Product[];
}

interface Product {
    ProductId: string;
    ProductName: string;
    SuggestedSalesProductName?: string;
    ProductDescription?: string;
    ProductInternalConsiderations?: string;
    ProductCancellationConditions?: string;
    CancellationPolicy?: CancellationPolicy;
    RequiresRealTimePrice: boolean;
}

interface CatalogResponse {
    LastUpdatedDateTime: string;
    Providers: Provider[];
    ProductBases: ProductBase[];
    Success: boolean;
    TimeStamp: string;
    ErrorMessage?: string;
    ErrorCodes?: string[];
}


export async function GET(req: NextRequest): Promise<NextResponse> {

    const catalogFieldMetadata = {
        LastUpdatedDateTime: {
            type: 'string',
            format: 'ISO 8601 date-time',
            description: 'Last catalog modification date.',
        },
        Providers: {
            type: 'array',
            description: 'Array of providers.',
            items: {
                ProviderId: {
                    type: 'string',
                    description: 'The provider’s identifier code. Thirteen alphanumeric characters.',
                },
                ProviderName: {
                    type: 'string',
                    description: 'The provider’s name.',
                },
                ProviderDescription: {
                    type: 'string',
                    description: 'Provider description.',
                },
                ProviderCommercialConditions: {
                    type: 'string',
                    description: 'Service provider’s commercial terms. Optional.',
                },
                ProviderAccessConditions: {
                    type: 'string',
                    description: 'Service provider’s access terms. Optional.',
                },
            },
        },
        Success: {
            type: 'boolean',
            description: 'Indicates if the catalog fetch was successful.',
        },
        TimeStamp: {
            type: 'string',
            format: 'ISO 8601 date-time',
            description: 'Time of the catalog fetch.',
        },
        ErrorMessage: {
            type: 'string',
            description: 'Error message explaining why the catalog fetch was unsuccessful. Optional.',
        },
        ErrorCodes: {
            type: 'array',
            description: 'Array of error codes identifying the issue. Optional.',
        },
    };
    
    return NextResponse.json({
        description: 'Metadata for the catalog API response fields.',
        fields: catalogFieldMetadata,
    });
}
