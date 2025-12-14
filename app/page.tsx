import Image from "next/image";
import {Label} from "@/components/ui/label";

export default function Home() {
    return (
        <div className="">
            <Image className={`p-0`} alt={`background`} src={`/img/welcome.png`} width={1920} height={0}/>
        </div>
    );
}
