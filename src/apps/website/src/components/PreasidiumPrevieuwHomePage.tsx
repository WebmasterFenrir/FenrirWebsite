import type { PreasidiumYear } from "../../../types"
import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import { PreasidiumYearsData } from "../../../data"

export default function PreasidiumPrevieuwHomePage()
{
    return (
        <div className="grid grid-cols-3 gap-4">
            <PreasidiumLidPrevieuw data={PreasidiumYearsData[0].PreasidiumLeden[0]}/>
            <PreasidiumLidPrevieuw data={PreasidiumYearsData[0].PreasidiumLeden[1]}/>
        </div>
    )
}