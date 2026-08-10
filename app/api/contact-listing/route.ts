import { NextRequest, NextResponse } from "next/server";
import { getListingBySlug, getActiveListings } from "@/lib/listings";

export async function POST(req: NextRequest) {
  try {
    const { listingSlug, name, email, message } = await req.json();

    if (!listingSlug || !name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listing = getListingBySlug(listingSlug);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Forward to Formspree
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("business", listing.name);
    formData.append("business_email", listing.email || "");
    formData.append("_subject", `New inquiry about ${listing.name} from havasu.boats`);
    formData.append("_replyto", listing.email || email);

    const response = await fetch("https://formspree.io/f/xgawayjq", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
