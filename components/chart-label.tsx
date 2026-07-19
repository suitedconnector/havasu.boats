// The nautical-chart eyebrow. Renders as e.g.
//   34°29'21"N  114°20'54"W  ·  LAKE HAVASU CITY  ·  BOAT RENTALS
// This is the signature element that makes each listing page feel like
// a chart entry, not a Yelp card. Only possible because we have real
// coord data on every Outscraper record.

function dms(dec: number, isLat: boolean): string {
  const hemi = isLat ? (dec >= 0 ? "N" : "S") : dec >= 0 ? "E" : "W";
  const a = Math.abs(dec);
  const d = Math.floor(a);
  const mFloat = (a - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}°${String(m).padStart(2, "0")}′${String(s).padStart(2, "0")}″${hemi}`;
}

type Props = {
  lat?: number | null;
  lng?: number | null;
  place?: string | null;
  category?: string | null;
};

export function ChartLabel({ lat, lng, place, category }: Props) {
  const coords =
    typeof lat === "number" && typeof lng === "number"
      ? `${dms(lat, true)}  ${dms(lng, false)}`
      : null;

  const parts = [coords, place, category].filter(Boolean);

  return (
    <div
      className="font-mono text-[11px] tracking-chart uppercase text-channel-500"
      aria-label="Location and category"
    >
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <span className="mx-2 text-channel-300" aria-hidden>
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
