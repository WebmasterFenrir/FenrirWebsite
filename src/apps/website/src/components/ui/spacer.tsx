interface SpacerInterface {
    variant? : "default" | "halfed" | "dubble"
}

export default function Spacer({variant} : SpacerInterface){
    if(variant == "halfed"){
        return (<div className="mb-10 md:mb-15"></div>)
    }
    if(variant == "dubble"){
        return (<div className="mb-40 md:mb-60"></div>)
    }
    return (<div className="mb-20 md:mb-30"></div>)
}