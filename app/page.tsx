import Image from "next/image";
import {Label} from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-screen items-center justify-start flex flex-col gap-4 bg-zinc-50 font-sans dark:bg-black">
        <Label>TK SERVICE</Label>
        <div>
            <Image alt={`background`} src={`/img/back.jpg`} width={1000} height={1000} />
        </div>
    </div>
  );
}
