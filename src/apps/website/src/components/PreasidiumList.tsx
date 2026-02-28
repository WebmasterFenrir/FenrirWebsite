import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import { PreasidiumYearsData } from "../../../data"
import Spacer from "./ui/spacer"

export default function PreasidiumPrevieuwHomePage()
{
    return (
        <>
            {PreasidiumYearsData.map((e, i) => 
                <>
                    <Spacer/>
                    {<h2>{e.startDate}</h2>}
                    <div key={i} className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 w-full">
                        {e.PreasidiumLeden.map((ee, j) => <PreasidiumLidPrevieuw key={j} data={ee}/>)}
                    </div>
                </>
            )}
        </>
    )
}