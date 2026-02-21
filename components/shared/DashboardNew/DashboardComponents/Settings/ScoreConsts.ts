export const SCORE_THRESHOLDS = [
    { min: 0,   max: 50,  label: "Junior",     next: "Senior",     color: "bg-muted-foreground" },
    { min: 50,  max: 200, label: "Technician", next: "Senior",     color: "bg-emerald-500" },
    { min: 200, max: 500, label: "Senior",     next: "Expert",     color: "bg-sky-500" },
    { min: 500, max: 500, label: "Expert",     next: null,         color: "bg-amber-500" },
];