"use client";

import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    Award,
    Building2,
    CalendarDays,
    Mail,
    Phone,
    Shield,
    Star,
    User,
    Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {IUser} from "@/types/user/user";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {getUserByAuthId} from "@/futures/user/getUser";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {ScoreBar} from "@/components/shared/DashboardNew/DashboardComponents/Settings/ScoreBar";
import {InfoRow} from "@/components/shared/DashboardNew/DashboardComponents/Settings/InfoRow";
import {StatCard} from "@/components/shared/DashboardNew/DashboardComponents/Settings/StatCard";
import {getScoreRank} from "@/components/shared/DashboardNew/DashboardComponents/Settings/getScoreRank";
import {isLeader} from "@/components/shared/DashboardNew/DashboardComponents/Settings/isLeader";

dayjs.extend(relativeTime);

const UserProfilePage = ({isOwn = false} : {isOwn: boolean}) => {
    const params = useParams();
    const auth_id = params.id || ''

    const {data: user, isLoading, isError} = useQuery({
        queryKey: ['user', auth_id],
        queryFn: async () => getUserByAuthId(auth_id.toString()),
        enabled: !!auth_id,
    })

    if (!user) return null;

    const rank = getScoreRank(user.score);
    const leader = isLeader(user.position);
    const memberSince = dayjs(user.created_at).format("MMM YYYY");
    const lastSeen = dayjs(user.last_login_at).fromNow();

    return (
        <div className="">
            {/* ── Top bar ── */}
            <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur px-6 py-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbSeparator className={`rotate-180 text-foreground font-bold`}/>
                        <BreadcrumbItem>
                            <BreadcrumbLink>
                                <Link className={`text-foreground font-bold`} href={`/dashboard/${user?.auth_id || ""}`}>Back</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* ── Hero banner */}
            <div className="relative h-36 bg-gradient-to-br from-primary/15 via-primary/5 to-background border-b border-border/30 overflow-hidden">
                {/* Decorative grid */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
                {/* Glow */}
                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* ── Profile content */}
            <div className="max-w-3xl mx-auto px-4 pb-16">
                {/* Avatar — overlaps banner */}
                <div className="relative -mt-14 mb-4 flex items-end justify-between">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden bg-muted shadow-xl">
                            {user.avatar_url ? (
                                <Image
                                    src={user.avatar_url || ""}
                                    alt={user.user_name}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="h-10 w-10 text-muted-foreground/40" />
                                </div>
                            )}
                        </div>
                        {/* Online indicator */}
                        <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>

                    {/* Role badge */}
                    <Badge
                        variant={leader ? "default" : "secondary"}
                        className={`mb-2 gap-1.5 px-3 py-1.5 text-xs font-medium ${
                            leader ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : ""
                        }`}
                    >
                        {leader ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {user.position}
                    </Badge>
                </div>

                {/* Name + meta */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">{user.user_name}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {user.warehouse} · Last seen {lastSeen}
                    </p>
                </div>

                {/* ── Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                    <StatCard icon={Star}        label="Score"    value={user.score.toLocaleString()} accent />
                    <StatCard icon={CalendarDays} label="Member"   value={memberSince} />
                </div>

                {/* ── Score progress */}
                <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3.5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                            Score progress
                        </span>
                    </div>
                    <ScoreBar score={user.score} />
                </div>

                {/* ── Info */}
                <div className="rounded-xl border border-border/40 bg-card/60 px-4 divide-y divide-border/30">
                    <InfoRow icon={Mail}      label="Email"     value={user.email} />
                    <InfoRow icon={Phone}     label="Phone"     value={String(user.phone)} />
                    <InfoRow icon={Building2} label="Warehouse" value={user.warehouse} />
                    <InfoRow icon={CalendarDays} label="Member since" value={dayjs(user.created_at).format("D MMMM YYYY")} />
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;