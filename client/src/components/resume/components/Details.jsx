import React from 'react';
import { cn } from "../../../lib/utils";
import { CheckCircle, AlertTriangle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

const ScoreBadgeDetails = ({ score }) => {
  return (
      <div
          className={cn(
              "flex flex-row gap-1 items-center px-3 py-1 rounded-full",
              score > 69
                  ? "bg-success/20"
                  : score > 39
                      ? "bg-warning/20"
                      : "bg-destructive/20"
          )}
      >
        {score > 69 ? (
           <CheckCircle className="w-4 h-4 text-success" />
        ) : (
           <AlertTriangle className="w-4 h-4 text-warning" />
        )}
        <p
            className={cn(
                "text-sm font-bold",
                score > 69
                    ? "text-success"
                    : score > 39
                        ? "text-warning"
                        : "text-destructive"
            )}
        >
          {score}/100
        </p>
      </div>
  );
};

const CategoryHeader = ({
  title,
  categoryScore,
}) => {
  return (
      <div className="flex flex-row gap-4 items-center py-2 w-full justify-between pr-4">
        <p className="text-xl font-bold text-foreground">{title}</p>
        <ScoreBadgeDetails score={categoryScore} />
      </div>
  );
};

const CategoryContent = ({
  tips,
}) => {
  // Safe default for mapping
  const safeTips = Array.isArray(tips) ? tips : [];
  const [selectedTipIndex, setSelectedTipIndex] = React.useState(null);

  return (
      <div className="flex flex-col gap-4 items-center w-full">
        <div className="bg-secondary/30 w-full rounded-xl px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 border border-border/50">
          {safeTips.map((tip, index) => (
              <div 
                 className={cn(
                    "flex flex-row gap-3 items-start p-3 rounded-lg cursor-pointer transition-colors border",
                    selectedTipIndex === index 
                        ? "bg-background border-border/60 shadow-sm"
                        : "border-transparent hover:bg-background/50"
                 )} 
                 key={index}
                 onClick={() => setSelectedTipIndex(selectedTipIndex === index ? null : index)}
              >
                {tip.type === "good" ? (
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium text-foreground/80">{tip.tip}</p>
              </div>
          ))}
        </div>
        
        {selectedTipIndex !== null && (
            <div className="flex flex-col gap-4 w-full">
              <div
                  className={cn(
                      "flex flex-col gap-2 rounded-2xl p-5 border duration-300 animate-in fade-in zoom-in-95",
                      safeTips[selectedTipIndex].type === "good"
                          ? "bg-success/5 border-success/20 text-foreground"
                          : "bg-warning/5 border-warning/20 text-foreground"
                  )}
              >
                <div className="flex flex-row gap-2 items-center">
                  {safeTips[selectedTipIndex].type === "good" ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  )}
                  <p className="text-lg font-bold">{safeTips[selectedTipIndex].tip}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-7">{safeTips[selectedTipIndex].explanation}</p>
              </div>
            </div>
        )}
      </div>
  );
};

const Details = ({ feedback }) => {
  if (!feedback) return null;

  return (
      <Accordion 
          className="w-full bg-transparent flex flex-col gap-4"
          allowMultiple={true}
          defaultOpen={['tone-style', 'content', 'structure', 'skills']}
      >
          {feedback?.toneAndStyle && (
            <AccordionItem id="tone-style" className="bg-card border border-border/50 rounded-2xl shadow-sm">
              <AccordionHeader itemId="tone-style">
                <CategoryHeader
                    title="Tone & Style"
                    categoryScore={feedback?.toneAndStyle?.score || 0}
                />
              </AccordionHeader>
              <AccordionContent itemId="tone-style">
                <CategoryContent tips={feedback?.toneAndStyle?.tips || []} />
              </AccordionContent>
            </AccordionItem>
          )}

          {feedback?.content && (
            <AccordionItem id="content" className="bg-card border border-border/50 rounded-2xl shadow-sm">
              <AccordionHeader itemId="content">
                <CategoryHeader
                    title="Content"
                    categoryScore={feedback?.content?.score || 0}
                />
              </AccordionHeader>
              <AccordionContent itemId="content">
                <CategoryContent tips={feedback?.content?.tips || []} />
                
                {/* Before/After Bullets comparison */}
                {feedback?.weakBullets?.length > 0 && feedback?.rewrittenBullets?.length > 0 && (
                  <div className="mt-8 flex flex-col gap-4 px-2 pb-2">
                    <h3 className="text-lg font-bold border-b pb-2">Bullet Point Fixes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex flex-col gap-3 relative">
                        <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                          <AlertTriangle size={16} /> Original (Weak)
                        </div>
                        <ul className="text-[13px] text-muted-foreground space-y-3 font-medium">
                          {feedback.weakBullets.map((b, i) => (
                              <li key={i} className="pl-2 border-l-2 border-destructive/30">{b}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-success/5 border border-success/20 rounded-xl p-5 flex flex-col gap-3 relative">
                        <div className="flex items-center gap-2 text-success font-bold text-sm">
                          <CheckCircle size={16} /> Elite Rewrite
                        </div>
                        <ul className="text-[13px] text-foreground/90 space-y-3 font-semibold">
                          {feedback.rewrittenBullets.map((b, i) => (
                              <li key={i} className="pl-2 border-l-2 border-success/30">{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {feedback?.structure && (
            <AccordionItem id="structure" className="bg-card border border-border/50 rounded-2xl shadow-sm">
              <AccordionHeader itemId="structure">
                <CategoryHeader
                    title="Structure"
                    categoryScore={feedback?.structure?.score || 0}
                />
              </AccordionHeader>
              <AccordionContent itemId="structure">
                <CategoryContent tips={feedback?.structure?.tips || []} />
              </AccordionContent>
            </AccordionItem>
          )}

          {feedback?.skills && (
            <AccordionItem id="skills" className="bg-card border border-border/50 rounded-2xl shadow-sm">
              <AccordionHeader itemId="skills">
                <CategoryHeader
                    title="Skills & Impact"
                    categoryScore={feedback?.skills?.score || 0}
                />
              </AccordionHeader>
              <AccordionContent itemId="skills">
                <CategoryContent tips={feedback?.skills?.tips || []} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
  );
};

export default Details;
