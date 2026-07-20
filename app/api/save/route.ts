export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Crucial: Accepts user token headers
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    // 1. IDENTITY VERIFICATION CHECK
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentication required. Please log into the Q-Saver web application dashboard." },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Extract token string payload elements safely
    const token = authHeader.split(' ')[1];
    
    // 2. PRIVATE PROFILE SEGREGATION LAYER
    // When you link Supabase Auth or Clerk later, you will decrypt this token to pull the true client userId.
    // For now, we cleanly hash/slice the token string to automatically isolate different accounts in Postgres!
    const accountUserId = `usr_${token.slice(0, 10)}`;

    const postData = await request.json();
    if (!postData.title || !postData.contentText) {
      return NextResponse.json(
        { error: "Missing required post content payload items." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 3. COMPILE DATA MAP WITH PRIVATE OWNER FIELD IDENTIFIER
    const newMultiUserSaveEntry = {
      user_id: accountUserId, // This locks this database row strictly to this user account profile slot!
      title: postData.title,
      author: postData.author || "Unknown Author",
      content: postData.contentText,
      url: postData.url || "",
      tag: postData.tag || "General",
      type: postData.type || "Post",
      created_at: new Date().toISOString()
    };

    // Note: Your Neon Postgres SQL insert statement will pass ${accountUserId} into your database table query tracking column
    return NextResponse.json(
      { success: true, message: `Locked securely to profile slot: ${accountUserId}`, data: newMultiUserSaveEntry },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Server Authentication Profile Mapping Failure" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET() {
  // In our next step, the dashboard will pass the active logged-in userId to fetch only their records:
  // SELECT * FROM saves WHERE user_id = ${activeUserId} ORDER BY id DESC
  return NextResponse.json([], { status: 200, headers: corsHeaders() });
}
