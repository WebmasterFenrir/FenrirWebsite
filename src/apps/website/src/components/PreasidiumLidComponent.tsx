import type { PreasidiumLid } from "../../../types";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface PreasidiumLidPrevieuwinterface {
  data: PreasidiumLid;
  noDescriptionText?: string;
  detailedInfoTemplate?: string;
}

export default function PreasidiumLidPrevieuw({ data, noDescriptionText = "No description provided.", detailedInfoTemplate = "Detailed information about {name}" }: PreasidiumLidPrevieuwinterface) {
  const roleLabels = data.preasidiumRols.map(r => r.role);
  const roleYear = data.preasidiumRols[0]?.year;
  // Images are served from PocketBase (full URL) or fall back to a placeholder avatar
  const imageSrc = data.imageUrl && data.imageUrl.startsWith('http')
    ? data.imageUrl
    : `https://avatar.vercel.sh/${data.firstName}`;

  return (
  <Dialog>
    <DialogTrigger asChild>
    <Card className="group relative h-full overflow-hidden border border-transparent text-white shadow-lg transition-all duration-300 hover:border-purple-400/30 hover:shadow-purple-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <img
          src={imageSrc}
          alt={`${data.firstName} ${data.lastName}`}
          className="aspect-square w-full rounded-t-xl object-cover"
        />
      </div>
      <CardContent className="relative space-y-5 pb-[2rem] md:pb-[2rem]">
        <div className="space-y-1">
          {roleLabels.map((label, i) => (
            <p key={i} className="text-yellow-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">
              {label}
            </p>
          ))}
        </div>
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
  </DialogTrigger>

  <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-card border border-zinc-800 shadow-2xl transition-all duration-300 hover:border-purple-400/30">
  <div className="flex flex-col md:flex-row items-stretch">
    
{/* LEFT/TOP SECTION: Uniform Square Image */}
<div className="w-full md:w-2/5 md:flex-none bg-zinc-900 overflow-hidden aspect-square md:aspect-square">
  <img
    src={imageSrc}
    alt={`${data.firstName} ${data.lastName}`}
    className="w-full h-full object-cover"
  />
</div>

    {/* RIGHT SECTION: Content */}
    <div className="flex-1 p-[2rem] md:p-[3rem] flex flex-col justify-center">
      <DialogHeader className="text-left">
        {/* Role Labels with Yellow Accent — show every function the member holds */}
        <div className="space-y-1 mb-4">
          {roleLabels.map((label, i) => (
            <p key={i} className="text-yellow-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">
              {label}
            </p>
          ))}
        </div>
        
        {/* Name with Purple Split */}
        <DialogTitle className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          {data.firstName} <span className="text-purple-500">{data.lastName}</span>
        </DialogTitle>
        
        <DialogDescription className="sr-only">
          {detailedInfoTemplate.replace("{name}", data.firstName)}
        </DialogDescription>
      </DialogHeader>

      {/* Bio / Description Section */}
      <div className="space-y-4">
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          {data.description || noDescriptionText}
        </p>
        
        {/* <div className="pt-4 border-t border-zinc-800/50">
          <p className="text-zinc-500 text-xs uppercase tracking-widest">
            Member Since: {data.birthdate}
          </p>
        </div> */}
      </div>
    </div>

  </div>
</DialogContent>
</Dialog>
  );
}
