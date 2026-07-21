export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization"
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          error: "Missing Authorization header."
        },
        {
          status: 401,
          headers: corsHeaders()
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const body = await request.json();

    if (!body.title || !body.contentText) {
      return NextResponse.json(
        {
          error: "Missing required fields."
        },
        {
          status: 400,
          headers: corsHeaders()
        }
      );
    }

    const saveObject = {
      userToken: token,
      title: body.title,
      author: body.author || "Unknown",
      content: body.contentText,
      url: body.url || "",
      tag: body.tag || "General",
      type: body.type || "Post",
      createdAt: new Date().toISOString()
    };

    /*
      NEXT STEP

      Save saveObject into Supabase/Postgres.

      Right now we're simply returning success.
    */

    return NextResponse.json(
      {
        success: true,
        data: saveObject
      },
      {
        status: 200,
        headers: corsHeaders()
      }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error"
      },
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        [],
        {
          status: 200,
          headers: corsHeaders()
        }
      );
    }

    /*
      Later:

      Verify Supabase JWT

      Query only that user's saves

      Return them here.
    */

    return NextResponse.json(
      [],
      {
        status: 200,
        headers: corsHeaders()
      }
    );

  } catch (error) {
    return NextResponse.json(
      [],
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}
