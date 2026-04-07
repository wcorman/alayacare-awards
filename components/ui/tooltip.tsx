"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

function TooltipProvider({
    delayDuration = 150,
    ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
    return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

function Tooltip({
    ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root {...props} />;
}

function TooltipTrigger({
    ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>) {
    return <TooltipPrimitive.Trigger {...props} />;
}

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    TooltipContentProps
>(({ className = "", sideOffset = 10, ...props }, ref) => {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                ref={ref}
                sideOffset={sideOffset}
                className={`z-50 max-w-64 rounded-xl bg-[#08193e] px-3 py-2 text-sm leading-relaxed text-white shadow-[0_18px_40px_rgba(8,25,62,0.28)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 ${className}`}
                {...props}
            />
        </TooltipPrimitive.Portal>
    );
});

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
