import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bot, Wifi } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">

            <style>{`
                @keyframes scanline {
                    0%   { transform: translateY(-100%); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                @keyframes floatA {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
                    33%      { transform: translate(18px, -24px) scale(1.1); opacity: 0.7; }
                    66%      { transform: translate(-12px, 16px) scale(0.95); opacity: 0.3; }
                }
                @keyframes floatB {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                    40%      { transform: translate(-20px, 20px) scale(1.08); opacity: 0.6; }
                    70%      { transform: translate(14px, -10px) scale(0.92); opacity: 0.2; }
                }
                @keyframes floatC {
                    0%, 100% { transform: translate(0, 0); opacity: 0.25; }
                    50%      { transform: translate(10px, -30px); opacity: 0.5; }
                }
                @keyframes gridPulse {
                    0%, 100% { opacity: 0.025; }
                    50%      { opacity: 0.045; }
                }
                @keyframes glitch {
                    0%, 95%, 100% { clip-path: none; transform: none; }
                    96%  { clip-path: inset(30% 0 40% 0); transform: translateX(-4px); }
                    97%  { clip-path: inset(60% 0 10% 0); transform: translateX(4px); }
                    98%  { clip-path: inset(10% 0 70% 0); transform: translateX(-2px); }
                    99%  { clip-path: none; transform: translateX(1px); }
                }
            `}</style>

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    animation: 'gridPulse 4s ease-in-out infinite',
                }}
            />

            <div
                className="pointer-events-none absolute inset-x-0 h-[2px] z-10"
                style={{
                    background: 'linear-gradient(90deg, transparent, hsl(var(--destructive)/0.4), hsl(var(--destructive)/0.7), hsl(var(--destructive)/0.4), transparent)',
                    animation: 'scanline 5s linear infinite',
                    boxShadow: '0 0 18px 4px hsl(var(--destructive)/0.25)',
                }}
            />

            <div
                className="pointer-events-none absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-destructive/8 blur-[100px]"
                style={{ animation: 'floatA 9s ease-in-out infinite' }}
            />
            <div
                className="pointer-events-none absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-destructive/5 blur-[120px]"
                style={{ animation: 'floatB 12s ease-in-out infinite' }}
            />
            <div
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-destructive/5 blur-[120px]"
                style={{ animation: 'floatC 7s ease-in-out infinite' }}
            />

            {[
                { top: '20%', left: '15%', delay: '0s',   dur: '6s'  },
                { top: '70%', left: '80%', delay: '1.5s', dur: '8s'  },
                { top: '45%', left: '88%', delay: '3s',   dur: '5s'  },
                { top: '80%', left: '20%', delay: '0.8s', dur: '7s'  },
                { top: '15%', left: '65%', delay: '2.2s', dur: '9s'  },
                { top: '60%', left: '5%',  delay: '4s',   dur: '6.5s'},
            ].map((p, i) => (
                <div
                    key={i}
                    className="pointer-events-none absolute w-1 h-1 rounded-full bg-destructive/50"
                    style={{
                        top: p.top, left: p.left,
                        animation: `floatA ${p.dur} ease-in-out infinite`,
                        animationDelay: p.delay,
                        boxShadow: '0 0 6px 2px hsl(var(--destructive)/0.3)',
                    }}
                />
            ))}

            <div className="relative flex flex-col items-center text-center max-w-md w-full">

                <div className="relative mb-8">
                    <span className="absolute inset-0 rounded-full animate-ping bg-destructive/20" style={{ animationDuration: '2.4s' }} />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/5">
                        <Bot
                            className="w-10 h-10 text-destructive/70"
                            strokeWidth={1.5}
                            style={{ animation: 'glitch 2s steps(1) infinite' }}
                        />
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-60" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                        </span>
                    </div>
                </div>

                <h1 className="text-[96px] font-black leading-none tracking-tighter text-foreground tabular-nums select-none">
                    <span className="text-destructive">4</span>
                    <span>0</span>
                    <span className="text-destructive">4</span>
                </h1>

                <div  className="flex items-center gap-3 w-full my-4">
                    <div className="flex-1 h-px bg-border" />
                    <Wifi className="w-3.5 h-3.5 text-muted-foreground/40" />
                    <div className="flex-1 h-px bg-border" />
                </div>

                <p className="text-lg font-semibold tracking-tight text-foreground mb-2">
                    Page not found
                </p>
                <p style={{ animation: 'glitch 6s steps(1) infinite' }} className="text-sm text-muted-foreground leading-relaxed mb-8">
                    This unit is either offline, decommissioned, or was never deployed.
                    Return to the dashboard.
                </p>

                <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}