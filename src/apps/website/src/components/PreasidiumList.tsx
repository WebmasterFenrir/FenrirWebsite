import React from "react"
import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import type { PreasidiumYear } from "../../../types"
import Spacer from "./ui/spacer"

interface PreasidiumListProps {
    data: PreasidiumYear[]
    noDescriptionText?: string
    detailedInfoTemplate?: string
}

export default function PreasidiumList({ data, noDescriptionText, detailedInfoTemplate }: PreasidiumListProps)
{
    return (
        <>
            {data.map((e) =>
                <React.Fragment key={e.id}>
                    <h2 className="text-6xl sm:text-6xl lg:text-7xl text-accent-foreground font-bold mb-8">{e.startDate} <span className="text-white">-</span> <span className="text-accent">{e.endDate}</span></h2>
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 w-full">
                        {e.PreasidiumLeden.map((ee, j) => <PreasidiumLidPrevieuw key={j} data={ee} noDescriptionText={noDescriptionText} detailedInfoTemplate={detailedInfoTemplate}/>)}
                    </div>
                <Spacer variant="halfed"/>
                </React.Fragment>
            )}
        </>
    )
}
