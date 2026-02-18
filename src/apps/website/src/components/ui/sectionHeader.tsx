interface SectionHeaderProps {
  title: string;       // e.g., "Onze Sponsors"
  description: string; // The supporting text
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  const words = title.split(" ");
  const hasMultipleWords = words.length > 1;
  
  // Logic to highlight the last word
  const mainTitle = hasMultipleWords ? words.slice(0, -1).join(" ") : title;
  const highlightWord = hasMultipleWords ? words[words.length - 1] : "";

  return (
    <header className="mb-10 md:mb-20 px-4 md:px-0">
      
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-12">
        <div className="flex-1">
          
          {/* Dynamic Title - Scaled down for mobile (text-3xl) vs desktop (text-7xl) */}
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight md:tracking-tighter leading-tight ">
            {mainTitle}{" "}
            {hasMultipleWords && (
              <span className="text-accent-foreground">
                {highlightWord}
              </span>
            )}
          </h2>
        </div>
        
        {/* Description - Removed the border on mobile to save horizontal space */}
        <div className="w-1/2">
          <p className="text-zinc-400 text-sm md:text-lg leading-relaxed border-l-2 md:border-zinc-800 pl-4 md:pl-6 py-1">
            {description}
          </p>
        </div>
      </div>
      
      {/* Bottom Separator Line - Faded on mobile so it's not too harsh */}
      <div className="h-px w-full from-zinc-800/60 via-zinc-800/20 to-transparent md:bg-zinc-800/40 mt-10 md:mt-16"></div>
    </header>
  );
}