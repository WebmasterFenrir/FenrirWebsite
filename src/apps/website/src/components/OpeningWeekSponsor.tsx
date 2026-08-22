import { Card, CardContent } from "@/components/ui/card";
import type { OpeningWeekSponsor } from "@/../../types";

interface OpeningWeekSponsorInterface {
    data: OpeningWeekSponsor[];
    /** Eyebrow label, e.g. "Sponsor van de openingsweek". */
    label?: string;
}

export default function OpeningWeekSponsor({ data, label = "Sponsor van de openingsweek" }: OpeningWeekSponsorInterface) {
    if (!data.length) return null;

    return (
        <>
            {data.map((sponsor, i) => {
                const imageSrc = sponsor.image && sponsor.image.startsWith('http')
                    ? sponsor.image
                    : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>';

                const words = sponsor.name.split(" ");
                const mainName = words.length > 1 ? words.slice(0, -1).join(" ") : sponsor.name;
                const lastName = words.length > 1 ? words[words.length - 1] : "";

                return (
                    <a href={sponsor.url} target="_null" key={`${sponsor.name}-${i}`}>
                        <Card className="border border-accent/40 text-white shadow-lg shadow-accent/10 transition-all duration-300 hover:border-accent/70 hover:shadow-accent/30 overflow-hidden mb-20">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-stretch">
                                    <div className="w-full md:w-2/5 bg-white p-[3rem] md:p-[4rem] flex items-center justify-center min-h-[300px]">
                                        <img
                                            src={imageSrc}
                                            alt={`${sponsor.name} logo`}
                                            className="w-full h-auto max-w-[200px] md:max-w-[260px] max-h-f object-contain"
                                        />
                                    </div>

                                    <div className="flex-1 p-[2rem] md:p-[4rem] flex flex-col justify-center">
                                        <p className="text-accent text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4">
                                            {label}
                                        </p>

                                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                            {mainName} <span className="text-accent-foreground">{lastName}</span>
                                        </h2>

                                        <div className="space-y-4">
                                            {sponsor.content.map((paragraph, index) => (
                                                <p
                                                    key={`${sponsor.name}-${index}`}
                                                    className="text-zinc-400 text-sm md:text-base leading-relaxed"
                                                >
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                );
            })}
        </>
    );
}
