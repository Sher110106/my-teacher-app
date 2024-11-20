import { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const origin = new URL(request.url).origin;

  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent("Invalid recovery link")}`
    );
  }

  const supabase = await createClient();
  
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  });

  if (error) {
    console.error("Verification error:", error.message);
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error.message)}`
    );
  }

  // Successful verification
  return NextResponse.redirect(`${origin}${next}`);
}