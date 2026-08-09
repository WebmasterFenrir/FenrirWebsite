import {type Sponsors} from "@/../../types"
import SponsorComponent from "./SponsorComponent"

interface SponsorListInterface{
    data : Sponsors[]
    partnerLabel?: string;
    partnerAdjectives?: string[];
}
export default function SponsorList({data, partnerLabel, partnerAdjectives} : SponsorListInterface){
    if (!data.length) return null
    return (
        <>
            {data[0].list.map((e, i) => <SponsorComponent data={e} key={i} variant={i % 2 == 0 ? "default" : "reverse"} partnerLabel={partnerLabel} partnerAdjectives={partnerAdjectives}></SponsorComponent>)}
        </>
    )
}
