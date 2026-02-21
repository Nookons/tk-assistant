"use client";

import React, { useState } from 'react';
import { useUserStore } from "@/store/user";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getScoreRank } from "@/components/shared/DashboardNew/DashboardComponents/Settings/getScoreRank";
import { isLeader } from "@/components/shared/DashboardNew/DashboardComponents/Settings/isLeader";
import Image from "next/image";
import {
    Building2, CalendarDays, Check, Eye, EyeOff,
    KeyRound, LaptopMinimalCheck, Loader2, Lock, Mail, MailPlus, Phone, Save, Shield, Star, User,
    UserCheck, UserRoundPen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/shared/DashboardNew/DashboardComponents/Settings/StatCard";
import { ScoreBar } from "@/components/shared/DashboardNew/DashboardComponents/Settings/ScoreBar";
import { InfoRow } from "@/components/shared/DashboardNew/DashboardComponents/Settings/InfoRow";
import { toast } from "sonner";
import {AuthService} from "@/services/authService";
import {IUser} from "@/types/user/user";
import {UserService} from "@/services/userService";

dayjs.extend(relativeTime);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            {children}
        </h2>
        <Separator className="mt-2 bg-border/30" />
    </div>
);

// ─── PasswordInput ────────────────────────────────────────────────────────────

const PasswordInput = ({
                           id,
                           label,
                           value,
                           onChange,
                           placeholder,
                       }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => {
    const [show, setShow] = useState(false);

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder ?? "••••••••"}
                    className="h-10 bg-muted/30 border-border/50 focus:border-primary/50 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
};

// ─── EmailChangeForm ──────────────────────────────────────────────────────────

const EmailChangeForm = ({ user }: { user: IUser}) => {
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !password) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (newEmail === user.email) {
            toast.error("New email is the same as current.");
            return;
        }

        setLoading(true);
        try {
            await AuthService.loginWithCard(user.card_id.toString(), password);
            await AuthService.updateEmail(newEmail)

            await new Promise((r) => setTimeout(r, 800)); // stub
            toast.success("Confirmation sent to new email.");
            setDone(true);
            setNewEmail("");
            setPassword("");
        } catch {
            toast.error("Failed to update email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className={`grid grid-cols-2 gap-4 w-full`}>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Current email
                    </Label>
                    <Input
                        value={user.email}
                        disabled
                        className="h-10 bg-muted/20 border-border/30 text-muted-foreground"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="new_email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        New email
                    </Label>
                    <Input
                        id="new_email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => { setNewEmail(e.target.value); setDone(false); }}
                        placeholder="new@example.com"
                        className="h-10 bg-muted/30 border-border/50 focus:border-primary/50"
                    />
                </div>
            </div>

            <div className={`grid grid-cols-[1fr_100px] gap-4 w-full items-center`}>
                <PasswordInput
                    id="email_password"
                    label="Confirm with password"
                    value={password}
                    onChange={(v) => { setPassword(v); setDone(false); }}
                />

                <Button type="submit" disabled={loading} className="gap-2 mt-5">
                    {loading ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
                    ) : done ? (
                        <><Check className="h-3.5 w-3.5" /> Check your inbox</>
                    ) : (
                        <div className={`flex items-center gap-2`}><MailPlus /> Save</div>
                    )}
                </Button>
            </div>
        </form>
    );
};

// ─── PasswordChangeForm ───────────────────────────────────────────────────────

