import React from 'react';
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

const Category = ({ title, score }) => {
    const textColor = score > 69 ? 'text-success'
            : score > 39
        ? 'text-warning' : 'text-destructive';

    return (
        <div className="w-full py-4 px-2 hover:bg-secondary/10 transition-colors border-b border-border/30 last:border-0 pointer-events-none">
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-row gap-4 items-center justify-center">
                    <p className="text-[17px] font-medium text-foreground">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-xl font-medium">
                    <span className={textColor}>{score}</span>
                    <span className="text-muted-foreground font-medium">/100</span>
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }) => {
    if (!feedback) return null;

    return (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm w-full flex flex-col p-6 mb-4">
            <div className="flex flex-row items-center gap-6 pb-6 pt-2 border-b border-border/30">
                <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                    <ScoreGauge score={feedback?.overallScore || feedback?.score || 0} className="scale-75 origin-left" />
                </div>

                <div className="flex flex-col gap-1">
                    <h2 className="text-[22px] font-bold text-foreground">Your Resume Score</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <div className="flex flex-col w-full pb-2 mt-4 space-y-1">
                <Category title="Tone & Style" score={feedback?.toneAndStyle?.score || 0} />
                <Category title="Content" score={feedback?.content?.score || 0} />
                <Category title="Structure" score={feedback?.structure?.score || 0} />
                <Category title="Skills" score={feedback?.skills?.score || 0} />
            </div>
        </div>
    )
}

export default Summary;
