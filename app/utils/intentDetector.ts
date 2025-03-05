type Action = {
    endpoint: string;
    method: "GET" | "POST";
    headers?: Record<string, string>;
    responseFormat?: "json" | "xml";
    params: Record<string, string>;
};

// Definimos patrones de intención (puedes ampliar con más idiomas)
const INTENT_PATTERNS = [
    {
        intent: "consultar_catalogo",
        patterns: [
            // Español
            /\bver.*cat[aá]logo\b/i,
            /\bconsultar.*cat[aá]logo\b/i,
            /\bobtener.*cat[aá]logo\b/i,
            /\bdescargar.*cat[aá]logo\b/i,
            /\bquiero.*cat[aá]logo\b/i,
            /\bdame.*cat[aá]logo\b/i,
            /\bmu[eé]strame.*cat[aá]logo\b/i,
            /\bnecesito.*cat[aá]logo\b/i,     
            // Inglés
            /\bget.*catalog\b/i,
            /\bshow.*catalog\b/i,
            /\bsee.*catalog\b/i,
            /\bdownload.*catalog\b/i,
            /\bneed.*catalog\b/i,
            /\bwant.*catalog\b/i,
            /\bcan.*i.*see.*catalog\b/i,
            /\bprovide.*catalog\b/i,
            /\bgive.*me.*catalog\b/i,

        ]
    },
    {
        intent: "consultar_etiquetas",
        patterns: [
            // Español
            /\bver.*etiquetas\b/i,
            /\bconsultar.*etiquetas\b/i,
            /\bdescargar.*etiquetas\b/i,
            /\bquiero.*etiquetas\b/i,
            /\bdame.*etiquetas\b/i,
    
            // Inglés
            /\bsee.*tags\b/i,
            /\bget.*tags\b/i,
            /\bobtain.*tags\b/i,
            /\bdownload.*tags\b/i,
            /\bi want.*tags\b/i,
            /\bgive me.*tags\b/i,
        ]
    },
    {
        intent: "consultar_precios_tiempo_real",
        patterns: [
            /consultar.*precios.*tiempo.*real/i,
            /ver.*precios.*tiempo.*real/i,
            /obtener.*precios.*actualizados/i,
            /real-time.*prices/i,
            /fetch.*live.*prices/i,
            /get.*live.*prices/i,
            /ver.*tarifas.*hoy/i,
        ]
    },
    {
        intent: "consultar_ultima_actualizacion_catalogo",
        patterns: [
            /ver.*[uú]ltima.*actualizaci[oó]n.*cat[aá]logo/i,
            /cu[aá]ndo.*se.*actualiz[oó].*cat[aá]logo/i,
            /consultar.*actualizaci[oó]n.*cat[aá]logo/i,
            /get.*catalog.*last.*update/i,
            /check.*last.*catalog.*update/i,
            /when.*was.*catalog.*updated/i
        ]
    },
    {
        intent: "consultar_aforo_disponible",
        patterns: [
            /consultar.*aforo/i,
            /ver.*disponibilidad.*boletos/i,
            /hay.*boletos.*disponibles/i,
            /disponibilidad.*product[ios]/i,
            /get.*available.*capacity/i,
            /check.*ticket.*availability/i,
            /how many tickets are available/i
        ]
    },
    {
        intent: "consultar_sesiones",
        patterns: [
            /ver.*sesiones/i,
            /consultar.*sesiones/i,
            /get.*sessions/i,
            /listar.*sesiones/i,
            /what.*are.*the.*next.*sessions/i,
            /check.*available.*sessions/i,
        ]
    },
    {
        intent: "autoasignar_sesiones",
        patterns: [
            /autoasignar.*sesiones/i,
            /ver.*autoasignadas.*sesiones/i,
            /consultar.*sesiones.*autoasignadas/i,
            /get.*autoassigned.*sessions/i,
            /check.*autoassigned.*sessions/i,
            /sessions.*autoassign/i,
        ]
    },
    {
        intent: "checkticketsquestions",
        patterns: [
            /consultar.*preguntas.*tickets/i,
            /ver.*preguntas.*de.*boletos/i,
            /check.*ticket.*questions/i,
            /obtener.*preguntas.*de.*productos/i,
            /revisar.*preguntas.*asociadas.*a.*tickets/i,
            /ticket.*questions.*lookup/i,
        ]
    },
    {
        intent: "saleflowrules",
        patterns: [
            /consultar.*reglas.*venta/i,
            /ver.*flujo.*venta/i,
            /check.*sale.*flow.*rules/i,
            /obtener.*reglas.*descuentos/i,
            /rules.*for.*automatic.*discounts/i,
            /automatic.*sale.*rules/i
        ]
    },
    {
        intent: "saleflowrulesPreview",
        patterns: [
            /previsualizar.*flujo.*venta/i,
            /preview.*sale.*flow.*rules/i,
            /ver.*qué.*reglas.*se.*aplicar[ií]an/i,
            /simular.*descuentos.*autom[aá]ticos/i,
            /test.*automatic.*sale.*rules/i
        ]
    },
    {
        intent: "createReservation",
        patterns: [
            /crear.*reservaci[oó]n/i,
            /generar.*reservaci[oó]n/i,
            /create.*reservation/i,
            /make.*a.*reservation/i,
            /new.*booking/i,
            /iniciar.*reserva/i,
            /reserva.*productos/i,
            /confirmar.*disponibilidad.*productos/i
        ]
    },
    {
        intent: "cancelReservation",
        patterns: [
            /cancelar.*reservaci[oó]n/i,
            /anular.*reservaci[oó]n/i,
            /eliminar.*reserva/i,
            /cancel.*reservation/i,
            /delete.*booking/i,
            /remove.*reservation/i,
            /void.*reservation/i
        ]
    },
    {
        intent: "getPaymentMethods",
        patterns: [
            /ver.*m[eé]todos.*pago/i,
            /consultar.*m[eé]todos.*pago/i,
            /obtener.*m[eé]todos.*pago/i,
            /listar.*formas.*pago/i,
            /payment.*methods/i,
            /get.*payment.*options/i,
            /available.*payments/i
        ]
    },
    {
        intent: "getSimplifiedInvoices",
        patterns: [
            /consultar.*facturas.*simplificadas/i,
            /ver.*facturas.*taquilla/i,
            /obtener.*facturas.*simplificadas/i,
            /simplified.*invoices/i,
            /get.*simplified.*invoices/i,
            /download.*invoices/i
        ]
    },
    {
        intent: "getDeliveryMethods",
        patterns: [
            /consultar.*m[eé]todos.*entrega/i,
            /ver.*opciones.*entrega/i,
            /delivery.*methods/i,
            /available.*delivery.*options/i,
            /obtener.*m[eé]todos.*env[ií]o/i,
            /get.*delivery.*methods/i
        ]
    },
    {
        intent: "deliveryMethodCheck",
        patterns: [
            /verificar.*m[eé]todo.*entrega/i,
            /comprobar.*env[ií]o/i,
            /delivery.*method.*check/i,
            /check.*delivery.*method/i,
            /validar.*opci[oó]n.*entrega/i,
            /can.*ship.*to/i
        ]
    },
    {
        intent: "ticketExchange",
        patterns: [
            /canjear.*boleto/i,
            /intercambiar.*ticket/i,
            /hacer.*canje.*entrada/i,
            /redeem.*ticket/i,
            /exchange.*ticket/i,
            /ticket.*exchange/i
        ]
    },
    {
        intent: "createTransaction",
        patterns: [
            /crear.*transacci[oó]n/i,
            /create.*transaction/i,
        ]
    },
    {
        intent: "createSimplifiedTransaction",
        patterns: [
            /crear.*transacci[oó]n.*simplificada/i,
            /create.*simplified.*transaction/i,
        ]
    },
    {
        intent: "getTransactionDocuments",
        patterns: [
            /obtener.*documentos.*transacci[oó]n/i,
            /consultar.*comprobante.*venta/i,
            /ver.*documentos.*compra/i,
            /get.*transaction.*documents/i,
            /retrieve.*sale.*documents/i,
            /download.*invoice.*transaction/i
        ]
    },
    {
        intent: "getTransactionAccessCodes",
        patterns: [
            /obtener.*c[oó]digos.*acceso.*transacci[oó]n/i,
            /consultar.*c[oó]digos.*acceso.*compra/i,
            /ver.*access.*codes.*transaction/i,
            /retrieve.*transaction.*access.*codes/i,
            /get.*access.*codes.*sale/i,
            /consultar.*access.*codes/i
        ]
    },
    {
        intent: "getSimplifiedInvoice",
        patterns: [
            /obtener.*factura.*simplificada/i,
            /consultar.*facturas.*simplificadas/i,
            /get.*simplified.*invoice/i,
            /ver.*documento.*fiscal.*venta/i,
            /consultar.*comprobante.*venta/i,
            /get.*invoice.*sale/i
        ],
        
    },
    {
        intent: "attachDocumentsToTransaction",
        patterns: [
            /adjuntar.*documentos.*venta/i,
            /subir.*archivos.*venta/i,
            /attach.*files.*transaction/i,
            /enviar.*documentos.*venta/i,
            /upload.*documents.*sale/i
        ]
    },
    {
        intent: "getSalePayments",
        patterns: [
            /obtener.*pagos.*transacci[oó]n/i,
            /consultar.*pagos.*venta/i,
            /ver.*pagos.*venta/i,
            /get.*sale.*payments/i,
            /check.*payments.*transaction/i,
            /recuperar.*pagos.*venta/i
        ]
    },
    {
        intent: "getTransactions",
        patterns: [
            /obtener.*transacciones.*taquilla/i,
            /consultar.*transacciones.*colaborador/i,
            /ver.*transacciones.*punto.*venta/i,
            /get.*transactions.*partner/i,
            /get.*taquilla.*transactions/i,
            /consultar.*ventas.*colaborador/i
        ]
    },
    {
        intent: "cancellationRequest",
        patterns: [
            /solicitar.*cancelaci[oó]n.*transacci[oó]n/i,
            /enviar.*petici[oó]n.*cancelar.*venta/i,
            /request.*transaction.*cancellation/i,
            /cancel.*sale.*request/i,
            /mandar.*cancelaci[oó]n.*colaborador/i
        ]
    },
    {
        intent: "attachDocumentsToCancellation",
        patterns: [
            /adjuntar.*documentos.*cancelaci[oó]n/i,
            /enviar.*archivos.*solicitud.*cancelaci[oó]n/i,
            /upload.*documents.*cancellation.*request/i,
            /add.*attachments.*cancellation.*request/i
        ]
    },
    {
        intent: "getCancellationRequests",
        patterns: [
            /obtener.*solicitudes.*cancelaci[oó]n/i,
            /consultar.*historial.*cancelaci[oó]n/i,
            /ver.*requests.*cancellation/i,
            /list.*cancellation.*requests/i,
            /get.*cancellation.*requests/i
        ]
    },
    {
        intent: "sendSaleDocumentationToClient",
        patterns: [
            /enviar.*documentaci[oó]n.*cliente/i,
            /mandar.*comprobante.*venta.*cliente/i,
            /send.*sale.*documentation.*client/i,
            /email.*sale.*document.*client/i,
            /enviar.*factura.*cliente/i
        ]
    },
    {
        intent: "checkDiscountCoupons",
        patterns: [
            /verificar.*cupo(n|nes).*descuento/i,
            /comprobar.*cupo(n|nes)/i,
            /validar.*cupo(n|nes)/i,
            /check.*discount.*coupons/i,
            /validate.*discount.*code/i,
            /verify.*coupon/i
        ]
    }             
];


