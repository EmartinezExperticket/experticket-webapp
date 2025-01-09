"use client";

import { useEffect, useState } from "react";

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
};

type SessionType = {
  SessionId: string;
  SessionTime: string;
  GroupName: any;
  ProfileName: any;
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

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/catalog-basic");
        if (!response.ok) throw new Error("Failed to fetch catalog data");
        const data = await response.json();
        setProviders(data.Providers || []);

        console.log("Catalog data", data);
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
            })
            .catch((error) =>
              console.error("Error al obtener sesiones:", error)
            )
            .finally(() => setSessionsLoading(false));
        }
      }
    }
  }, [selectedProviderId, providers]);

  const handleSessionChange = (productId, session) => {
    setSelectedSessions((prev) => ({
      ...prev,
      [productId]: session, // Actualiza la sesión para el producto específico
    }));
  };

  const addToCart = (product: { ProductId: string; ProductName: string }, ticket?: { TicketId: string; SessionId?: string; SessionTime?: string }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.ProductId === product.ProductId);
    
      if (existingItem) {
        return prevCart.map((item) =>
          item.ProductId === product.ProductId
            ? {
                ...item,
                Quantity: item.Quantity + 1,
                Tickets: ticket ? [{ ...ticket }] : item.Tickets,
              }
            : item
        );
      }
    
      return [
        ...prevCart,
        {
          ...product,
          Quantity: 1,
          Tickets: ticket ? [{ ...ticket }] : [],
        },
      ];
    });
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

  const handleTransactionCreate = async (reservationResponse: any) => {
    
    const { ReservationId, AccessDateTime, Products } = reservationResponse;
  
    if (!ReservationId || !AccessDateTime || !Products || Products.length === 0) {
      console.error("Missing required fields in reservation response.");
      return;
    }
  
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
    };
  
    try {
      console.log("Transaction Payload:", JSON.stringify(transactionPayload, null, 2));
  
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
        return transactionData;
      } else {
        console.error(
          "Transaction failed with message:",
          transactionData.ErrorMessage || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error in handleTransactionCreate:", error.message || error);
    }
  };
  

  const handleCheckout = async (formData: any) => {
    setTransactionLoading(true);
  
    try {
      let accessDate;
  
      const productsArrayForReserve = cart.map((item) => {

        const selectedSession = selectedSessions[item.ProductId];
        const productPayload: any = {
          ProductId: item.ProductId,
          Quantity: item.Quantity,
          AccessDateTime: selectedSession?.SessionTime.split("T")[0] || item.AccessDateTime?.split("T")[0],
        };
  
        if (item.Tickets?.length) {
          productPayload.Tickets = item.Tickets.map((ticket) => ({
            TicketId: ticket.TicketId,
            SessionId: ticket.SessionId,
          }));
        }

        accessDate = selectedSession?.SessionTime.split("T")[0] || item.AccessDateTime?.split("T")[0]
  
        return productPayload;
      });
  
      const reservePayload = {
        AccessDateTime: accessDate,
        IsTest: false,
        Products: productsArrayForReserve,
      };
  
      console.log("Payload de reserva:", JSON.stringify(reservePayload, null, 2));
  
      const reserveResponse = await fetch("/api/reservations-reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservePayload),
      });
  
      if (!reserveResponse.ok) {
        throw new Error("Failed to reserve products");
      }
  
      const reserveData = await reserveResponse.json();
      console.log("Reservation response:", reserveData);
  
      if (!reserveData.Success) {
        throw new Error(
          reserveData.ErrorMessage || "Reservation failed for unknown reasons."
        );
      }
  
      // Llamar a handleTransactionCreate con los datos de la reserva
      const transactionData = await handleTransactionCreate(reserveData);
  
      setTransactionSuccess(true);
      setResponseData(transactionData);

    } catch (error) {
      console.error("Error en handleCheckout:", error);
      setTransactionSuccess(false);
      setResponseData({
        error: error instanceof Error ? error.message : "Unknown error occurred.",
      });
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
    setSelectedProviderId(event.target.value);
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

                            <div className="border rounded p-4 mt-4">
                              {provider.ProductBases.map((productBase) => (
                                <ProductBase
                                  key={productBase.ProductBaseId}
                                  productBase={productBase}
                                  addToCart={addToCart}
                                  removeFromCart={removeFromCart}
                                  cart={cart}
                                  fetchSessions={fetchSessions} // Correcto: se pasa la función fetchSessions
                                  sessions={sessions} // Correcto: se pasa el estado de las sesiones
                                  setCart={setCart} // Correcto: se pasa la función para actualizar el carrito
                                  setSessions={setSessions} // Correcto: se pasa la función para actualizar las sesiones
                                />
                              ))}
                            </div>

                            {provider.ProviderName === "Axess Demo Catalog" && (
  <>
    {sessionsLoading ? (
      <div className="text-center my-4">
        <p>Cargando sesiones, por favor espera...</p>
      </div>
    ) : (
      <div className="border p-4 rounded mt-4">
        <h3 className="font-bold mb-2">Sesiones Disponibles</h3>

        {/* Mostrar advertencia si no hay productos de Session Products en el carrito */}
        {!cart.some((item) =>
          provider.ProductBases.some(
            (base) =>
              base.ProductBaseName === "Session Products" &&
              base.Products.some(
                (product) => product.ProductId === item.ProductId
              )
          )
        ) ? (
          <p className="text-red-500">
            Selecciona un producto de "Session Products" antes de elegir una sesión.
          </p>
        ) : (
          <>
            {/* Dropdown de Sesiones */}
            <select
  className="border p-2 rounded w-full text-black"
  onChange={(e) => {
    const selectedSession = sessions.find(
      (session) => session.SessionId === e.target.value
    );

    if (selectedSession) {
      const product = cart.find((item) =>
        provider.ProductBases.some(
          (base) =>
            base.Products.some(
              (product) => product.ProductId === item.ProductId
            )
        )
      );

      if (product) {
        const ticketId = provider.ProductBases
          .find((base) =>
            base.Products.some(
              (p) => p.ProductId === product.ProductId
            )
          )
          ?.Products.find(
            (p) => p.ProductId === product.ProductId
          )?.Tickets[0]?.TicketId;

        setCart((prevCart) =>
          prevCart.map((item) =>
            item.ProductId === product.ProductId
              ? {
                  ...item,
                  AccessDateTime: selectedSession.SessionTime,
                  Tickets: [
                    {
                      TicketId: ticketId,
                      SessionId: selectedSession.SessionId,
                      AccessDateTime: selectedSession.SessionTime,
                    },
                  ],
                }
              : item
          )
        );
      }
    }
  }}
>
  <option value="">Selecciona una sesión</option>
  {sessions.map((session) => (
    <option key={session.SessionId} value={session.SessionId}>
      {new Date(session.SessionTime).toLocaleString()}
    </option>
  ))}
</select>

            {/* Mostrar la fecha seleccionada */}
            {cart.some((item) => selectedSessions[item.ProductId]) && (
              <div className="mt-4">
                <h4 className="font-medium">Fecha Seleccionada:</h4>
                <p>
                  {new Date(
                    selectedSessions[
                      cart.find((item) =>
                        provider.ProductBases.some(
                          (base) =>
                            base.ProductBaseName === "Session Products" &&
                            base.Products.some(
                              (product) => product.ProductId === item.ProductId
                            )
                        )
                      )?.ProductId || ""
                    ]?.SessionTime!
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    )}
  </>
)}

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
              Productos en el carrito: {totalProductsInCart}
            </p>
            {cart.length === 0 ? (
              <p>No hay productos en el carrito.</p>
            ) : (
              <div>
                {cart.map((item) => (
                  <div
                    key={item.ProductId}
                    className="flex justify-between items-center border-b border-white py-2"
                  >
                    <span>{item.ProductName}</span>
                    <span className="font-semibold">x{item.Quantity}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setCheckout(true)}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-500"
            >
              Finalizar Compra ({totalProductsInCart})
            </button>
          </div>

          {/*           <div className="mt-8">
            <button
              onClick={async () => {
                setSessionsLoading(true);
                await fetchSessions();
                setSessionsLoading(false);
              }}
              className={`w-full px-4 py-2 ${
                sessionsLoading ? "bg-gray-300" : "bg-blue-500"
              } text-white rounded ${
                sessionsLoading ? "" : "hover:bg-green-500"
              }`}
              disabled={sessionsLoading}
            >
              {sessionsLoading ? "Cargando..." : "Ver Sesiones"}
            </button>

            {sessions.length > 0 && (
              <div className="border p-4 rounded mt-4">
                <h3 className="font-bold mb-2">Sesiones Disponibles</h3>
                {Object.entries(
                  sessions.reduce<
                    Record<string, Record<string, SessionType[]>>
                  >((acc, session) => {
                    if (!acc[session.ProfileName])
                      acc[session.ProfileName] = {};
                    if (!acc[session.ProfileName][session.GroupName]) {
                      acc[session.ProfileName][session.GroupName] = [];
                    }
                    acc[session.ProfileName][session.GroupName].push(session);
                    return acc;
                  }, {})
                ).map(([profileName, groups], index) => (
                  <div key={profileName} className="mt-2">
                    <h4
                      className="font-semibold cursor-pointer"
                      onClick={() => {
                        const element = document.getElementById(
                          `group-${index}`
                        );
                        if (element) {
                          element.style.display =
                            element.style.display === "none" ? "block" : "none";
                        }
                      }}
                    >
                      {profileName}
                      <span className="ml-2 text-sm text-blue-500">
                        Ver Sesiones
                      </span>
                    </h4>
                    <div
                      id={`group-${index}`}
                      style={{ display: "none" }}
                      className="ml-4"
                    >
                      {Object.entries(groups).map(
                        ([groupName, groupSessions]) => (
                          <div key={groupName} className="mt-2">
                            <h5 className="font-medium">{groupName}</h5>
                            <ul>
                              {groupSessions.map((session) => (
                                <li key={session.SessionId}>
                                  {new Date(
                                    session.SessionTime
                                  ).toLocaleString()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}
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
            onConfirm={handleCheckout}
            transactionLoading={transactionLoading}
          />
        </>
      )}
    </div>
  );
}

type ProviderProps = {
  provider: ProviderType;
  addToCart: (product: { ProductId: string; ProductName: string }) => void;
  removeFromCart: (productId: string) => void;
  cart: CartItem[];
};

const Provider = ({
  provider,
  addToCart,
  removeFromCart,
  cart,
}: ProviderProps) => {
  return (
    <div className="border rounded p-4">
      <h2 className="text-lg font-semibold">{provider.ProviderName}</h2>
      <div className="mt-2">
        {provider.ProductBases.map((productBase) => (
          <ProductBase
            key={productBase.ProductBaseId}
            productBase={productBase}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            cart={cart}
          />
        ))}
      </div>
    </div>
  );
};

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
  addToCart: (product: { ProductId: string; ProductName: string }) => void;
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
  fetchSessions,
  cart,
  setCart,
  sessions,
  setSessions,
}: ProductBaseProps) => {
  return (
    <div className="border rounded p-4">
      <h2 className="text-lg font-semibold">{productBase.ProductBaseName}</h2>
      <div className="mt-2">
      {productBase.Products.map((product) => {
  const cartItem = cart.find(
    (item) => item.ProductId === product.ProductId
  );

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
            disabled={!cartItem || cartItem.Quantity === 0}
          >
            -
          </button>
          {/* Mostrar cantidad */}
          <span className="px-2">{cartItem ? cartItem.Quantity : 0}</span>
          {/* Botón para incrementar */}
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={() =>
              addToCart({
                ProductId: product.ProductId,
                ProductName: product.ProductName,
              })
            }
          >
            +
          </button>
        </div>
      </div>

      {/* Mostrar sesiones si está en el carrito y tiene sesiones */}
      {cartItem && product.HasSessions && (
        <div className="mt-4">
          <select
            className="border p-2 rounded w-full"
            onChange={(e) => {
              const selectedSession = sessions.find(
                (session) => session.SessionId === e.target.value
              );
              if (selectedSession) {
                setCart((prevCart) =>
                  prevCart.map((item) =>
                    item.ProductId === product.ProductId
                      ? {
                          ...item,
                          AccessDateTime: selectedSession.SessionTime,
                          SessionId: selectedSession.SessionId, // Aquí se agrega el SessionId
                        }
                      : item
                  )
                );
              }
            }}
          >
            <option value="">Selecciona una sesión</option>
            {sessions
              .filter((session) => session.GroupName === product.ProductName)
              .map((session) => (
                <option key={session.SessionId} value={session.SessionId}>
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
  onConfirm: (formData: any) => void;
  transactionLoading: boolean;
};

const Checkout = ({ cart, onConfirm, transactionLoading }: CheckoutProps) => {
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
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
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

          <section className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">
              Selecciona un método de pago
            </h2>
            <div>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="Tarjeta bancaria"
                  required
                />{" "}
                Tarjeta bancaria
              </label>
              <label className="ml-4">
                <input type="radio" name="payment" value="Bizum" required />{" "}
                Bizum
              </label>
            </div>
          </section>

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
