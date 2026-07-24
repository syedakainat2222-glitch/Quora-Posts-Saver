import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

async function getUserIdFromToken(token: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return null

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnonKey },
    })
    if (!response.ok) return null
    const userData = await response.json()
    return userData.id || null
  } catch (error) {
    return null
  }
}

// GET /api/save/tags – list all tags with counts for the user
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json([], { status: 200, headers: corsHeaders() })
    }
    const userId = await getUserIdFromToken(authHeader.split(" ")[1])
    if (!userId) return NextResponse.json([], { status: 200, headers: corsHeaders() })

    const { rows } = await pool.query(
      `SELECT tag as name, COUNT(*) as count
       FROM saved_posts
       WHERE user_id = $1 AND tag IS NOT NULL
       GROUP BY tag
       ORDER BY count DESC, tag ASC`,
      [userId]
    )
    return NextResponse.json(rows, { status: 200, headers: corsHeaders() })
  } catch (error) {
    console.error("Tags GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() })
  }
}

// PUT /api/save/tags – rename a tag for all user's posts
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() })
    }
    const userId = await getUserIdFromToken(authHeader.split(" ")[1])
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders() })
    }

    const { oldName, newName } = await request.json()
    if (!oldName || !newName) {
      return NextResponse.json({ error: "Missing oldName or newName" }, { status: 400, headers: corsHeaders() })
    }

    await pool.query(
      `UPDATE saved_posts SET tag = $1 WHERE user_id = $2 AND tag = $3`,
      [newName, userId, oldName]
    )
    return NextResponse.json({ success: true }, { headers: corsHeaders() })
  } catch (error) {
    console.error("Tags PUT error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() })
  }
}

// DELETE /api/save/tags – remove a tag (set to 'General') for all user's posts
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() })
    }
    const userId = await getUserIdFromToken(authHeader.split(" ")[1])
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders() })
    }

    const { tag } = await request.json()
    if (!tag) {
      return NextResponse.json({ error: "Missing tag" }, { status: 400, headers: corsHeaders() })
    }

    await pool.query(
      `UPDATE saved_posts SET tag = 'General' WHERE user_id = $1 AND tag = $2`,
      [userId, tag]
    )
    return NextResponse.json({ success: true }, { headers: corsHeaders() })
  } catch (error) {
    console.error("Tags DELETE error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders() })
  }
}
