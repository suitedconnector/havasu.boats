import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getActiveListings } from "@/lib/listings";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { listingId, name, email, message } = await req.json();

    const listings = getActiveListings();
    const listing = listings.find((l) => l.id === listingId);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const to = listing.email || "tal@trezian.com";

    const result = await resend.emails.send({
      from: "noreply@havasu.boats",
      to: to,
      replyTo: email,
      subject: "New inquiry from havasu.boats",
      text: `Hi ${listing.name},\n\nCustomer: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (result.error) {
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}