// Mapa que convierte intenciones en acciones (la verdad sobre Experticket)
const INTENT_TO_ACTION: Record<string, any> = {
    consultar_catalogo: {
        endpoint: "/api/catalog",
        method: "GET",
        headers: {
            "Accept": "application/json" // Opción por defecto, puedes extender a "application/xml"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",         // Obligatorio
            "ProviderIds[]": "string",   // Opcional, múltiple
            "ProductBaseIds[]": "string",// Opcional, múltiple
            "ProductIds[]": "string",    // Opcional, múltiple
            FromDate: "string",          // Opcional, formato YYYY-MM-DD
            ToDate: "string",            // Opcional, formato YYYY-MM-DD
            ReferenceDate: "string",     // Opcional, formato YYYY-MM-DD
            LanguageCode: "string",      // Opcional: es, en, fr, pt, ca-ES, it, zh-CN
            "api-version": "string"      // Por defecto: 3.21, pero el cliente puede pedir 3.60
        }
    },
    consultar_etiquetas: {
        endpoint: "/api/tags",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",    // Obligatorio
            LanguageCode: "string", // Opcional: es, en, fr, pt, ca-ES, it, zh-CN
            "api-version": "string" // Opcional, por defecto 3.21
        }
    },
    consultar_precios_tiempo_real: {
        endpoint: "/api/RealTimePrices",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",               // Obligatorio
            ProductIds: ["string"],            // Lista de productos a consultar (array)
            AccessDates: ["string"],           // Fechas en formato YYYY-MM-DD (array)
            StartDate: "string",                // Opcional - Fecha inicio de rango (YYYY-MM-DD)
            EndDate: "string",                  // Opcional - Fecha fin de rango (YYYY-MM-DD)
            CombinedProducts: [                 // Opcional - Lista de productos combinados
                {
                    CombinedProductId: "string", // ID del producto combinado
                    Products: [
                        {
                            ProductId: "string", // Producto dentro del combinado
                            AccessDate: "string" // Fecha de acceso (YYYY-MM-DD)
                        }
                    ]
                }
            ]
        }
    },
    consultar_ultima_actualizacion_catalogo: {
        endpoint: "/api/cataloglastupdateddatetime",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",
            "api-version": "string"  // Opcional
        }
    },
    consultar_aforo_disponible: {
        endpoint: "/api/availablecapacity",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",         // Obligatorio
            "ProductBaseIds[]": "string",// Opcional, múltiple (obsoleto en 3.47)
            "ProductIds[]": "string",    // Opcional, múltiple
            "SessionIds[]": "string",    // Opcional, múltiple
            "Dates[]": "string",         // Opcional, múltiple, formato YYYY-MM-DD
            FromDate: "string",          // Opcional, formato YYYY-MM-DD
            ToDate: "string",            // Opcional, formato YYYY-MM-DD
            IncludePrices: "boolean",    // Opcional, true o false
            "api-version": "string"      // Opcional, por defecto 3.21
        }
    },
    consultar_sesiones: {
        endpoint: "/api/sessions",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",                  // Obligatorio
            SessionsGroupProfileIds: "string",    // Opcional
            SessionsGroupIds: "string",           // Opcional
            SessionContentProfileIds: "string",   // Opcional
            FromDate: "string",                    // Opcional, formato YYYY-MM-DD
            ToDate: "string",                      // Opcional, formato YYYY-MM-DD
            "Dates[]": "string",                   // Opcional, múltiple, formato YYYY-MM-DD
            LanguageCode: "string",                // Opcional, idioma (es, en, fr, etc.)
            "api-version": "string"                // Opcional, por defecto 3.21
        }
    },
    autoasignar_sesiones: {
        endpoint: "/api/autoassignsessions",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",            // Obligatorio
            LanguageCode: "string",         // Opcional (es, en, fr, pt, ca-ES, it, zh-CN)
            "Products": [
                {
                    ProductId: "string",    // Obligatorio
                    Quantity: "number",     // Obligatorio
                    AccessDate: "string",   // Obligatorio (YYYY-MM-DD)
                    "Tickets": [
                        {
                            TicketId: "string",    // Obligatorio
                            AccessDate: "string"   // Opcional (YYYY-MM-DD)
                        }
                    ]
                }
            ],
            "api-version": "string"         // Opcional, por defecto 3.21
        }
    },
    checkticketsquestions: {
        endpoint: "/api/checkticketsquestions",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",              // Obligatorio
            ProductIds: ["string"],            // Obligatorio (array de strings)
            TicketsQuestionsProfileIds: ["string"], // Opcional (array de strings)
            LanguageCode: "string",            // Opcional
            "api-version": "string"            // Opcional, por defecto 3.21
        }
    },
    saleflowrules: {
        endpoint: "/api/saleflowrules",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",      // Obligatorio
            "api-version": "string"   // Opcional, por defecto 3.21
        }
    },
    saleflowrulesPreview: {
        endpoint: "/api/saleflowrules",
        method: "POST",
        params: {
            ApiKey: "string",          // Obligatorio
            IsTest: "boolean",         // Obligatorio
            AccessDateTime: "string",  // Obligatorio (Formato ISO 8601 yyyy-MM-dd)
            Products: [
                {
                    ProductId: "string",    // Obligatorio
                    Quantity: "number",     // Opcional
                    AccessDateTime: "string"// Opcional (Formato ISO 8601 yyyy-MM-dd)
                }
            ],
            DynamicProviders: [         // Opcional
                {
                    ProviderId: "string",
                    Quantity: "number"
                }
            ],
            "api-version": "string"     // Opcional (por defecto 3.21)
        }
    },
    createReservation: {
        endpoint: "/api/reservation",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",          // Obligatorio
            IsTest: "boolean",         // Obligatorio
            AccessDateTime: "string",  // Obligatorio (Formato ISO 8601 yyyy-MM-dd)
            AccessEndDateTime: "string", // Opcional (Formato ISO 8601 yyyy-MM-dd)
            LanguageCode: "string",    // Opcional (es, en, fr, it)
            Products: [
                {
                    ProductId: "string",            // Obligatorio
                    CombinedProductId: "string",    // Opcional
                    Quantity: "number",             // Obligatorio
                    Tickets: [                      // Opcional
                        {
                            TicketId: "string",           // Obligatorio
                            SessionId: "string",          // Opcional
                            SessionContentName: "string", // Opcional
                            SessionTime: "string",        // Opcional (HH:mm)
                            AccessDateTime: "string",     // Obligatorio (Formato ISO 8601 yyyy-MM-dd)
                            Questions: [                  // Opcional
                                {
                                    TicketQuestionId: "string", // Obligatorio
                                    StringValue: "string"       // Obligatorio
                                }
                            ]
                        }
                    ]
                }
            ],
            ReturnPaymentMethods: "boolean", // Opcional
            "api-version": "string"          // Opcional (por defecto 3.21)
        }
    },
    cancelReservation: {
        endpoint: "/api/reservation",
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",          // Obligatorio
            IsTest: "boolean",         // Obligatorio
            ReservationId: "string",   // Obligatorio
            "api-version": "string"    // Opcional (por defecto 3.21)
        }
    },
    getPaymentMethods: {
        endpoint: "/api/paymentmethods",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",      // Obligatorio
            ReservationId: "string",  // Obligatorio
            IsTest: "boolean",        // Opcional
            "api-version": "string"   // Opcional (por defecto 3.21)
        }
    },
    getSimplifiedInvoices: {
        endpoint: "/api/simplifiedinvoice",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {    // <- Esto es para detectar qué necesita
            SaleId: "string",         // Obligatorio
            PartnerSaleId: "string",  // Obligatorio
            FromDate: "string",       // Obligatorio (Formato ISO 8601 yyyy-MM-dd, no menor al día actual)
            ToDate: "string",         // Opcional (por defecto un año desde hoy)
            "api-version": "string"   // Opcional (por defecto 3.21 o 3.60 según config)
        }
    },
    getDeliveryMethods: {
        endpoint: "/api/deliverymethods",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",        // Obligatorio
            ReservationId: "string",    // Obligatorio
            "api-version": "string"     // Opcional (por defecto 3.21 o 3.60 según configuración)
        }
    },
    deliveryMethodCheck: {
        endpoint: "/api/deliverymethodcheck",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            PartnerId: "string",        // Obligatorio
            ReservationId: "string",    // Obligatorio
            DeliveryMethodId: "string", // Obligatorio
            CountryCode: "string",      // Obligatorio (Formato Alpha-2)
            ZipCode: "string",          // Obligatorio
            "api-version": "string"     // Opcional (por defecto 3.21 o 3.60 según configuración)
        }
    },
    ticketExchange: {
        endpoint: "/api/ticketexchange",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",              // Obligatorio
            Exchanges: [                    // Obligatorio
                {
                    TicketAccessCode: "string",  // Obligatorio
                    InternalCode: "string"       // Opcional
                }
            ],
            "api-version": "string"         // Opcional (por defecto 3.21)
        }
    },
    createTransaction: {
        description: "Endpoint para crear una transacción utilizando una reserva previa y un método de pago seleccionado.",
        endpoint: "/api/transaction",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",               // Obligatorio - Clave única del colaborador
            ReservationId: "string",         // Obligatorio - ID de la reserva previa
            IsTest: "boolean",                // Obligatorio - Indica si es una transacción real o prueba
            AccessDateTime: "string",        // Obligatorio - Fecha de acceso (yyyy-MM-dd)
            PartnerSaleId: "string",         // Opcional - ID interno de la venta
            PaymentMethod: {                  // Obligatorio - Método de pago seleccionado
                PaymentMethodType: "number",  // Tipo de pago obtenido previamente
                ReturnUrlOk: "string",        // URL a la que redirige al pagar con éxito
                ReturnUrlKo: "string"         // URL a la que redirige si falla el pago
            },
            Client: {                         // Opcional - Datos del cliente
                FullName: "string",
                Surname: "string",
                Email: "string"
            },
            PointOfSale: {                    // Opcional - Información de la tienda física
                CustomCode: "string",
                Name: "string",
                Description: "string"
            },
            Products: [                       // Obligatorio - Productos y tickets incluidos
                {
                    ProductId: "string",
                    Tickets: [
                        {
                            TicketId: "string"
                        }
                    ]
                }
            ],
            DeliveryMethod: {                  // Opcional - Método de entrega si aplica
                DeliveryMethodId: "string",
                DeliveryPointId: "string"     // Opcional si es recogida
            },
            DiscountCouponCodes: [             // Opcional - Cupones aplicados
                "string"
            ],
            "api-version": "string"            // Opcional - Versión de la API (por defecto 3.21)
        }
    },
    createSimplifiedTransaction: {
        description: "Endpoint para crear una transacción simplificada (sin tickets ni sesiones específicas).",
        endpoint: "/api/transaction",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",            // Obligatorio - Clave única del colaborador
            ReservationId: "string",      // Obligatorio - ID de la reserva previa
            IsTest: "boolean",            // Obligatorio - Indica si es una transacción real o prueba
            AccessDateTime: "string",     // Obligatorio - Fecha de acceso (yyyy-MM-dd)
            Products: [                    // Obligatorio - Lista de productos
                {
                    ProductId: "string"    // Obligatorio
                }
            ],
            "api-version": "string"       // Opcional - Versión de la API (por defecto 3.21)
        }
    },
    getTransactionDocuments: {
        description: "Endpoint para obtener los documentos asociados a una transacción específica.",
        endpoint: "/api/transactiondocuments",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",   // Obligatorio - Clave privada única del colaborador.
            id: "string",       // Obligatorio - Identificador de la transacción (SaleId).
            "api-version": "string" // Opcional - Versión de la API (por defecto 3.21).
        }
    },
    getTransactionAccessCodes: {
        description: "Endpoint para obtener los códigos de acceso de una transacción específica.",
        endpoint: "/api/transactionaccesscodes",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",       // Obligatorio - Clave privada única del colaborador.
            SaleId: "string",       // Opcional - Identificador de la venta.
            TransactionId: "string", // Opcional - Identificador de la transacción (obsoleto).
            "InternalCodes[0]": "string", // Opcional - Primer código interno asignado a un ticket.
            "api-version": "string" // Opcional - Versión de la API (por defecto 3.21).
        }
    },
    simplifiedInvoice: {
        endpoint: "/api/simplifiedinvoice",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            SaleId: "string",          // Opcional (identificador de la venta)
            PartnerSaleId: "string",   // Opcional (identificador interno asignado por el colaborador)
            FromDate: "string",        // Obligatorio (ISO 8601 yyyy-MM-dd)
            ToDate: "string",          // Obligatorio (ISO 8601 yyyy-MM-dd)
            "api-version": "string"    // Opcional (por defecto 3.21 o 3.60 según aplique)
        }
    },
    attachDocumentsToTransaction: {
        endpoint: "/api/transaction",
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-Type": "multipart/form-data"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",        // Obligatorio
            SaleId: "string",        // Obligatorio
            Attachments: "file[]",   // Obligatorio - Array de archivos (formato multipart/form-data)
            "api-version": "string"  // Opcional (por defecto 3.21)
        }
    },
    getSalePayments: {
        endpoint: "/api/salepayments",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",        // Obligatorio
            SaleId: "string",        // Opcional (recomendado si se tiene)
            PartnerSaleId: "string", // Opcional (solo si no se envía SaleId)
            "api-version": "string"  // Opcional (por defecto 3.21)
        }
    },
    getTransactions: {
        endpoint: "/api/transaction",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",                     // Obligatorio
            LanguageCode: "string",                // Opcional (es, en, fr, it, etc.)
            SaleId: "string",                      // Opcional
            ReservationId: "string",               // Opcional
            PartnerSaleId: "string",               // Opcional
            PointOfSaleId: "string",                // Opcional
            PointOfSaleCustomCode: "string",        // Opcional
            FromTransactionDateTime: "string",      // Opcional (Formato ISO 8601)
            ToTransactionDateTime: "string",        // Opcional (Formato ISO 8601)
            FromAccessDateTime: "string",           // Opcional (Formato ISO 8601)
            ToAccessDateTime: "string",             // Opcional (Formato ISO 8601)
            ClientEmail: "string",                   // Opcional
            ClientName: "string",                    // Opcional
            ClientPhone: "string",                   // Opcional
            ClientDocumentIdentifier: "string",      // Opcional
            FromCancelledDateTime: "string",         // Opcional (Formato ISO 8601)
            ToCancelledDateTime: "string",           // Opcional (Formato ISO 8601)
            PageSize: "number",                       // Opcional (Máximo 200)
            Page: "number",                           // Opcional (Por defecto 1)
            "api-version": "string"                   // Opcional (Por defecto 3.21)
        }
    },
    cancellationRequest: {
        endpoint: "/api/cancellationrequest",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",          // Obligatorio
            IsTest: "boolean",         // Obligatorio
            SaleId: "string",          // Obligatorio
            Reason: "number",          // Obligatorio (ver lista de razones)
            ReasonComments: "string",  // Opcional
            "api-version": "string"    // Opcional (por defecto 3.47)
        }
    },
    attachDocumentsToCancellation: {
        endpoint: "/api/cancellationrequest",
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-Type": "multipart/form-data"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",                // Obligatorio
            CancellationRequestId: "string", // Obligatorio
            SaleId: "string",                 // Obligatorio
            "api-version": "string"           // Opcional (por defecto 3.47)
            // Attachments se envía directamente como parte de multipart/form-data, no dentro de params.
        }
    },
    getCancellationRequests: {
        endpoint: "/api/cancellationrequest",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",                    // Obligatorio
            TransactionId: "string",              // Obsoleto
            SaleId: "string",                      // Opcional
            FromCreatedDateTime: "string",        // Opcional (ISO 8601)
            ToCreatedDateTime: "string",          // Opcional (ISO 8601)
            FromUpdatedDateTime: "string",        // Opcional (ISO 8601)
            ToUpdatedDateTime: "string",          // Opcional (ISO 8601)
            Status: "number",                     // Opcional (1 = En proceso, 2 = Aceptada, 3 = Rechazada, 4 = Fallida)
            PageSize: "number",                    // Opcional (máx. 200)
            Page: "number",                        // Opcional (por defecto 1)
            "api-version": "string"                // Opcional (por defecto 3.47)
        }
    },
    sendSaleDocumentationToClient: {
        endpoint: "/api/sendsaledocumentationtoclient",
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",    // Obligatorio
            SaleId: "string",    // Obligatorio
            Email: "string"      // Obligatorio
        }
    },
    checkDiscountCoupons: {
        endpoint: "/api/checkticketsquestions",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseFormat: "json",
        params: {
            ApiKey: "string",  // Obligatorio
            DiscountCouponCodes: ["string"],  // Obligatorio (array de strings)
            Sale: {
                Products: [
                    {
                        Id: "string",         // Obligatorio
                        ProductId: "string",  // Obligatorio
                        Price: "number",      // Obligatorio
                        AccessDate: "string"  // Opcional (Formato ISO 8601)
                    }
                ]
            }
        }
    }      
};


// Detecta intención en base al mensaje del usuario
export function detectIntent(message: string): string | null {
    const lowerMessage = message.toLowerCase();

    for (const { intent, patterns } of INTENT_PATTERNS) {
        if (patterns.some(pattern => pattern.test(lowerMessage))) {
            return intent;
        }
    }

    return null;
}

// Devuelve la acción completa (endpoint, método, params) según la intención detectada
export function detectAction(message: string): Action | null {
    const intent = detectIntent(message);
    if (!intent) return null;

    return INTENT_TO_ACTION[intent] || null;
}
