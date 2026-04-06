import React, { createContext, useContext, useState } from "react";
import { cn } from "../../../lib/utils";

const AccordionContext = createContext();

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion");
    }
    return context;
};

export const Accordion = ({
    children,
    defaultOpen,
    allowMultiple = false,
    className = "",
}) => {
    const [activeItems, setActiveItems] = useState(
        defaultOpen ? (Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]) : []
    );

    const toggleItem = (id) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id];
            } else {
                return prev.includes(id) ? [] : [id];
            }
        });
    };

    const isItemActive = (id) => activeItems.includes(id);

    return (
        <AccordionContext.Provider
            value={{ activeItems, toggleItem, isItemActive }}
        >
            <div className={`space-y-2 ${className}`}>{children}</div>
        </AccordionContext.Provider>
    );
};

export const AccordionItem = ({
    id,
    children,
    className = "",
}) => {
    return (
        <div className={`overflow-hidden border-b border-border/50 ${className}`}>
            {children}
        </div>
    );
};

export const AccordionHeader = ({
    itemId,
    children,
    className = "",
    icon,
    iconPosition = "right",
}) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    const defaultIcon = (
        <svg
            className={cn("w-5 h-5 transition-transform duration-200", {
                "rotate-180": isActive,
            })}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );

    const handleClick = () => {
        toggleItem(itemId);
    };

    return (
        <button
            onClick={handleClick}
            className={`
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer hover:bg-secondary/20 rounded-t-xl
        ${className}
      `}
        >
            <div className="flex items-center space-x-3 w-full">
                {iconPosition === "left" && (icon || defaultIcon)}
                <div className="flex-1">{children}</div>
            </div>
            {iconPosition === "right" && <span className="text-muted-foreground mr-2">{icon || defaultIcon}</span>}
        </button>
    );
};

export const AccordionContent = ({
    itemId,
    children,
    className = "",
}) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <div
            className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "max-h-fit opacity-100 mb-4" : "max-h-0 opacity-0"}
        ${className}
      `}
        >
            <div className="px-4 py-3 ">{children}</div>
        </div>
    );
};
