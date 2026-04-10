import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('pb_auth')?.value;
  console.log("API: authCookie:", authCookie ? "YES" : "NO");
  
  if (!authCookie) {
    return NextResponse.json({ items: [], totalItems: 0 }, { status: 401 });
  }
  
  try {
    const authData = JSON.parse(decodeURIComponent(authCookie));
    const token = authData.token;
    const userId = authData.model?.id;
    console.log("API: userId:", userId);
    
    if (!token || !userId) {
      return NextResponse.json({ items: [], totalItems: 0 }, { status: 401 });
    }
    
    const pbUrl = 'http://127.0.0.1:8090';
    const filter = `creado_por = "${userId}"`;
    console.log("API: filter:", filter);
    
    const response = await fetch(
      `${pbUrl}/api/collections/tickets/records?filter=${encodeURIComponent(filter)}&sort=-created`,
      {
        headers: {
          'Authorization': token,
        },
      }
    );
    
    const data = await response.json();
    console.log("API: tickets:", data.totalItems);
    return NextResponse.json(data);
  } catch (error) {
    console.log("API error:", error);
    return NextResponse.json({ items: [], totalItems: 0 }, { status: 500 });
  }
}