import {Button} from "@/components/ui/button";
import {ListTodo} from "lucide-react";
import {useUserStore} from "@/store/user";
import {ThemeToggle} from "@/components/shared/theme/theme-toggle";
import {toast} from "sonner";
import {useSessionStore} from "@/store/session";
import { Skeleton } from "@/components/ui/skeleton"

interface HeaderProps {
    onSelect: (id: string) => void;
    trigger?: React.ReactNode;
}

function DashboardHeader({ trigger }: HeaderProps) {
    const user = useUserStore(state => state.currentUser);
    const session = useSessionStore(state => state.currentSession);

    if (!user) return null;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur px-4 lg:px-6">
            {trigger}

            <div className="flex flex-col gap-1">
                <p className="font-medium text-xs text-muted-foreground shrink-0">
                    Powered by Kolomiiets Dmytro
                </p>
                {session ? (
                    <div className="flex max-w-full items-center gap-2">
                        <p className="font-medium max-w-[50px] md:max-w-full line-clamp-1 text-xs text-muted-foreground/50 shrink-0">
                            #{session?.id}
                        </p>
                        <p className="font-medium max-w-[50px] md:max-w-full line-clamp-1 text-xs text-muted-foreground/50 shrink-0">
                            {session?.started_at}
                        </p>
                        <p className="font-medium max-w-[100px] md:max-w-full line-clamp-1 text-xs text-muted-foreground/50 shrink-0">
                            {session?.warehouse.address}
                        </p>
                        <p className="font-medium max-w-[100px] md:max-w-full line-clamp-1 text-xs text-muted-foreground/50 shrink-0">
                            {session?.warehouse.title}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <Button onClick={() => toast.warning('The work is in progress')} variant="ghost" size="icon" className="relative">
                    <ListTodo size={18} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <ThemeToggle />
            </div>
        </header>
    );
}

export default DashboardHeader;