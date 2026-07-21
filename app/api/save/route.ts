export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// Helper: Verify token with Supabase and get user ID
async function getUserIdFromToken(token: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables missing");
    return null;
  }

  try {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!response.ok) {
      console.error("Token verification failed:", response.status);
      return null;
    }

    const userData = await response.json();
    return userData.id || null;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify token and get user ID
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const body = await request.json();
    if (!body.title || !body.contentText) {
      return NextResponse.json(
        { error: "Missing required fields: title and contentText." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ✅ FIXED: Insert into "saved_posts" (not "saves")
    const { rows } = await pool.query(
      `INSERT INTO saved_posts (user_id, title, author, content, url, tag, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, author, content, url, tag, type, created_at`,
      [
        userId,
        body.title,
        body.author || "Unknown Author",
        body.contentText,
        body.url || "",
        body.tag || "General",
        body.type || "Post",
      ]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json([], { status: 200, headers: corsHeaders() });
    }

    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json([], { status: 200, headers: corsHeaders() });
    }

    // ✅ FIXED: Select from "saved_posts" (not "saves")
    const { rows } = await pool.query(
      `SELECT id, title, author, content, url, tag, type, created_at
       FROM saved_posts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json(rows, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
