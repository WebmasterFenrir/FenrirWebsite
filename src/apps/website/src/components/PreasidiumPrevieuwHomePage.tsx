import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import type { PreasidiumLid } from "../../../types"
import { GotoMoreCard } from "./GotoMoreCard"

export default function PreasidiumPrevieuwHomePage({ leden }: { leden: PreasidiumLid[] })
{
    return (
        <div className="grid gap-8 md:grid-cols-3">
            {leden[0] && <PreasidiumLidPrevieuw data={leden[0]}/>}
            {leden[1] && <PreasidiumLidPrevieuw data={leden[1]}/> }
            <a href="/preasidium">
                <GotoMoreCard title="Ontdek ons voledige praesidium" description="Bekijk alle leden, rollen en verhalen van onze vereniging."/>
            </a>
        </div>
    )
}