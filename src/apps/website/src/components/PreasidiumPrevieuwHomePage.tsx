import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import { PreasidiumYearsData } from "../../../data"
import { GotoMoreCard } from "./GotoMoreCard"

export default function PreasidiumPrevieuwHomePage()
{
    return (
        <div className="grid gap-8 md:grid-cols-3">
            <PreasidiumLidPrevieuw data={PreasidiumYearsData[0].PreasidiumLeden[0]}/>
            <PreasidiumLidPrevieuw data={PreasidiumYearsData[0].PreasidiumLeden[1]}/>
            <a href="/praesidium">
                <GotoMoreCard title="Ontdek ons volledige praesidium" description="Bekijk alle leden, rollen en verhalen van onze vereniging."/>
            </a>
        </div>
    )
}