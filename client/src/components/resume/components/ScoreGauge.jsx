import React from 'react';
import { cn } from "../../../lib/utils";

const ScoreGauge = ({ score, className }) => {
    // We can use the existing ProgressRing or adapt this
    const percentage = Math.max(0, Math.min(100, score));
    
    // Determine color based on score
    const colorClass = score > 69 
        ? "text-success" 
        : score > 39 
            ? "text-warning" 
            : "text-destructive";

    const strokeColor = score > 69
        ? "hsl(var(--success))"
        : score > 39
            ? "hsl(var(--warning))"
            : "hsl(var(--destructive))";

    return (
        <div className={cn("relative w-32 h-32 flex items-center justify-center", className)}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    className="text-secondary/50 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                ></circle>
                {/* Score circle */}
                <circle
                    className="stroke-current transition-all duration-1000 ease-in-out"
                    stroke={strokeColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${(percentage * 251.2) / 100} 251.2`}
                ></circle>
            </svg>
            <div className={`absolute flex flex-col items-center justify-center ${colorClass}`}>
                <span className="text-3xl font-extrabold">{score}</span>
                <span className="text-xs font-semibold opacity-80 mt-[-4px]">/100</span>
            </div>
        </div>
    );
};

export default ScoreGauge;
