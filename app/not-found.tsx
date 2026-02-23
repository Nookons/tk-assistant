import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bot, Wifi } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">

            {/* Background grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage:
                        'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Glow blob */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-destructive/5 blur-[120px]" />

            {/* Content */}
            <div className="relative flex flex-col items-center text-center max-w-md w-full">

                {/* Robot icon */}
                <div className="relative mb-8">
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full animate-ping bg-destructive/20" style={{animationDuration:'2.4s'}}/>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/5">
                        <Bot className="w-10 h-10 text-destructive/70" strokeWidth={1.5} />
                        {/* Offline dot */}
                        <span className="absolute top-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-60"/>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"/>
            </span>
                    </div>
                </div>

                {/* 404 number */}
                <h1 className="text-[96px] font-black leading-none tracking-tighter text-foreground tabular-nums select-none">
                    <span className="text-destructive">4</span>
                    <span>0</span>
                    <span className="text-destructive">4</span>
                </h1>

                {/* Divider with signal icon */}
                <div className="flex items-center gap-3 w-full my-4">
                    <div className="flex-1 h-px bg-border"/>
                    <Wifi className="w-3.5 h-3.5 text-muted-foreground/40"/>
                    <div className="flex-1 h-px bg-border"/>
                </div>

                {/* Message */}
                <p className="text-lg font-semibold tracking-tight text-foreground mb-2">
                    Page not found
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                    This unit is either offline, decommissioned, or was never deployed.
                    Return to the dashboard.
                </p>

                {/* Error code — decorative */}
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/40 mb-8 uppercase">
                    ERR_UNIT_NOT_FOUND · 0x00000000
                </p>

                {/* Action */}
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