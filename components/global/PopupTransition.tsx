import React, { FC, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

interface PopupTransitionProps {
  open: boolean;
  setOpen?: (open: boolean) => void;
  onClose?: () => void;
  children?: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnDocumentClick?: boolean;
  useHistory?: boolean;
  /** Merged onto the root overlay container (e.g. `z-[20000]` to stack above other modals). */
  className?: string;
}

const PopupTransition: FC<PopupTransitionProps> = ({
  open,
  setOpen,
  onClose,
  children,
  closeOnEscape = true,
  closeOnDocumentClick = true,
  useHistory = true,
  className,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const historyStateRef = useRef<string | null>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  /** Shared close path (history + state). Not gated by `closeOnDocumentClick`. */
  const closePopup = () => {
    if (useHistory && historyStateRef.current) {
      window.history.back();
      historyStateRef.current = null;
    }
    setOpen && setOpen(false);
    onClose && onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        closePopup();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      // Track where the mousedown started
      mouseDownTargetRef.current = event.target;
    };

    const handleMouseUp = (event: MouseEvent) => {
      // Only close if both mousedown and mouseup happened on the backdrop or popup wrapper
      const isBackdrop = event.target === backdropRef.current;
      const isPopupWrapper = event.target === popupRef.current;
      const wasBackdrop = mouseDownTargetRef.current === backdropRef.current;
      const wasPopupWrapper = mouseDownTargetRef.current === popupRef.current;

      if (
        closeOnDocumentClick &&
        (isBackdrop || isPopupWrapper) &&
        (wasBackdrop || wasPopupWrapper)
      ) {
        closePopup();
      }
      // Reset the ref
      mouseDownTargetRef.current = null;
    };

    const handlePopState = (event: PopStateEvent) => {
      if (useHistory && open && historyStateRef.current) {
        historyStateRef.current = null;
        setOpen && setOpen(false);
        onClose && onClose();
      }
    };

    const handleScroll = (event: Event) => {
      if (event.target === backdropRef.current) {
        event.preventDefault();
        return false;
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);

      if (useHistory) {
        window.addEventListener("popstate", handlePopState);
      }

      backdropRef.current?.addEventListener("wheel", handleScroll, {
        passive: false,
      });
      backdropRef.current?.addEventListener("touchmove", handleScroll, {
        passive: false,
      });

      document.body.style.overflow = "hidden";

      if (useHistory && !historyStateRef.current) {
        historyStateRef.current = `popup-${Date.now()}`;
        window.history.pushState(
          { popup: historyStateRef.current },
          "",
          window.location.href,
        );
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);

      if (useHistory) {
        window.removeEventListener("popstate", handlePopState);
      }

      backdropRef.current?.removeEventListener("wheel", handleScroll);
      backdropRef.current?.removeEventListener("touchmove", handleScroll);

      // Restore body scroll
      document.body.style.overflow = "";
    };
  }, [open, closeOnEscape, closeOnDocumentClick, useHistory]);

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 flex items-center justify-center z-[999] overflow-hidden",
            className,
          )}
        >
          <motion.div
            ref={backdropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 bg-opacity-50 overflow-hidden"
          />
          <motion.div
            ref={popupRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-[10000] w-full min-h-full h-full flex items-center justify-center [&>*]:!max-h-[calc(100%-env(safe-area-inset-top)-env(safe-area-inset-bottom)-40px)]"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PopupTransition;
