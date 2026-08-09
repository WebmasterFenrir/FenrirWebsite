import PreasidiumLidPrevieuw from "./PreasidiumLidComponent"
import type { PreasidiumLid } from "../../../types"
import { GotoMoreCard } from "./GotoMoreCard"

interface PreasidiumPrevieuwHomePageProps {
    leden: PreasidiumLid[]
    ctaHref?: string
    ctaTitle?: string
    ctaDescription?: string
    moreText?: string
    noDescriptionText?: string
    detailedInfoTemplate?: string
}

export default function PreasidiumPrevieuwHomePage({
    leden,
    ctaHref = "/praesidium",
    ctaTitle = "Ontdek ons volledige praesidium",
    ctaDescription = "Bekijk alle leden, rollen en verhalen van onze vereniging.",
    moreText = "Meer ontdekken",
    noDescriptionText,
    detailedInfoTemplate,
}: PreasidiumPrevieuwHomePageProps)
{
    return (
        <div className="grid gap-8 md:grid-cols-3">
            {leden[0] && <PreasidiumLidPrevieuw data={leden[0]} noDescriptionText={noDescriptionText} detailedInfoTemplate={detailedInfoTemplate}/>}
            {leden[1] && <PreasidiumLidPrevieuw data={leden[1]} noDescriptionText={noDescriptionText} detailedInfoTemplate={detailedInfoTemplate}/> }
            <a href={ctaHref}>
                <GotoMoreCard title={ctaTitle} description={ctaDescription} moreText={moreText}/>
            </a>
        </div>
    )
}
