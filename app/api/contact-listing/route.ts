import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getActiveListings } from "@/lib/listings";

const FALLBACK_EMAIL = "tal@trezian.com";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    console.log("RESEND_API_KEY exists?", !!process.env.RESEND_API_KEY);
    console.log("RESEND_API_KEY starts with re_?", process.env.RESEND_API_KEY?.startsWith("re_"));

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { listingId, name, email, message } = body as {
      listingId?: string;
      name?: string;
      email?: string;
      message?: string;
    };

    if (!listingId || !name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listings = getActiveListings();
    const listing = listings.find((l) => l.id === listingId);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[Contact Form] RESEND_API_KEY is missing");
      return NextResponse.json({ error: "Email service unavailable" }, { status: 500 });
    }

    const to = listing.email || FALLBACK_EMAIL;

    const result = await resend.emails.send({
      from: "noreply@havasu.boats",
      to,
      replyTo: email,
      subject: "New inquiry from havasu.boats",
      text: `Hi ${listing.name},

A potential customer just found your listing on havasu.boats and wants to get in touch.

Customer Details:
Name: ${name}
Email: ${email}

Their Message:
"${message}"

---

Reply directly to ${email} to respond to this inquiry. They're interested and waiting to hear from you.

This lead came from havasu.boats — the Lake Havasu boat rental directory.

Best,
havasu.boats Team
https://havasu.boats`,
    });

    if (result.error) {
      console.error("[Contact Form] Resend error:", result.error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact Form] Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}