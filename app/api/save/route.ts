export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// --- Helper to add CORS headers ---
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// --- OPTIONS handler (preflight) ---
export async function OPTIONS() {
  console.log(`[${new Date().toISOString()}] [OPTIONS] Preflight request received`);
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// --- Helper: Verify token with Supabase and get user ID ---
async function getUserIdFromToken(token: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log(`[${new Date().toISOString()}] [Auth] Verifying token (first 10 chars: ${token.substring(0, 10)}...)`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(`[${new Date().toISOString()}] [Auth] Supabase environment variables missing: URL=${!!supabaseUrl}, ANON_KEY=${!!supabaseAnonKey}`);
    return null;
  }

  try {
    console.log(`[${new Date().toISOString()}] [Auth] Fetching user from Supabase: ${supabaseUrl}/auth/v1/user`);
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });

    console.log(`[${new Date().toISOString()}] [Auth] Supabase response status: ${response.status}`);

    // Read response text once, log it, then parse
    const responseText = await response.text();
    console.log(`[${new Date().toISOString()}] [Auth] Supabase response body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);

    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] [Auth] Token verification failed with status ${response.status}`);
      return null;
    }

    const userData = JSON.parse(responseText);
    const userId = userData.id || null;
    console.log(`[${new Date().toISOString()}] [Auth] Successfully retrieved user ID: ${userId}`);
    return userId;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [Auth] Error verifying token:`, error);
    return null;
  }
}

// --- POST handler ---
export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [POST] [${requestId}] Request received`);

  try {
    // 1. Extract Authorization header
    const authHeader = request.headers.get("Authorization");
    console.log(`[${timestamp}] [POST] [${requestId}] Authorization header present: ${!!authHeader}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn(`[${timestamp}] [POST] [${requestId}] Missing or invalid Authorization header`);
      return NextResponse.json(
        { error: "Missing or invalid Authorization header." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authHeader.split(" ")[1];
    console.log(`[${timestamp}] [POST] [${requestId}] Extracted token (first 10 chars: ${token.substring(0, 10)}...)`);

    // 2. Verify token and get user ID
    console.log(`[${timestamp}] [POST] [${requestId}] Calling getUserIdFromToken...`);
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      console.warn(`[${timestamp}] [POST] [${requestId}] Invalid or expired session (userId is null)`);
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401, headers: corsHeaders() }
      );
    }
    console.log(`[${timestamp}] [POST] [${requestId}] User authenticated with ID: ${userId}`);

    // 3. Parse request body
    let body;
    try {
      body = await request.json();
      console.log(`[${timestamp}] [POST] [${requestId}] Request body parsed successfully:`, JSON.stringify(body).substring(0, 200) + (JSON.stringify(body).length > 200 ? '...' : ''));
    } catch (parseError) {
      console.error(`[${timestamp}] [POST] [${requestId}] Failed to parse JSON body:`, parseError);
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 4. Validate required fields
    if (!body.title || !body.contentText) {
      console.warn(`[${timestamp}] [POST] [${requestId}] Missing required fields: title=${!!body.title}, contentText=${!!body.contentText}`);
      return NextResponse.json(
        { error: "Missing required fields: title and contentText." },
        { status: 400, headers: corsHeaders() }
      );
    }
    console.log(`[${timestamp}] [POST] [${requestId}] Required fields present`);

    // 5. Prepare DB query parameters
    const params = [
      userId,
      body.title,
      body.author || "Unknown Author",
      body.contentText,
      body.url || "",
      body.tag || "General",
      body.type || "Post",
    ];
    console.log(`[${timestamp}] [POST] [${requestId}] DB params: [userId=${userId}, title="${body.title}", author="${body.author || 'Unknown Author'}", contentLength=${body.contentText.length}, url="${body.url || ''}", tag="${body.tag || 'General'}", type="${body.type || 'Post'}"]`);

    // 6. Execute insert query
    console.log(`[${timestamp}] [POST] [${requestId}] Executing INSERT INTO saved_posts...`);
    try {
      const { rows } = await pool.query(
        `INSERT INTO saved_posts (user_id, title, author, content, url, tag, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, author, content, url, tag, type, created_at`,
        params
      );

      console.log(`[${timestamp}] [POST] [${requestId}] Insert successful, returned row:`, rows[0]);
      console.log(`[${timestamp}] [POST] [${requestId}] Sending success response`);
      return NextResponse.json(
        { success: true, data: rows[0] },
        { status: 200, headers: corsHeaders() }
      );
    } catch (dbError) {
      console.error(`[${timestamp}] [POST] [${requestId}] Database error:`, dbError);
      return NextResponse.json(
        { error: "Database error: " + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500, headers: corsHeaders() }
      );
    }
  } catch (error) {
    console.error(`[${timestamp}] [POST] [${requestId}] Unhandled exception:`, error);
    return NextResponse.json(
      { error: "Internal Server Error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// --- GET handler ---
export async function GET(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [GET] [${requestId}] Request received`);

  try {
    // 1. Extract Authorization header (optional)
    const authHeader = request.headers.get("Authorization");
    console.log(`[${timestamp}] [GET] [${requestId}] Authorization header present: ${!!authHeader}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(`[${timestamp}] [GET] [${requestId}] No valid token, returning empty array (200)`);
      return NextResponse.json([], { status: 200, headers: corsHeaders() });
    }

    const token = authHeader.split(" ")[1];
    console.log(`[${timestamp}] [GET] [${requestId}] Extracted token (first 10 chars: ${token.substring(0, 10)}...)`);

    // 2. Verify token
    console.log(`[${timestamp}] [GET] [${requestId}] Calling getUserIdFromToken...`);
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      console.log(`[${timestamp}] [GET] [${requestId}] Invalid token, returning empty array (200)`);
      return NextResponse.json([], { status: 200, headers: corsHeaders() });
    }
    console.log(`[${timestamp}] [GET] [${requestId}] User authenticated with ID: ${userId}`);

    // 3. Query saved posts
    console.log(`[${timestamp}] [GET] [${requestId}] Executing SELECT FROM saved_posts WHERE user_id = $1...`);
    try {
      const { rows } = await pool.query(
        `SELECT id, title, author, content, url, tag, type, created_at
         FROM saved_posts
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      console.log(`[${timestamp}] [GET] [${requestId}] Retrieved ${rows.length} posts`);
      console.log(`[${timestamp}] [GET] [${requestId}] Sending response with ${rows.length} posts`);
      return NextResponse.json(rows, { status: 200, headers: corsHeaders() });
    } catch (dbError) {
      console.error(`[${timestamp}] [GET] [${requestId}] Database error:`, dbError);
      return NextResponse.json(
        { error: "Database error: " + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500, headers: corsHeaders() }
      );
    }
  } catch (error) {
    console.error(`[${timestamp}] [GET] [${requestId}] Unhandled exception:`, error);
    return NextResponse.json(
      { error: "Internal Server Error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500, headers: corsHeaders() }
    );
  }
}
