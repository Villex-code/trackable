"use client";

import { ReactNode } from "react";
import TopBar from "./TopBar";

interface MainContentWrapperProps {
  children: ReactNode;
  topbarBody?: ReactNode;
}

export default function MainContentWrapper({ children, topbarBody }: MainContentWrapperProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar body={topbarBody} />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8">
        {children}
      </div>
    </div>
  );
}
