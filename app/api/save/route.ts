import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(request: Request) {
  try {
    const postData = await request.json();

    if (!postData.title || !postData.contentText) {
      return NextResponse.json(
        { error: "Missing required post contents." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO saves (title, author, content, url, tag, type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, author, content, url, tag, type, created_at`,
      [
        postData.title,
        postData.author || "Unknown Author",
        postData.contentText,
        postData.url || "",
        postData.tag || "General",
        postData.type || "Post",
      ]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[v0] /api/save POST error:", error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, author, content, url, tag, type, created_at
       FROM saves
       ORDER BY created_at DESC`
    );

    return NextResponse.json(rows, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("[v0] /api/save GET error:", error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}