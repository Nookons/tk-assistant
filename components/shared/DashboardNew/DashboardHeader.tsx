import {Button} from "@/components/ui/button";
import {Bell, ListTodo, Menu, Search, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useUserStore} from "@/store/user";
import {ThemeToggle} from "@/components/shared/theme/theme-toggle";
import {toast} from "sonner";

interface HeaderProps {
    onMenuToggle: () => void;
    sidebarOpen: boolean;
    onSelect: (id: string) => void;
}

function DashboardHeader({ onMenuToggle, sidebarOpen, onSelect}: HeaderProps) {
    const user = useUserStore(state => state.currentUser);
    if (!user) return null;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur px-4 lg:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={onMenuToggle}
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            <p className="font-medium text-xs text-muted-foreground shrink-0">
                Powered by Kolomiiets Dmytro
            </p>

            <div className="flex items-center gap-2 ml-auto">
                <Button onClick={() => {toast.warning('The work is in progress')}} variant="ghost" size="icon" className="relative">
                    <ListTodo size={18} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <ThemeToggle />
                <Button onClick={() => onSelect('settings')} className={`p-0`} variant={`ghost`}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">{user.user_name?.toUpperCase().slice(0,2)}</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
        </header>
    );
}

export default DashboardHeader;