import { NextResponse } from 'next/server';

// Temporary global array to store cloud data in memory for testing
// Note: When you deploy to production, you will connect this to Supabase/Firebase!
let cloudSavesDatabase = [];

export async function POST(request) {
  try {
    const postData = await request.json();
    
    // Validate that the request contains the necessary fields
    if (!postData.title || !postData.content) {
      return NextResponse.json({ error: "Missing required post data elements." }, { status: 400 });
    }

    // Add unique server metadata to the incoming save structure
    const newSaveEntry = {
      id: Date.now(),
      title: postData.title,
      author: postData.author || "Unknown",
      content: postData.content,
      url: postData.url || "",
      tag: postData.tag || "General",
      type: postData.type || "Post",
      date: new Date().toLocaleDateString()
    };

    // Save item to our cloud database array context
    cloudSavesDatabase.unshift(newSaveEntry);

    return NextResponse.json({ 
      success: true, 
      message: "Post successfully saved to Q-Saver Cloud!", 
      data: newSaveEntry 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Server Error: Unable to process save request." }, { status: 500 });
  }
}

// GET endpoint so your frontend dashboard can load the list of saved posts
export async function GET() {
  return NextResponse.json(cloudSavesDatabase, { status: 200 });
}
