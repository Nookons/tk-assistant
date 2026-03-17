"use client";

import React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user";
import {ThemeToggle} from "@/components/shared/theme/theme-toggle";

const PagesHeader = () => {
    const route = useRouter();
    const user = useUserStore(state => state.currentUser);

    return (
        <div className="sticky top-0 z-10 border-b border-border px-2 py-1 flex justify-between items-center gap-2
            bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10
            animate-gradient-x backdrop-blur">

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Button
                                variant={'ghost'}
                                onClick={() => route.back()}
                                className="text-foreground font-bold"
                            >
                                <BreadcrumbSeparator className="rotate-180 text-foreground font-bold" />
                                Back
                            </Button>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className={`flex items-center gap-2`}>
                <p className="text-xs text-muted-foreground">
                    {user?.user_name} {user?.warehouse}
                </p>
                <ThemeToggle />
            </div>
        </div>
    );
};

export default PagesHeader;