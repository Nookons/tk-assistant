"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    CalendarDays,
    ListTodo,
    Mail,
    Phone,
    Building2,
    Send,
    Star,
} from "lucide-react";
import { IUser } from "@/types/user/user";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserByAuthId } from "@/futures/user/getUser";
import { ScoreBar } from "@/components/shared/DashboardNew/DashboardComponents/Settings/ScoreBar";
import { InfoRow } from "@/components/shared/DashboardNew/DashboardComponents/Settings/InfoRow";
import { StatCard } from "@/components/shared/DashboardNew/DashboardComponents/Settings/StatCard";
import { getScoreRank } from "@/components/shared/DashboardNew/DashboardComponents/Settings/getScoreRank";
import { isLeader } from "@/components/shared/DashboardNew/DashboardComponents/Settings/isLeader";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import PagesHeader from "@/components/shared/PagesHeader";
import UserHistory from "@/components/shared/DashboardNew/DashboardComponents/User/UserHistory";
import UserAvatar from "@/components/shared/User/UserAvatar";

dayjs.extend(relativeTime);

const UserProfilePage = ({ isOwn = false }: { isOwn: boolean }) => {
    const params = useParams();
    const auth_id = params.id || "";

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["user", auth_id],
        queryFn: async () => getUserByAuthId(auth_id.toString()),
        enabled: !!auth_id,
    });

    if (!user) return null;

    const rank = getScoreRank(user.score);
    const leader = isLeader(user.position);
    const memberSince = dayjs(user.created_at).format("MMM YYYY");
    const lastSeen = dayjs(user.last_login_at).fromNow();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <PagesHeader />

            <div className="grid md:grid-cols-[minmax(340px,_5fr)_7fr] flex-1 overflow-hidden mt-2 gap-0">
                <div className="overflow-y-auto h-full px-4 pb-10 border-r border-border/30">

                    <div className="relative  mb-4 flex items-end justify-between">
                        <div className="relative flex gap-2 items-end">
                            <div className="w-34 h-34 z-50 rounded-2xl border-4 border-background overflow-hidden bg-muted shadow-xl">
                                <UserAvatar
                                    user={user}
                                    isEdit={isOwn}
                                    allowFullscreen
                                />
                            </div>

                            <div className="mb-2">
                                <h1 className="text-2xl font-bold tracking-tight">{user.user_name}</h1>
                                <div className={`flex `}>
                                    {/*<span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />*/}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {user.warehouse} · Last seen {lastSeen}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ButtonGroup>
                            <Button variant="ghost">
                                <Send /> Message
                            </Button>
                            <Button variant="ghost">
                                <ListTodo /> Add task
                            </Button>
                        </ButtonGroup>
                    </div>



                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                        <StatCard icon={Star} label="Score" value={user.score.toLocaleString()} accent />
                        <StatCard icon={CalendarDays} label="Member" value={memberSince} />
                    </div>

                    <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3.5 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                                Score progress
                            </span>
                        </div>
                        <ScoreBar score={user.score} />
                    </div>

                    <div className="rounded-xl border border-border/40 bg-card/60 px-4 divide-y divide-border/30">
                        <InfoRow icon={Mail} label="Email" value={user.email} />
                        <InfoRow icon={Phone} label="Phone" value={String(user.phone)} />
                        <InfoRow icon={Building2} label="Warehouse" value={user.warehouse} />
                        <InfoRow
                            icon={CalendarDays}
                            label="Member since"
                            value={dayjs(user.created_at).format("D MMMM YYYY")}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto h-full p-4">
                    <UserHistory user={user} />
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;