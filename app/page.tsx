"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-styles.css";
import ChatBotModal from './components/ChatBotModal.tsx';
import { useRouter } from "next/navigation";

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  selectedDate: Date | null;
};

type ProviderType = {
  ProviderId: string;
  ProviderName: string;
  ProductBases: Array<{
    ProductBaseId: string;
    ProductBaseName: string;
    Products: Array<{ ProductId: string; ProductName: string }>;
  }>;
};

type CartItem = {
  ProductId: string;
  ProductName: string;
  Quantity: number;
  AccessDateTime?: string;
  selectedDate?: string;
};

type SessionType = {
  SessionId: string;
  SessionTime: string;
  GroupName: any;
  ProfileName: any;
};

type PaymentMethod = {
  Type: number;
  Name: string;
};

const normalizeDate = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const normalizeDateForComparison = (dateString) => {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function Home() {
  const [providers, setProviders] = useState<ProviderType[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkout, setCheckout] = useState<boolean>(false);
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);
  const [transactionSuccess, setTransactionSuccess] = useState<boolean | null>(
    null
  );
  const [responseData, setResponseData] = useState<any>(null);
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(false);
  const [selectedSessions, setSelectedSessions] = useState({});
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    normalizeDate(new Date())
  );
  const [minutesToExpiry, setMinutesToExpiry] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [reservationResponse, setReservationResponse] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/catalog-basic");
        if (!response.ok) throw new Error("Failed to fetch catalog data");
        const data = await response.json();
        setProviders(data.Providers || []);

        console.log("Providers data", data);
      } catch (error: any) {
        setError(error.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  useEffect(() => {
    if (selectedProviderId) {
      const selectedProvider = providers.find(
        (provider) => provider.ProviderId === selectedProviderId
      );

      if (selectedProvider) {
        // Paso 1: Verificar si algún TicketEnclosure tiene la propiedad Sessions
        const hasSessions = selectedProvider.TicketEnclosures.some(
          (enclosure) =>
            enclosure.Sessions?.SessionsGroupSessionContents?.length > 0
        );

        if (hasSessions) {
          console.log(
            "Existe al menos un TicketEnclosure con la propiedad 'Sessions'"
          );
        } else {
          console.log(
            "No hay ningún TicketEnclosure con la propiedad 'Sessions'"
          );
        }

        // Paso 2: Identificar los TicketEnclosureIds con sesiones
        const ticketEnclosuresWithSessions =
          selectedProvider.TicketEnclosures.filter(
            (enclosure) =>
              enclosure.Sessions?.SessionsGroupSessionContents?.length > 0
          ).map((enclosure) => enclosure.TicketEnclosureId);

        console.log(
          "Recintos con sesiones (TicketEnclosureIds):",
          ticketEnclosuresWithSessions
        );

        // Paso 3: Relacionar productos con los TicketEnclosureIds
        const productsWithSessions = [];

        selectedProvider.ProductBases.forEach((productBase) => {
          productBase.Products?.forEach((product) => {
            product.Tickets?.forEach((ticket) => {
              if (
                ticketEnclosuresWithSessions.includes(ticket.TicketEnclosureId)
              ) {
                productsWithSessions.push({
                  productId: product.ProductId,
                  productName: product.ProductName,
                  ticketEnclosureId: ticket.TicketEnclosureId,
                  ticketName: ticket.TicketName,
                });
              }
            });
          });
        });

        console.log(
          "Productos relacionados con sesiones:",
          productsWithSessions
        );

        // Paso 4: Continuar lógica para obtener sesiones si existen grupos de sesiones
        const sessionsGroupsIds = selectedProvider.TicketEnclosures.flatMap(
          (enclosure) =>
            enclosure.Sessions?.SessionsGroupSessionContents.map(
              (session) => session.SessionsGroupId
            )
        ).filter((id) => id !== undefined);

        console.log("sessionsGroupsIds", sessionsGroupsIds);

        if (sessionsGroupsIds?.length > 0) {
          setSessionsLoading(true);
          fetchSessions(sessionsGroupsIds)
            .then((fetchedSessions) => {
              console.log("Fetched sessions", fetchedSessions);
              setSessions(fetchedSessions);

              // Relacionar las sesiones obtenidas con los productos con sesiones si es necesario
              // Aquí puedes implementar cualquier lógica adicional
            })
            .catch((error) =>
              console.error("Error al obtener sesiones:", error)
            )
            .finally(() => setSessionsLoading(false));
        }
      }
    }
  }, [selectedProviderId, providers]);

  // Hook para manejar la construcción del calendario
  useEffect(() => {
    if (selectedProviderId) {
      const selectedProvider = providers.find(
        (provider) => provider.ProviderId === selectedProviderId
      );

      if (selectedProvider) {
        const datesSet = new Set<string>();

        selectedProvider.ProductBases?.forEach((productBase) => {
          productBase.Products?.forEach((product) => {
            product.PricesAndDates?.forEach((priceAndDate) => {
              if (priceAndDate.Dates) {
                const priceDatesArray = priceAndDate.Dates.split(",");
                priceDatesArray.forEach((date) => datesSet.add(date));
              }
            });
          });
        });

        const uniqueDates = Array.from(datesSet).sort();
        if (uniqueDates.length > 0) {
          // Crear el rango de fechas
          const minDate = new Date(uniqueDates[0]);
          const maxDate = new Date(uniqueDates[uniqueDates.length - 1]);

          const dateRange = [];
          let currentDate = new Date(minDate);

          while (currentDate <= maxDate) {
            dateRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          setDateRange(dateRange); // Actualiza el rango de fechas para el calendario
        }
      }
    }
  }, [selectedProviderId, providers]); // Dependencias relacionadas con el calendario

  useEffect(() => {
    if (transactionSuccess !== null) {
      router.push(transactionSuccess ? "/compra-ok" : "/compra-error");
    }
  }, [transactionSuccess, router]);
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    /* console.log("Selected date:", date); */
  };


  const addToCart = (
    product: { ProductId: string; ProductName: string },
    selectedDate: string,
    ticket?: { TicketId: string; SessionId?: string; SessionTime?: string }
  ) => {
    setCart((prevCart) => {
      // Crear un identificador único para el producto basado en ProductId y selectedDate
      const uniqueKey = `${product.ProductId}-${selectedDate}`;
      const existingItem = prevCart.find(
        (item) =>
          `${item.ProductId}-${item.selectedDate}` === uniqueKey
      );
  
      if (existingItem) {
        // Incrementar la cantidad si el producto con la misma fecha ya existe
        return prevCart.map((item) =>
          `${item.ProductId}-${item.selectedDate}` === uniqueKey
            ? {
                ...item,
                Quantity: item.Quantity + 1,
                Tickets: ticket ? [{ ...ticket }] : item.Tickets,
              }
            : item
        );
      }
  
      // Agregar un nuevo producto si no existe en el carrito
      return [
        ...prevCart,
        {
          ...product,
          selectedDate,
          Quantity: 1,
          Tickets: ticket ? [{ ...ticket }] : [],
        },
      ];
    });
  
    console.log("Cart updated:", cart);
  };
  
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.ProductId === productId
      );
      if (existingItem && existingItem.Quantity > 1) {
        return prevCart.map((item) =>
          item.ProductId === productId
            ? { ...item, Quantity: item.Quantity - 1 }
            : item
        );
      }
      return prevCart.filter((item) => item.ProductId !== productId);
    });
  };

  const buildProductsArray = () => {
    const products: Array<{ ProductId: string }> = [];
    cart.forEach((item) => {
      for (let i = 0; i < item.Quantity; i++) {
        products.push({ ProductId: item.ProductId });
      }
    });
    return products;
  };

  const handleTransactionCreate = async (
    clientData: any
  ) => {

    setTransactionLoading(true);

    const { ReservationId, AccessDateTime, Products } = reservationResponse;

    if (
      !ReservationId ||
      !AccessDateTime ||
      !Products ||
      !clientData ||
      !selectedPaymentMethod ||
      Products.length === 0
    ) {
      console.error("Missing required fields in create transaction response.");
      return;
    }

    console.log("Creating transaction with data:", reservationResponse)
    console.log("Creating transaction with clientData", clientData);

/*     FullName: The client’s name. If we decide to forward the Client, then this field is mandatory.
Surname: The client’s last name(s). If we decide to forward the Client, then this field is mandatory.
Email: Client email.
DocumentIdentifier: DNI or NIF (Spanish national ID or Tax ID number).
PhoneNumber: Telephone number. */

    const transactionPayload = {
      IsTest: false,
      ReservationId,
      AccessDateTime,
      Products: Products.map((product: any) => ({
        ProductId: product.ProductId,
        Tickets: product.Tickets?.map((ticket: any) => ({
          TicketId: ticket.TicketId,
          SessionId: ticket.SessionId,
        })),
      })),
      Client: { 
        FullName: clientData.name, 
        Surname: clientData.lastName, 
        Email: clientData.email, 
        DocumentIdentifier: clientData.dni, 
        PhoneNumber: clientData.phone, 
       },
      PaymentMethod: { PaymentMethodType: selectedPaymentMethod.Type, SendByEmail: false },
    };

    try {
      console.log(
        "Transaction Payload:",
        JSON.stringify(transactionPayload, null, 2)
      );

      const transactionResponse = await fetch("/api/transactions-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionPayload),
      });

      if (!transactionResponse.ok) {
        throw new Error("Failed to create transaction");
      }

      const transactionData = await transactionResponse.json();
      console.log("Transaction Response:", transactionData);

      if (transactionData.Success) {
        console.log("Transaction completed successfully.");
        setTransactionSuccess(true);
        setResponseData(transactionData);
        setTransactionLoading(false);

      } else {
        console.error(
          "Transaction failed with message:",
          transactionData.ErrorMessage || "Unknown error"
        );
        router.push("/compra-error")
      }
    } catch (error) {
      console.error(
        "Error in handleTransactionCreate:",
        error.message || error
      );
      router.push("/compra-error")
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      throw new Error("El carrito está vacío. Agrega productos antes de proceder.");
    }
  
    setTransactionLoading(true);
  
    try {
      // Construir el arreglo de productos
      const productsArrayForReserve = cart.map((item) => {
        
        const accessDate = item.selectedDate?.split("/") // Dividir la fecha en partes (día, mes, año)
        .reverse() // Invertir el orden a [año, mes, día]
        .map((part) => part.padStart(2, "0")) // Asegurarse de que los meses y días tengan dos dígitos
        .join("-"); // Unir las partes con guiones
      
      console.log("Access Date (formateada):", accessDate);

        if (item.Tickets && item.Tickets.length > 0) {
          return {
            ProductId: item.ProductId,
            Quantity: item.Quantity,
            AccessDateTime: accessDate, // Fecha relacionada con el producto
            Tickets: item.Tickets.map((ticket) => ({
              TicketId: ticket.TicketId,
              SessionId: ticket.SessionId,
              AccessDateTime: accessDate, // Fecha relacionada con el ticket
            })),
          };
        }
  
        return {
          ProductId: item.ProductId,
          Quantity: item.Quantity,
          AccessDateTime: accessDate, // Fecha relacionada con el producto
        };
      });

          // **Consulta de Precios en Tiempo Real**
    const availabilityPayload = {
      ProductIds: productsArrayForReserve.map((product) => product.ProductId),
      AccessDates: productsArrayForReserve.map((product) => product.AccessDateTime),
    };

    console.log("Payload de disponibilidad y precios:", JSON.stringify(availabilityPayload, null, 2));

    const availabilityResponse = await fetch("/api/availability-price-realtimePrices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(availabilityPayload),
    });

    if (!availabilityResponse.ok) {
      throw new Error("Error al obtener los precios en tiempo real.");
    }

    const availabilityData = await availabilityResponse.json();

    console.log("Respuesta de disponibilidad y precios:", availabilityData);
  
      const reservePayload = {
        ApiKey: process.env.NEXT_PUBLIC_API_KEY,
        IsTest: false,
        Products: productsArrayForReserve,
        AccessDateTime: selectedDate.toISOString().split("T")[0],
      };
  
     /*  .toISOString().split("T")[0]; */
      console.log("Payload de reserva:", JSON.stringify(reservePayload, null, 2));
  
      // Realizar la solicitud de reserva
      const reserveResponse = await fetch("/api/reservations-reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservePayload),
      });
  
      if (!reserveResponse.ok) {
        throw new Error("Falló la reserva de productos.");
      }
  
      const reserveData = await reserveResponse.json();
      console.log("Respuesta de reserva:", reserveData);
  


      
      if (!reserveData.Success) {
        throw new Error(
          reserveData.ErrorMessage || "La reserva falló por razones desconocidas."
        );
      }
  
      // Procesar el response (por ejemplo, manejar PaymentMethods)
      const paymentMethodsResponse = await fetch(
        `/api/payment-methods?reservationID=${encodeURIComponent(
          reserveData.ReservationId
        )}`,
        {
          method: "GET",
        }
      );
  
      if (!paymentMethodsResponse.ok) {
        throw new Error("No se pudieron obtener los métodos de pago.");
      }
  
      const paymentMethodsData = await paymentMethodsResponse.json();
      console.log("Métodos de pago:", paymentMethodsData);
  
      if (!paymentMethodsData.Success) {
        throw new Error("Falló la obtención de métodos de pago desde la API.");
      }
  
      // Actualizar el estado con los métodos de pago (si corresponde)
      setPaymentMethods(paymentMethodsData.PaymentMethods);
  
      // Actualiza el temporizador de expiración
      setMinutesToExpiry(reserveData.MinutesToExpiry);

      setReservationResponse(reserveData);

    } catch (error) {
      console.error("Error en handleCheckout:", error);
      setTransactionSuccess(false);
      setResponseData({
        error:
          error instanceof Error ? error.message : "Se produjo un error desconocido.",
      });
      router.push("/compra-error")
    } finally {
      setTransactionLoading(false);
      
    }
  };
  

  const totalProductsInCart = cart.reduce(
    (total, item) => total + item.Quantity,
    0
  );

  const fetchSessions = async (SessionsGroupIds) => {
    try {
      if (!SessionsGroupIds || SessionsGroupIds.length === 0) {
        throw new Error("SessionContentProfileIds no puede estar vacío.");
      }

      const response = await fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          SessionsGroupIds: SessionsGroupIds,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del endpoint: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.Success) {
        throw new Error(
          data.ErrorMessage || "La API devolvió un error desconocido."
        );
      }

      const parsedSessions =
        data.FilteredSessionsGroupProfiles?.flatMap((profile) =>
          profile.SessionsGroups?.flatMap((group) =>
            group.Sessions?.map((session) => ({
              SessionId: session.SessionId,
              SessionTime: session.SessionTime,
              GroupName: group.SessionsGroupName,
              ProfileName: profile.SessionsGroupProfileName,
            }))
          )
        ) || [];

      console.log("Sesiones obtenidas:", parsedSessions);

      return parsedSessions;
    } catch (error) {
      console.error("Error en fetchSessions:", error.message || error);
      return [];
    }
  };

  const handleProviderChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    console.log("Provider selected:", event.target.value);

    setSelectedProviderId(event.target.value);
    setSessions([]);
  };

  return (
    <div className="container mx-auto p-4 flex items-start gap-4">
      {!checkout ? (
        <div className="flex flex-col w-full">
          <div className="w-2/3">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold">
                Integración de servicios de API de Experticket
              </h1>
            </header>

            <div>
              <span className="font-thin text-2xl mb-4">Paso 1. </span>
              <h1 className="text-2xl font-bold mb-4">
                Selecciona tus entradas
              </h1>

              {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  {/* Dropdown de Proveedores */}
                  <select
                    onChange={handleProviderChange}
                    className="border p-2 rounded mb-4 text-black"
                    value={selectedProviderId || ""}
                  >
                    <option className="" value="" disabled>
                      Selecciona un proveedor
                    </option>
                    {providers.map((provider) => (
                      <option
                        key={provider.ProviderId}
                        value={provider.ProviderId}
                      >
                        {provider.ProviderName}
                      </option>
                    ))}
                  </select>

                  {/* Mostrar la Card del Proveedor Seleccionado */}
                  {selectedProviderId && (
                    <div>
                      {providers
                        .filter(
                          (provider) =>
                            provider.ProviderId === selectedProviderId
                        )
                        .map((provider) => (
                          <div key={provider.ProviderId}>
                            <h2 className="text-lg font-semibold">
                              {provider.ProviderName}
                            </h2>

                            {/*       <h2>Select a Date</h2> */}
                            <Calendar
                              minDate={dateRange[0]}
                              maxDate={dateRange[dateRange.length - 1]}
                              tileDisabled={({ date }) => {
                                const isDisabled = !dateRange.some(
                                  (d) =>
                                    normalizeDate(d).getTime() ===
                                    normalizeDate(date).getTime()
                                );
                                return isDisabled;
                              }}
                              onClickDay={(date) =>
                                handleDateClick(normalizeDate(date))
                              }
                              className="my-4 mx-auto border rounded-lg shadow-lg"
                              tileClassName={({ date }) => {
                                // Example: Highlight weekends with red text
                                if (
                                  date.getDay() === 0 ||
                                  date.getDay() === 6
                                ) {
                                  return "text-blue-500"; // Tailwind class for red text
                                }
                                return undefined; // Return undefined for normal days
                              }}
                            />

                            {selectedDate && (
                              <p>
                                Fecha seleccionada:{" "}
                                {selectedDate.toLocaleDateString()}
                              </p>
                            )}

                            <div className="border rounded p-4 mt-4">
                              {/* Iterar por los recintos */}
                              {provider.TicketEnclosures.map((enclosure) => {
                                // Obtener productos relacionados con este TicketEnclosure y filtrarlos por fecha seleccionada
                                const productsForEnclosure =
                                  provider.ProductBases.flatMap((productBase) =>
                                    productBase.Products.filter((product) => {
                                      // Filtrar por fecha seleccionada
                                      const isAvailableOnDate =
                                        product.PricesAndDates.some(
                                          (priceDate) => {
                                            if (!selectedDate) return false;

                                            const dateArray =
                                              priceDate.Dates.split(",").map(
                                                (d) =>
                                                  normalizeDateForComparison(
                                                    new Date(d.trim())
                                                  )
                                              );

                                            return dateArray.some(
                                              (d) =>
                                                d.getTime() ===
                                                normalizeDateForComparison(
                                                  selectedDate
                                                ).getTime()
                                            );
                                          }
                                        );

                                      // Verificar si el producto pertenece al recinto actual
                                      const belongsToEnclosure =
                                        product.Tickets.some(
                                          (ticket) =>
                                            ticket.TicketEnclosureId ===
                                            enclosure.TicketEnclosureId
                                        );

                                      return (
                                        isAvailableOnDate && belongsToEnclosure
                                      );
                                    }).map((product) => ({
                                      ...product,
                                      productBaseName:
                                        productBase.ProductBaseName,
                                      HasSessions: product.Tickets.some(
                                        (ticket) =>
                                          provider.TicketEnclosures.some(
                                            (enclosure) =>
                                              enclosure.TicketEnclosureId ===
                                                ticket.TicketEnclosureId &&
                                              enclosure.Sessions
                                                ?.SessionsGroupSessionContents
                                                ?.length > 0
                                          )
                                      ),
                                    }))
                                  );

                                // No mostrar recintos sin productos disponibles en la fecha seleccionada
                                if (productsForEnclosure.length === 0)
                                  return null;

                                // Agrupar productos por categoría (ProductBaseName)
                                const productsByCategory =
                                  productsForEnclosure.reduce(
                                    (acc, product) => {
                                      const categoryName =
                                        product.productBaseName ||
                                        "Sin Categoría";
                                      if (!acc[categoryName])
                                        acc[categoryName] = [];
                                      acc[categoryName].push(product);
                                      return acc;
                                    },
                                    {}
                                  );

                                return (
                                  <div
                                    key={enclosure.TicketEnclosureId}
                                    className="mb-6"
                                  >
                                    {/* Encabezado principal: Nombre del Recinto */}
                                    <h2 className="text-xl font-bold text-blue-400">
                                      {enclosure.TicketEnclosureName}
                                    </h2>

                                    {/* Renderizar productos agrupados por categoría */}
                                    {Object.entries(productsByCategory).map(
                                      ([categoryName, productsInCategory]) => (
                                        <div
                                          key={`${enclosure.TicketEnclosureId}-${categoryName}`}
                                          className="mt-4"
                                        >
                                          <ProductBase
                                            key={categoryName}
                                            productBase={{
                                              ProductBaseName: categoryName,
                                              Products: productsInCategory,
                                            }}
                                            addToCart={addToCart}
                                            removeFromCart={removeFromCart}
                                            cart={cart}
                                            fetchSessions={fetchSessions}
                                            sessions={sessions}
                                            setSessions={setSessions}
                                            selectedDate={selectedDate}
                                            setSessions={setSessions}
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div
  className="fixed w-1/3 bg-black text-white border rounded shadow-md p-4 mt-[147px] right-[50px]"
  style={{ height: "fit-content" }}
>
  <h2 className="text-xl font-semibold mb-4">Carrito</h2>
  <p className="mb-2">
    Productos en el carrito: {cart.reduce((sum, item) => sum + item.Quantity, 0)}
  </p>
  {cart.length === 0 ? (
    <p>No hay productos en el carrito.</p>
  ) : (
    <div>
      {cart.map((item, index) => (
        <div
          key={`${item.ProductId}-${item.selectedDate}-${index}`}
          className="flex justify-between items-center border-b border-white py-2"
        >
          <div className="flex flex-col">
            <span>{item.ProductName}</span>
            <span className="text-sm text-gray-400">Fecha: {item.selectedDate}</span>
          </div>
          <span className="font-semibold">x{item.Quantity}</span>
        </div>
      ))}
    </div>
  )}
  <button
    onClick={() => {
      setCheckout(true);
      handleCheckout();
    }}
    className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-500"
  >
    Finalizar Compra ({cart.reduce((sum, item) => sum + item.Quantity, 0)})
  </button>
</div>

        </div>
      ) : transactionSuccess !== null ? (
        <div className="container mx-auto p-4">
          <h1
            className={`text-3xl font-bold text-center ${
              transactionSuccess ? "text-green-500" : "text-red-500"
            }`}
          >
            {transactionSuccess
              ? "Compra Realizada con Éxito"
              : "Error en la compra"}
          </h1>
          <pre className="mt-4 bg-gray-800 text-white p-4 rounded">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          <Checkout
            cart={cart}
            onConfirm={handleTransactionCreate}
            transactionLoading={transactionLoading}
            paymentMethods={paymentMethods}
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            minutesToExpiry={minutesToExpiry}
          />
        </>
      )}
    </div>
  );
}

type ProductBaseProps = {
  productBase: {
    ProductBaseId: string;
    ProductBaseName: string;
    Products: Array<{
      ProductId: string;
      ProductName: string;
      HasSessions: boolean;
    }>;
    setSessions: React.SetStateAction<
      Array<{
        SessionId: string;
        SessionTime: string;
        GroupName: string;
        ProfileName: string;
      }>
    >;
  };
  addToCart: (product: { ProductId: string; ProductName: string }, SelectedDate: string) => void;
  removeFromCart: (productId: string) => void;
  fetchSessions: (productId: string) => Promise<void>; // Función para obtener sesiones
  cart: Array<{
    ProductId: string;
    ProductName: string;
    Quantity: number;
    AccessDateTime?: string;
  }>;
  sessions: Array<{
    SessionId: string;
    SessionTime: string;
  }>;
  selectedDate: Date;
  setCart: React.Dispatch<
    React.SetStateAction<
      Array<{
        ProductId: string;
        ProductName: string;
        Quantity: number;
        AccessDateTime?: string;
      }>
    >
  >;
};

const ProductBase = ({
  productBase,
  addToCart,
  removeFromCart,
  selectedDate,
  cart,
  sessions,
}: ProductBaseProps) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  // Función para obtener la cantidad total de un producto en el carrito por fecha
  const getQuantityByDate = (productId: string, date: string) => {
    return cart
      .filter((item) => item.ProductId === productId && item.selectedDate === date)
      .reduce((sum, item) => sum + item.Quantity, 0);
  };

  return (
    <div className="border rounded p-4">
      <h2 className="text-lg font-semibold">{productBase.ProductBaseName}</h2>
      <div className="mt-2">
        {productBase.Products.map((product) => {
          // Cantidad total por fecha seleccionada
          const quantityForDate = selectedDate
            ? getQuantityByDate(product.ProductId, selectedDate.toLocaleDateString())
            : 0;

          return (
            <div key={product.ProductId} className="flex flex-col p-2 border-b">
              {/* Nombre del producto */}
              <div className="flex justify-between items-center">
                <span>{product.ProductName}</span>
                <div className="flex items-center space-x-2">
                  {/* Botón para decrementar */}
                  <button
                    className="px-2 py-1 bg-red-400 rounded hover:bg-red-600"
                    onClick={() => removeFromCart(product.ProductId)}
                    disabled={quantityForDate === 0}
                  >
                    -
                  </button>
                  {/* Mostrar cantidad por fecha */}
                  <span className="px-2">
                    {quantityForDate}
                  </span>
                  {/* Botón para incrementar */}
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      if (product.HasSessions) {
                        if (!selectedSessionId) {
                          alert("Por favor selecciona una sesión primero.");
                          return;
                        }
                        const selectedSession = sessions.find(
                          (session) => session.SessionId === selectedSessionId
                        );
                        if (selectedSession) {
                          addToCart(
                            {
                              ProductId: product.ProductId,
                              ProductName: product.ProductName,
                            },
                            selectedDate.toLocaleDateString(),
                            {
                              TicketId: product.Tickets[0]?.TicketId,
                              SessionId: selectedSession.SessionId,
                              SessionTime: selectedSession.SessionTime,
                            }
                          );
                        }
                      } else {
                        addToCart(
                          {
                            ProductId: product.ProductId,
                            ProductName: product.ProductName,
                          },
                          selectedDate.toLocaleDateString()
                        );
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mostrar dropdown de sesiones si el producto tiene sesiones */}
              {product.HasSessions && (
                <div className="mt-4">
                  <select
                    className="border p-2 rounded w-full text-black"
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                  >
                    <option value="">Selecciona una sesión</option>
                    {sessions
                      .filter((session) => {
                        const sessionDate = new Date(session.SessionTime)
                          .toISOString()
                          .split("T")[0];
                        const selectedDateString = selectedDate
                          ?.toISOString()
                          .split("T")[0];
                        return sessionDate === selectedDateString;
                      })
                      .map((session) => (
                        <option
                          key={session.SessionId}
                          value={session.SessionId}
                        >
                          {new Date(session.SessionTime).toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


type CheckoutProps = {
  cart: CartItem[];
  onConfirm: any;
  transactionLoading: boolean;
  minutesToExpiry: number | null;
  paymentMethods: any[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod | null>>;
};

const Checkout = ({
  cart,
  onConfirm,
  transactionLoading,
  minutesToExpiry,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}: CheckoutProps) => {
  const handleSubmit = (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    onConfirm(data);
  };

  return transactionLoading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
    </div>
  ) : (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Confirmar tu Reserva</h1>
        {minutesToExpiry !== null && (
          <CountdownTimer minutes={minutesToExpiry} />
        )}
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          {/* Datos personales */}
          <section className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">
              Rellena tus datos personales
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="name"
                type="text"
                placeholder="Nombre"
                className="p-2 border rounded text-black"
                required
              />
              <input
                name="lastName"
                type="text"
                placeholder="Apellidos"
                className="p-2 border rounded text-black"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="p-2 border rounded text-black"
                required
              />
              <input
                name="phone"
                type="text"
                placeholder="Teléfono"
                className="p-2 border rounded text-black"
                required
              />
              <input
                name="dni"
                type="text"
                placeholder="DNI/Pasaporte"
                className="p-2 border rounded text-black"
                required
              />
            </div>
          </section>

          {/* Métodos de pago */}
          <section className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">
              Selecciona un método de pago
            </h2>

            {paymentMethods.length > 0 ? (
              <div>
                {paymentMethods.map((method) => (
                  <label key={method.Type} className="block mb-2">
                    <input
                      type="radio"
                      name="payment"
                      value={method.Name}
                      onChange={() => setSelectedPaymentMethod(method)}
                      required
                    />{" "}
                    {method.Name}
                  </label>
                ))}

                {/* Mostrar información dinámica del método seleccionado */}
                {selectedPaymentMethod && (
                  <div className="mt-4 p-4 border rounded bg-gray-100 text-black">
                    <h3 className="text-md font-bold">
                      Detalles del Método de Pago
                    </h3>
                    <p>
                      Has seleccionado: <strong>{selectedPaymentMethod.Name}</strong>
                    </p>
                    {selectedPaymentMethod.Name === "Tarjeta bancaria" && (
                      <div>
                        <p>
                          Recibirás un correo donde serás redirigido para completar
                          el pago con tarjeta.
                        </p>
                      </div>
                    )}
                    {selectedPaymentMethod.Name === "Paypal" && (
                      <div>
                        <p>
                          Recibirás un correo donde serás redirigido a la página de Paypal para completar
                          el pago.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p>Cargando métodos de pago...</p>
            )}
          </section>

            <div className="container mx-auto p-4 w-full flex justify-center items-center">
            <ChatBotModal />
            </div>

          {/* Condiciones generales */}
          <section className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">
              Condiciones generales
            </h2>
            <div>
              <label>
                <input type="checkbox" required /> He leído, comprendo y acepto
                las condiciones de compra.
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" required /> He leído, comprendo y acepto
                la política de privacidad.
              </label>
            </div>
          </section>

          <button
            type="submit"
            className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Confirmar y Comprar
          </button>
        </div>
      </form>
    </div>
  );
};

const CountdownTimer = ({ minutes }: { minutes: number }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60); // Convertir a segundos

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formatear el tiempo en minutos y segundos
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="text-center mt-4">
      <h2 className="text-lg font-semibold">Tiempo Restante</h2>
      <p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
    </div>
  );
};
