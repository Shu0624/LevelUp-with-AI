import React from 'react';
import { cn } from "../../../lib/utils";

const ScoreBadge = ({ score }) => {
    return (
        <div
            className={cn(
                "px-3 py-1 rounded-full text-xs font-bold border",
                score > 69
                    ? "bg-success/10 text-success border-success/20"
                    : score > 39
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
            )}
        >
            {score > 69
                ? "Good"
                : score > 39
                    ? "Average"
                    : "Needs Work"
            }
        </div>
    );
};

export default ScoreBadge;
