import { NextResponse } from 'next/server';

// Global array memory buffer
let cloudSavesDatabase: any[] = [];

// Helper to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

    const newSaveEntry = {
      id: Date.now(),
      title: postData.title,
      author: postData.author || "Unknown Author",
      content: postData.contentText,
      url: postData.url || "",
      tag: postData.tag || "General",
      type: postData.type || "Post",
      date: new Date().toLocaleDateString()
    };

    cloudSavesDatabase.unshift(newSaveEntry);
    return NextResponse.json(
      { success: true, data: newSaveEntry },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    cloudSavesDatabase,
    { status: 200, headers: corsHeaders() }
  );
}
