import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

async function getUserIdFromToken(token: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnonKey },
    });
    if (!response.ok) return null;
    const userData = await response.json();
    return userData.id || null;
  } catch (error) {
    return null;
  }
}

// Bulk DELETE
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });

    const userId = await getUserIdFromToken(authHeader.split(" ")[1]);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders() });

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "No IDs provided" }, { status: 400, headers: corsHeaders() });

    await pool.query(
      "DELETE FROM saved_posts WHERE id = ANY($1) AND user_id = $2",
      [ids, userId]
    );

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}

// Bulk PATCH (Update Tag)
export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });

    const userId = await getUserIdFromToken(authHeader.split(" ")[1]);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders() });

    const { ids, tag } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0 || !tag) return NextResponse.json({ error: "Invalid data" }, { status: 400, headers: corsHeaders() });

    await pool.query(
      "UPDATE saved_posts SET tag = $1 WHERE id = ANY($2) AND user_id = $3",
      [tag, ids, userId]
    );

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}
