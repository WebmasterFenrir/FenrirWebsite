import { Card, CardContent } from "@/components/ui/card";
import type { OpeningWeekSponsor } from "@/../../types";

interface OpeningWeekSponsorInterface {
    data: OpeningWeekSponsor[];
}

export default function OpeningWeekSponsor({ data }: OpeningWeekSponsorInterface) {
    if (!data.length) return null;

    return (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((sponsor, i) => {
                const imageSrc = sponsor.image && sponsor.image.startsWith('http')
                    ? sponsor.image
                    : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>';

                return (
                    <a href={sponsor.url} target="_null" key={`${sponsor.name}-${i}`}>
                        <Card className="border border-accent/40 bg-white text-white shadow-lg shadow-accent/10 transition-all duration-300 hover:border-accent/70 hover:shadow-accent/30 overflow-hidden">
                            <CardContent className="p-0 h-full">
                                <div className="flex items-center justify-center min-h-[220px] h-full p-[2.5rem]">
                                    <img
                                        src={imageSrc}
                                        alt={`${sponsor.name} logo`}
                                        className="w-full h-auto max-w-[200px] md:max-w-[240px] object-contain"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                );
            })}
        </div>
    );
}