import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/session";
import { getUserById } from "@/lib/store";

// Tells the client whether anyone is signed in, and who. The navbar is a
// client component (the home page holds cart state), so it cannot read the
// cookie during a server render — this is the smallest way to give it the
// session without moving the whole page to the server.

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ signedIn: false });

  const user = await getUserById(userId);
  if (!user) return NextResponse.json({ signedIn: false });

  return NextResponse.json({
    signedIn: true,
    name: user.name,
    email: user.email,
    picture: user.picture ?? null,
  });
}