const PasswordChangeForm = ({user}: {user: IUser}) => {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!current || !next || !confirm) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (next.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }
        if (next !== confirm) {
            toast.error("Passwords don't match.");
            return;
        }

        setLoading(true);
        try {
            await AuthService.loginWithCard(user.card_id.toString(), current);
            await AuthService.changePassword(next);


            await new Promise((r) => setTimeout(r, 800)); // stub
            toast.success("Password updated successfully.");
            setDone(true);
            setCurrent(""); setNext(""); setConfirm("");
        } catch {
            toast.error("Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Strength hint */}
            {next.length > 0 && (
                <div className="space-y-1">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                    next.length >= i * 3
                                        ? i <= 1 ? "bg-red-500"
                                            : i <= 2 ? "bg-amber-500"
                                                : i <= 3 ? "bg-yellow-400"
                                                    : "bg-emerald-500"
                                        : "bg-muted/50"
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">
                        {next.length < 4 ? "Too short" : next.length < 7 ? "Weak" : next.length < 10 ? "Good" : "Strong"}
                    </p>
                </div>
            )}

            <div className={`grid grid-cols-2 gap-4 w-full items-center`}>
                <PasswordInput
                    id="current_password"
                    label="Current password"
                    value={current}
                    onChange={(v) => { setCurrent(v); setDone(false); }}
                />
                <PasswordInput
                    id="new_password"
                    label="New password"
                    value={next}
                    onChange={(v) => { setNext(v); setDone(false); }}
                    placeholder="Min. 8 characters"
                />
            </div>

            <div className={`grid grid-cols-[1fr_100px] gap-4 w-full items-center`}>
                <PasswordInput
                    id="confirm_password"
                    label="Confirm new password"
                    value={confirm}
                    onChange={(v) => { setConfirm(v); setDone(false); }}
                />

                <Button type="submit" disabled={loading} className={`gap-2 mt-5 ${done && "bg-green-500"}`}>
                    {loading ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
                    ) : done ? (
                        <><Check className="h-3.5 w-3.5" /></>
                    ) : (
                        <div className={`flex items-center gap-2`}><Save /> Save</div>
                    )}
                </Button>
            </div>

        </form>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

const SettingsDisplay = () => {
    const [isNameChange, setIsNameChange] = useState<boolean>(false);
    const [input_value, setInput_value] = useState<string>('')
    const user = useUserStore((state) => state.currentUser);
    const user_update = useUserStore(state => state.updateUser)

    if (!user) return null;

    const rank = getScoreRank(user.score);
    const leader = isLeader(user.position);
    const memberSince = dayjs(user.created_at).format("MMM YYYY");
    const lastSeen = dayjs(user.last_login_at).fromNow();

    const handleNameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input_value.trim()) {
            toast.error("Name cannot be empty.");
            return;
        }

        if (input_value === user?.user_name) {
            toast.error("Name is the same as current.");
            return;
        }

        try {
            const updated = await UserService.updateUserName(user?.id.toString(), input_value);
            if (!updated) throw new Error();

            user_update({ user_name: updated.user_name });
            toast.success("Name updated successfully.");
        } catch {
            toast.error("Failed to update name.");
        } finally {
            setIsNameChange(false);
        }
    };

    return (
        <div>
            {/* ── Hero banner */}
            <div className="relative h-36 bg-gradient-to-br from-primary/15 via-primary/5 to-background border-b border-border/30 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="mx-auto px-4 pb-16">
                {/* Avatar row */}
                <div className="relative -mt-14 mb-4 flex items-end justify-between">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden bg-muted shadow-xl">
                            {user.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
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
                        <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>

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

                <div className={`grid grid-cols-2 gap-4 w-full`}>
                    <div>
                        {/* Name */}
                        <div className="mb-6">
                            {isNameChange
                            ?
                                <div className={`flex items-center gap-2`}>
                                    <Input
                                        onChange={(e) => setInput_value(e.target.value)}
                                        className={`max-w-[200px]`}
                                        value={input_value}
                                    />
                                    <Button size={`sm`} variant={`ghost`}  onClick={(e) => handleNameUpdate(e)}>
                                        <UserCheck />
                                    </Button>
                                </div>
                            :
                                <div className={`flex items-center gap-2`}>
                                    <Button
                                        size={`sm`}
                                        variant={`ghost`}
                                        onClick={() => {
                                            setIsNameChange(true)
                                            setInput_value(user.user_name)
                                        }}
                                    >
                                        <UserRoundPen />
                                    </Button>
                                    <h1 className="text-2xl font-bold tracking-tight">{user.user_name}</h1>
                                </div>
                            }
                            <p className="text-sm text-muted-foreground mt-1">
                                {user.warehouse} · Last seen {lastSeen}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                            <StatCard icon={Star}         label="Score"  value={user.score.toLocaleString()} accent />
                            <StatCard icon={CalendarDays} label="Member" value={memberSince} />
                        </div>

                        {/* Score progress */}
                        <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3.5 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                            Score progress
                        </span>
                                <span className={`ml-auto text-sm font-semibold ${rank.color}`}>
                            {user.score} pts
                        </span>
                            </div>
                            <ScoreBar score={user.score} />
                        </div>

                        {/* Info rows */}
                        <div className="rounded-xl border border-border/40 bg-card/60 px-4 divide-y divide-border/30 mb-8">
                            <InfoRow icon={Mail}         label="Email"        value={user.email} />
                            <InfoRow icon={Phone}        label="Phone"        value={String(user.phone)} />
                            <InfoRow icon={Building2}    label="Warehouse"    value={user.warehouse} />
                            <InfoRow icon={CalendarDays} label="Member since" value={dayjs(user.created_at).format("D MMMM YYYY")} />
                        </div>
                    </div>

                    {/* ── Account security */}
                    <section className="space-y-8">
                        {/* Email change */}
                        <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-4">
                            <SectionTitle>
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                Change email
                            </SectionTitle>
                            <EmailChangeForm user={user} />
                        </div>

                        {/* Password change */}
                        <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-4">
                            <SectionTitle>
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                Change password
                            </SectionTitle>
                            <PasswordChangeForm user={user} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SettingsDisplay;