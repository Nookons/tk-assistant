import {SCORE_THRESHOLDS} from "@/components/shared/DashboardNew/DashboardComponents/Settings/ScoreConsts";
import React from "react";

export const ScoreBar = ({ score }: { score: number }) => {
    const tier = SCORE_THRESHOLDS.findLast((t) => score >= t.min) ?? SCORE_THRESHOLDS[0];
    const isMax = tier.next === null;
    const progress = isMax ? 100 : Math.min(((score - tier.min) / (tier.max - tier.min)) * 100, 100);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{tier.label}</span>
                {!isMax && (
                    <span className="text-muted-foreground">
                        {tier.max - score} pts to {tier.next}
                    </span>
                )}
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${tier.color}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};