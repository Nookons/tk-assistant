export const getScoreRank = (score: number): { label: string; color: string } => {
    if (score >= 500) return { label: "Expert",    color: "text-amber-400" };
    if (score >= 200) return { label: "Senior",    color: "text-sky-400" };
    if (score >= 50)  return { label: "Technician",color: "text-emerald-400" };
    return              { label: "Junior",          color: "text-muted-foreground" };
};