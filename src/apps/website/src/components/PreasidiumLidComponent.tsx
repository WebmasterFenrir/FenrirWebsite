import type { PreasidiumLid } from "../../../types";
import { Card, CardContent } from "./ui/card";

interface PreasidiumLidPrevieuwinterface {
  data: PreasidiumLid;
}

export default function PreasidiumLidPrevieuw({ data }: PreasidiumLidPrevieuwinterface) {
  const primaryRole = data.preasidiumRols[0];
  const roleLabel = primaryRole.role;
  const roleYear = primaryRole.year;

  return (
    <Card className="group relative h-full overflow-hidden border border-transparent text-white shadow-lg transition-all duration-300 hover:border-purple-400/30 hover:shadow-purple-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <img
          src="https://avatar.vercel.sh/shadcn1"
          alt={`${data.firstName} ${data.lastName}`}
          className="aspect-[4/3] w-full rounded-t-xl object-cover"
        />
      </div>
      <CardContent className="relative space-y-5 pb-[2rem] md:pb-[2rem]">
        <p className="text-yellow-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">
          {roleLabel}
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {data.firstName} <span className="text-purple-400">{data.lastName}</span>
        </h2>
        {roleYear && (
          <p className="text-zinc-400 text-xs md:text-sm uppercase tracking-[0.2em]">
            {roleYear}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
