"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface PopupLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function PopupLayout({ 
  title, 
  description, 
  children, 
  footer,
  className 
}: PopupLayoutProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-slate-400 font-medium text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer Actions */}
      {footer && (
        <div className="mt-10 flex gap-4">
          {footer}
        </div>
      )}
    </div>
  );
}
