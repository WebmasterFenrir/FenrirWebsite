export default function SponsorData(){
return (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
  {[
    { a: "Bereik & zichtbaarheid", w: "Website, socials, vermelding op events", i: "Meer merkherkenning" },
    { a: "Talent & instroom", w: "Intro naar leden, stage- en jobposts", i: "Snellere rekrutering" },
    { a: "Lokale verankering", w: "Samenwerking met Antwerpse club", i: "Community-waarde" },
    { a: "Activering op events", w: "Sampling, promo of stand opties", i: "Directe interactie" },
    { a: "Flexibele formules", w: "Financieel of in natura, kort of jaar", i: "Efficiënte ROI" },
    { a: "Content & storytelling", w: "Gezamenlijke posts en cases", i: "Relevante brand stories" },
  ].map((item, index) => (
    <div 
      key={index} 
      className="group bg-card border-zinc-800 rounded-xl p-6 transition-all duration-300 shadow-lg"
    >
      {/* Header with Yellow Label */}
      <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
        {item.i}
      </p>
      
      {/* Main Aspect */}
      <h4 className="text-white font-bold text-lg mb-3 group-hover:text-purple-400 transition-colors">
        {item.a}
      </h4>
      
      {/* Details Section */}
      <div className="pt-2 border-t border-zinc-800/60">
        <p className="text-zinc-400 text-sm leading-relaxed">
          {item.w}
        </p>
      </div>
    </div>
  ))}
</div>
)
}