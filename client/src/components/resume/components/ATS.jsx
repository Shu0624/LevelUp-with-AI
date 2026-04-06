import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const ATS = ({ score, suggestions }) => {
  // Determine icon based on score
  const ScoreIcon = score > 69
    ? CheckCircle2
    : score > 49
      ? AlertTriangle
      : AlertCircle;

  const scoreColor = score > 69
      ? 'text-success'
      : score > 49
          ? 'text-warning'
          : 'text-destructive';

  const subtitle = score > 69
    ? 'Great Job!'
    : score > 49
      ? 'Good Start'
      : 'Needs Improvement';

  return (
    <div className={`p-6 border rounded-2xl mb-4 ${score > 69 ? 'bg-success/5 border-success/20' : score > 49 ? 'bg-warning/5 border-warning/20' : 'bg-destructive/5 border-destructive/20'}`}>
      {/* Top section with icon and headline */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-1.5 rounded-lg ${score > 69 ? 'bg-success/20' : score > 49 ? 'bg-warning/20' : 'bg-destructive/20'}`}>
           <ScoreIcon className={`w-6 h-6 ${scoreColor}`} />
        </div>
        <h2 className="text-xl font-bold flex items-center gap-2">ATS Score - {score}/100</h2>
      </div>

      {/* Description section */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground mb-2">How well does your resume pass through Applicant Tracking Systems?</h3>
        <p className="text-sm text-muted-foreground mb-4 font-medium">Your resume was scanned like an employer would. Here's how it performed:</p>

        {/* Suggestions list */}
        <div className="space-y-3 mt-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              {suggestion.type === "good" ? (
                  <CheckCircle className="w-4 h-4 mt-1 text-success shrink-0" />
              ) : (
                  <AlertTriangle className="w-4 h-4 mt-1 text-warning shrink-0" />
              )}
              <p className={`text-[13px] ${suggestion.type === "good" ? "text-muted-foreground" : "text-muted-foreground"}`}>
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-sm font-medium text-muted-foreground mt-6 pt-4 border-t border-border/50">
         Want a better score? Improve your resume by applying the suggestions listed below.
      </p>
    </div>
  )
}

export default ATS;
