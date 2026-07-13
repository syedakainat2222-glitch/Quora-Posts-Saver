import { NextResponse } from 'next/server';

// Global array memory buffer to hold temporary post streams
let cloudSavesDatabase: any[] = [];

export async function POST(request: Request) {
  try {
    const postData = await request.json();
    
    if (!postData.title || !postData.contentText) {
      return NextResponse.json({ error: "Missing required post contents." }, { status: 400 });
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
    return NextResponse.json({ success: true, data: newSaveEntry }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(cloudSavesDatabase, { status: 200 });
}
