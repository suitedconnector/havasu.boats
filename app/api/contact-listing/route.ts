import { NextRequest, NextResponse } from "next/server";
import { getActiveListings } from "@/lib/listings";

const FALLBACK_EMAIL = "tal@trezian.com";

export async function POST(req: NextRequest) {
  try {
    const { listingId, name, email, message } = await req.json();

    if (!listingId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listings = getActiveListings();
    const listing = listings.find((l) => l.id === listingId);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Use business email or fallback
    const businessEmail = listing.email || FALLBACK_EMAIL;
    if (!listing.email) {
      console.log(`[Contact Form] Listing "${listing.name}" missing email, routing to fallback: ${FALLBACK_EMAIL}`);
    }

    // Prepare subject line
    const subjectPrefix = !listing.email ? "[No email on file] " : "";
    const subject = `${subjectPrefix}New inquiry about ${listing.name} from havasu.boats`;

    // Forward to Formspree
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("business", listing.name);
    formData.append("business_email", businessEmail);
    formData.append("_subject", subject);
    formData.append("_replyto", email);

    const response = await fetch("https://formspree.io/f/xgawayjq", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`[Contact Form] Failed to send for listing "${listing.name}":`, response.status);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact Form] Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
