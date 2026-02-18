import type { ReactNode } from "react";
import { ArrowBigRight } from "lucide-react";

import { Card, CardContent } from "./ui/card";

interface PreasidiumCtaCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export function GotoMoreCard({
  title = "Ontdek ons volledige praesidium",
  description = "Bekijk alle leden, rollen en verhalen van onze vereniging.",
  icon,
}: PreasidiumCtaCardProps) {
  return (
    <Card className="flex group relative h-full overflow-hidden border border-transparent text-white shadow-lg transition-all duration-300 hover:border-purple-400/30 hover:shadow-purple-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardContent className="relative flex h-full flex-col gap-6 p-[2rem] md:p-[3rem]">

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
          {description}
        </p>

        <div className=" inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80 transition-all group-hover:text-purple-100">
          Meer ontdekken
          <ArrowBigRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}
