import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    console.error("[Auth Error]", error);
    return null;
  }
}

// EDIT Post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders() });
    }

    const body = await request.json();
    const { title, author, content, tag, type } = body;

    const { rowCount } = await pool.query(
      `UPDATE saved_posts 
       SET title = $1, author = $2, content = $3, tag = $4, type = $5
       WHERE id = $6 AND user_id = $7`,
      [title, author, content, tag, type, params.id, userId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404, headers: corsHeaders() });
    }

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}

// DELETE Post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders() });
    }

    const { rowCount } = await pool.query(
      "DELETE FROM saved_posts WHERE id = $1 AND user_id = $2",
      [params.id, userId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404, headers: corsHeaders() });
    }

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}
