import Image from "next/image";
import {Label} from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-screen items-center justify-start flex flex-col gap-4 bg-zinc-50 font-sans dark:bg-black">
        <div className={`bg-white rounded-2xl`}>
            <Image alt={`background`} src={`/img/logo.png`} width={500} height={500} />
        </div>
    </div>
  );
}
