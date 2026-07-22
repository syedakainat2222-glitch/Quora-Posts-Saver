import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
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

// GET all tags with counts for the user
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json([], { status: 200, headers: corsHeaders() });

    const userId = await getUserIdFromToken(authHeader.split(" ")[1]);
    if (!userId) return NextResponse.json([], { status: 200, headers: corsHeaders() });

    const { rows } = await pool.query(
      `SELECT tag as name, COUNT(*) as count 
       FROM saved_posts 
       WHERE user_id = $1 
       GROUP BY tag 
       ORDER BY count DESC`,
      [userId]
    );

    return NextResponse.json(rows, { status: 200, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}

// PUT: Rename a tag
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const userId = await getUserIdFromToken(authHeader?.split(" ")[1] || "");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });

    const { oldName, newName } = await request.json();
    if (!oldName || !newName) return NextResponse.json({ error: "Missing names" }, { status: 400, headers: corsHeaders() });

    await pool.query(
      "UPDATE saved_posts SET tag = $1 WHERE tag = $2 AND user_id = $3",
      [newName, oldName, userId]
    );

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}

// DELETE: Remove a tag (set to 'General')
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const userId = await getUserIdFromToken(authHeader?.split(" ")[1] || "");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });

    const { tag } = await request.json();
    if (!tag) return NextResponse.json({ error: "Missing tag" }, { status: 400, headers: corsHeaders() });

    await pool.query(
      "UPDATE saved_posts SET tag = 'General' WHERE tag = $1 AND user_id = $2",
      [tag, userId]
    );

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}
