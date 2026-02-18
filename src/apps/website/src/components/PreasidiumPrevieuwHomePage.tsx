import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import { PreasidiumYearsData } from "../../../data"
import { GotoMoreCard } from "./GotoMoreCard"

export default function PreasidiumPrevieuwHomePage()
{
    return (
        <div className="grid gap-8 md:grid-cols-3">
            <PreasidiumLidPrevieuw data={PreasidiumYearsData[0].PreasidiumLeden[0]}/>
            <PreasidiumLidPrevieuw data={PreasidiumYearsData[0].PreasidiumLeden[1]}/>
            <GotoMoreCard />
        </div>
    )
}