import {SCORE_THRESHOLDS} from "@/components/shared/DashboardNew/DashboardComponents/Settings/ScoreConsts";
import React from "react";
import {getScoreRank} from "@/components/shared/DashboardNew/DashboardComponents/Settings/getScoreRank";

export const ScoreBar = ({ score }: { score: number }) => {
    const tier = SCORE_THRESHOLDS.findLast((t) => score >= t.min) ?? SCORE_THRESHOLDS[0];
    const isMax = tier.next === null;
    const progress = isMax ? 100 : Math.min(((score - tier.min) / (tier.max - tier.min)) * 100, 100);
    const rank = getScoreRank(score);

    const left = tier.max - score

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{tier.label}</span>
                <div className={`flex items-center gap-1 text-xs`}>
                    {!isMax && (
                        <span className="text-muted-foreground">
                        {left.toLocaleString()} pts to {tier.next}
                    </span>
                    )}
                    <span className={`ml-auto text-sm font-semibold ${rank.color}`}>
                    {score} pts
                </span>
                </div>
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