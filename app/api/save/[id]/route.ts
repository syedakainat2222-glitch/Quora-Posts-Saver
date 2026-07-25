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

// ✅ PUT – update a post
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  console.log(`[PUT] Request received at ${new Date().toISOString()}`);
  try {
    const { id } = await context.params;
    console.log(`[PUT] ID: ${id}`);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[PUT] Unauthorized – missing token");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      console.error("[PUT] Invalid session");
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const body = await request.json();
    console.log(`[PUT] Body:`, body);

    const { title, author, content, tag, type } = body;

    const { rowCount } = await pool.query(
      `UPDATE saved_posts 
       SET title = $1, author = $2, content = $3, tag = $4, type = $5
       WHERE id = $6 AND user_id = $7`,
      [title, author, content, tag, type, id, userId]
    );

    console.log(`[PUT] rowCount: ${rowCount}`);

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "Post not found or unauthorized" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[PUT] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// ✅ DELETE – remove a post
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  console.log(`[DELETE] Request started at ${new Date().toISOString()}`);

  try {
    const { id } = await context.params;
    console.log(`[DELETE] id = ${id}`);

    const authHeader = request.headers.get("Authorization");
    console.log(`[DELETE] authHeader present: ${!!authHeader}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[DELETE] Missing or invalid Authorization header");
      return NextResponse.json(
        { error: "Unauthorized – missing token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken(token);
    console.log(`[DELETE] userId = ${userId}`);

    if (!userId) {
      console.error("[DELETE] Invalid token – userId null");
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { rowCount } = await pool.query(
      "DELETE FROM saved_posts WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    console.log(`[DELETE] rowCount = ${rowCount}`);

    if (rowCount === 0) {
      console.warn("[DELETE] No rows deleted – post not found or unauthorized");
      return NextResponse.json(
        { error: "Post not found or unauthorized" },
        { status: 404, headers: corsHeaders() }
      );
    }

    console.log(`[DELETE] Success – ${rowCount} row(s) deleted in ${Date.now() - start}ms`);
    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[DELETE] Unhandled error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
