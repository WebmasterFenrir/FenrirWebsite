import { type Sponsors } from "@/../../types";

interface SponsorImageGridProps {
  data: Sponsors[];
}

export default function SponsorImageGrid({ data }: SponsorImageGridProps) {
  if (!data.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-center justify-items-center">
      {data[0].list.map((sponsor, i) => {
        const imageSrc =
          sponsor.image && sponsor.image.startsWith("http")
            ? sponsor.image
            : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>';

        return (
          <a
            key={i}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 bg-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/30 border border-transparent w-full aspect-[3/2]"
          >
            <img
              src={imageSrc}
              alt={`${sponsor.name} logo`}
              className="max-w-full max-h-full object-contain"
            />
          </a>
        );
      })}
    </div>
  );
}
