import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
  const partnerId: string | undefined = process.env.NEXT_PUBLIC_PARTNER_ID;

  if (!baseUrl || !partnerId) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 }
    );
  }

  try {
    // Extraer los SessionsGroupIds del cuerpo de la solicitud
    const { SessionsGroupIds } = await req.json();

    if (!SessionsGroupIds || SessionsGroupIds.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty SessionsGroupIds in the request body." },
        { status: 400 }
      );
    }

    // Primera solicitud con PartnerId para obtener todos los datos
    const apiUrl = `${baseUrl}/sessions?PartnerId=${partnerId}`;

    console.log("Fetching all sessions data:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all sessions: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.Success) {
      throw new Error(data.ErrorMessage || "API response was unsuccessful.");
    }

    // Filtrar los datos para incluir solo los SessionsGroupIds requeridos
    const filteredSessions = data.SessionsGroupProfiles?.filter((profile: any) =>
      profile.SessionsGroups?.some((group: any) =>
        SessionsGroupIds.includes(group.SessionsGroupId)
      )
    ) || [];

    // Construir la respuesta solo con los datos filtrados
    const result = {
      Success: true,
      FilteredSessionsGroupProfiles: filteredSessions,
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred.";
    console.error("Error in /api/sessions endpoint:", errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
