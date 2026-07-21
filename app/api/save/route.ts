async function getUserIdFromToken(token: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // ...
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });
    // ...
    const userData = await response.json();
    return userData.id || null;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
