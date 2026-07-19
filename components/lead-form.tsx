"use client";

import { useState } from "react";

type Props = {
  listingName: string;
  listingSlug: string;
};

/**
 * Lead capture form. At launch this doesn't post anywhere yet — it's the UI
 * seam. Wire it to Resend (already the pattern from haulagua) when you're
 * ready to route inquiries. Featured/paying listings will get inquiries
 * forwarded to them; basic listings collect for you as sales ammunition.
 */
export function LeadForm({ listingName, listingSlug }: Props) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST to /api/leads once the endpoint is wired.
    // For now, log and simulate success. This lets you deploy the site
    // and validate the UX before backend work.
    const form = new FormData(e.currentTarget);
    console.log("Lead:", {
      listingSlug,
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      dates: form.get("dates"),
      message: form.get("message"),
    });
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-sm border border-channel-500 bg-channel-100 p-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-chart text-channel-700">
          Request received
        </div>
        <p className="mt-2 text-channel-900">
          Thanks — we&rsquo;ll pass this along to {listingName}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="font-mono text-[11px] uppercase tracking-chart text-channel-700">
        Request availability
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field name="name" label="Your name" required />
        <Field name="phone" label="Phone" type="tel" />
        <Field name="email" label="Email" type="email" required />
        <Field name="dates" label="Dates" placeholder="e.g. Jul 25-27" />
      </div>
      <label className="block">
        <span className="text-sm font-medium text-channel-900">
          What are you looking for?
        </span>
        <textarea
          name="message"
          rows={3}
          className="mt-1 w-full rounded-sm border border-channel-900/20 bg-paper px-3 py-2 text-sm focus:border-channel-500 focus:outline-none"
          placeholder="Group size, boat type, questions…"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-sm bg-channel-700 px-4 py-3 font-semibold text-paper transition hover:bg-channel-900"
      >
        Send request
      </button>
      <p className="text-center text-xs text-channel-500">
        No account needed — we&rsquo;ll forward this to the business directly.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-channel-900">
        {label}
        {required && <span className="text-rock">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-channel-900/20 bg-paper px-3 py-2 text-sm focus:border-channel-500 focus:outline-none"
      />
    </label>
  );
}
