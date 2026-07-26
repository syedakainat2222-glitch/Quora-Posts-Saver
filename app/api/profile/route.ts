import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
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
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!response.ok) return null;
    const userData = await response.json();
    return userData.id || null;
  } catch (error) {
    console.error("[Profile] Auth error:", error);
    return null;
  }
}

// GET /api/profile – fetch user's display name
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { rows } = await pool.query(
      `SELECT display_name FROM profiles WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      // No profile yet – create one with default name from email
      const email = await getUserEmailFromToken(token);
      const defaultName = email ? email.split('@')[0] : "User";
      await pool.query(
        `INSERT INTO profiles (id, display_name) VALUES ($1, $2)`,
        [userId, defaultName]
      );
      return NextResponse.json(
        { display_name: defaultName },
        { status: 200, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { display_name: rows[0].display_name },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[Profile] GET error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Helper to get email from token (for default name)
async function getUserEmailFromToken(token: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!response.ok) return null;
    const userData = await response.json();
    return userData.email || null;
  } catch (error) {
    return null;
  }
}

// PUT /api/profile – update display name
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const body = await request.json();
    const { display_name } = body;
    if (!display_name || typeof display_name !== "string") {
      return NextResponse.json(
        { error: "display_name is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    await pool.query(
      `INSERT INTO profiles (id, display_name, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         updated_at = now()`,
      [userId, display_name]
    );

    return NextResponse.json(
      { success: true, display_name },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[Profile] PUT error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
