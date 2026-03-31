import { motion, AnimatePresence } from "motion/react"
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BottomSheetProps {
  children: ReactNode
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export function BottomSheet({
  children,
  className,
  isOpen = true,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed right-0 bottom-0 left-0 z-30 px-4 pb-4",
            className
          )}
          initial={{ y: 180, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 180, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 22,
            stiffness: 220,
            delay: 0.1,
          }}
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/65 shadow-2xl backdrop-blur-2xl">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface BottomSheetContentProps {
  children: ReactNode
  className?: string
}

export function BottomSheetContent({
  children,
  className,
}: BottomSheetContentProps) {
  return <div className={cn("p-4", className)}>{children}</div>
}

interface BottomSheetHeaderProps {
  children: ReactNode
  className?: string
}

export function BottomSheetHeader({
  children,
  className,
}: BottomSheetHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-center justify-between", className)}>
      {children}
    </div>
  )
}

interface BottomSheetTitleProps {
  children: ReactNode
  className?: string
}

export function BottomSheetTitle({
  children,
  className,
}: BottomSheetTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  )
}

interface BottomSheetDescriptionProps {
  children: ReactNode
  className?: string
}

export function BottomSheetDescription({
  children,
  className,
}: BottomSheetDescriptionProps) {
  return <p className={cn("text-sm text-white/50", className)}>{children}</p>
}
