interface SpacerInterface {
    variant? : "default" | "halfed" | "double"
}

/** Vertical rhythm between sections — the layout wrapper owns horizontal
    spacing, this only adds breathing room (kept modest: the page should
    flow, not fall apart into disconnected blocks). */
export default function Spacer({variant} : SpacerInterface){
    if(variant == "halfed"){
        return (<div className="mb-8 md:mb-10"></div>)
    }
    if(variant == "double"){
        return (<div className="mb-20 md:mb-24"></div>)
    }
    return (<div className="mb-12 md:mb-16"></div>)
}