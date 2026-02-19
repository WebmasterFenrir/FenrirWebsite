import {type Sponsors} from "@/../../types"
import SponsorComponent from "./SponsorComponent"

interface SponsorListInterface{
    data : Sponsors[]
}
export default function SponsorList({data} : SponsorListInterface){
    return (
        <>
            {data[0].list.map((e, i) => <SponsorComponent data={e} key={i} variant={i % 2 == 0 ? "default" : "reverse"}></SponsorComponent>)}
        </>
    )
}   