import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const explanation = {
        AdvancedDateSelector: {
            concept:
                "Defines whether tickets in a transaction can have an access date that differs from the transaction's primary AccessDateTime.",
            methods: [
                {
                    name: "None",
                    description:
                        "Tickets cannot have access dates that differ from the transaction's AccessDateTime. All tickets inherit the transaction's AccessDateTime.",
                    rules: [
                        "AccessDateTime must always be provided at the transaction level.",
                        "No individual AccessDateTime is allowed for tickets."
                    ],
                    example: {
                        AccessDateTime: "2024-12-05",
                        Products: [
                            {
                                ProductId: "productId1",
                            },
                        ],
                    },
                },
                {
                    name: "DatePerTicketEnclosure",
                    description:
                        "Tickets can have distinct access dates based on their enclosures (TicketEnclosureId). All ticket dates must belong to the same 'PricesAndDates' set from the product catalog.",
                    rules: [
                        "AccessDateTime must always be provided at the transaction level and should be the earliest access date among all tickets.",
                        "Each ticket can have its own AccessDateTime, provided it aligns with the 'PricesAndDates' of the product catalog."
                    ],
                    example: {
                        AccessDateTime: "2024-12-05",
                        Products: [
                            {
                                ProductId: "productId1",
                                Tickets: [
                                    {
                                        TicketId: "ticket1",
                                        AccessDateTime: "2024-12-05",
                                    },
                                    {
                                        TicketId: "ticket2",
                                        AccessDateTime: "2024-12-10",
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    };

    return NextResponse.json(explanation);
}
