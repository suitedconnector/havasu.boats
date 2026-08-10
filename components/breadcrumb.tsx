import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: items.map((item, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              name: item.label,
              ...(item.href && { item: item.href }),
            })),
          }),
        }}
      />
      <nav
        className="text-sm text-channel-500 font-mono"
        aria-label="Breadcrumb"
      >
        {items.map((item, idx) => (
          <span key={idx}>
            {item.href ? (
              <Link href={item.href} className="hover:text-rock">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-channel-300">/</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
