import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import type { PreasidiumYear } from "../../../types"
import Spacer from "./ui/spacer"

export default function PreasidiumPrevieuwHomePage({ data }: { data: PreasidiumYear[] })
{
    return (
        <>
            {data.map((e, i) =>
                <>
                    {<h2 className="text-6xl sm:text-6xl lg:text-7xl text-accent-foreground font-bold mb-8">{e.startDate} <span className="text-white">-</span> <span className="text-accent">{e.endDate}</span></h2>}
                    <div key={i} className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 w-full">
                        {e.PreasidiumLeden.map((ee, j) => <PreasidiumLidPrevieuw key={j} data={ee}/>)}
                    </div>
                <Spacer variant="halfed"/>
                </>
            )}
        </>
    )
}