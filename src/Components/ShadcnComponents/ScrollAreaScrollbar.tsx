import * as React from "react";
import { ScrollArea } from "../ui/scroll-area";

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  className,
}) => {
  const endRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when children change
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [children]);

  return (
    <div className={`flex flex-1 h-full w-full max-h-full overflow-hidden`}>
      <ScrollArea
        className={`flex-1 w-full max-h-full rounded-md border ${className}`}
      >
        <div className="flex flex-col p-4">
          {children}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
