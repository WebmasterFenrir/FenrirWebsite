import { Card, CardContent } from "@/components/ui/card";

interface SponSorInterface {
  data: {
    name: string;
    image: string;
    content: string[];
    url : string;
  };
  variant?: "default" | "reverse";
}

export default function SponsorComponent({ data,variant = "default" }: SponSorInterface) {
  const isReverse = variant !== "default";
  
  const words = data.name.split(" ");
  const mainName = words.length > 1 ? words.slice(0, -1).join(" ") : data.name;
  const lastName = words.length > 1 ? words[words.length - 1] : "";

  const partnerWords: string[] = [
  "Geweldige",
  "Uitstekende",
  "Fabuleuze",
  "Fantastische",
  "Prachtige",
  "Sublieme",
  "Magnifieke",
  "Adembenemende",
  "Indrukwekkende",
  "Uitzonderlijke",
  "Wonderbaarlijke"
];

  return (
    <a href={data.url} target="_null">
    <Card className="border border-transparent text-white shadow-lg transition-all duration-300 hover:border-purple-400/30 hover:shadow-purple-500/20 overflow-hidden mb-20">
      <CardContent className="p-0">
        <div className={`flex flex-col ${isReverse ? "md:flex-row-reverse" : "md:flex-row"} items-stretch`}>
          
          {/* IMAGE SECTION 
              Using arbitrary padding [padding:3rem] to bypass the --spacing variable 
              if your global CSS is acting up.
          */}
          <div className="w-full md:w-2/5 bg-white p-[3rem] md:p-[4rem] flex items-center justify-center min-h-[300px]">
            <img
              src={`/images/sponsors/${data.image}`}
              alt={`${data.name} logo`}
              /* Added h-auto and max-h to ensure the logo stays centered with 'even' air around it */
              className="w-full h-auto max-w-[200px] md:max-w-[260px] max-h-f object-contain"
            />
          </div>

          {/* TEXT SECTION 
              Matched the padding exactly to the image section for symmetry 
          */}
          <div className="flex-1 p-[2rem] md:p-[4rem] flex flex-col justify-center">
            <p className="text-yellow-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4">
              {partnerWords[Math.floor(Math.random() * partnerWords.length)]} partner
            </p>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              {mainName} <span className="text-purple-500">{lastName}</span>
            </h2>

            <div className="space-y-4">
              {data.content.map((paragraph, index) => (
                <p 
                  key={`${data.name}-${index}`} 
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
}