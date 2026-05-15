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
  className,
}: PopupLayoutProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-slate-400 font-medium text-sm">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>

      {/* Footer Actions */}
      {footer && <div className="mt-5 flex gap-3">{footer}</div>}
    </div>
  );
}
