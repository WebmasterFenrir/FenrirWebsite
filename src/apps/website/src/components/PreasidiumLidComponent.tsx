import type { PreasidiumLid } from "../../../types";
import { Card, CardContent } from "./ui/card";

interface PreasidiumLidPrevieuwinterface {
    data : PreasidiumLid
}

export default function PreasidiumLidPrevieuw({data} : PreasidiumLidPrevieuwinterface)
{
    return (
        <Card>
        <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
        />
        <CardContent>
            <h1>{data.firstName} - {data.lastName}</h1>
            <p>{data.preasidiumRols[0].role}</p>
        </CardContent>
        </Card>
    );
}