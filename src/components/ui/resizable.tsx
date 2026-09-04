"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  onResize?: (size: number) => void
}

function ResizablePanel({
  defaultSize = 320,
  minSize = 240,
  maxSize = 480,
  onResize,
  className,
  children,
  ...props
}: ResizablePanelProps) {
  const [width, setWidth] = React.useState(defaultSize)
  const [isResizing, setIsResizing] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const startXRef = React.useRef(0)
  const startWidthRef = React.useRef(0)

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
    },
    [width],
  )

  React.useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startXRef.current - e.clientX
      const newWidth = Math.min(
        maxSize,
        Math.max(minSize, startWidthRef.current + deltaX),
      )
      setWidth(newWidth)
      onResize?.(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      // Save to localStorage
      localStorage.setItem("sidebar-right-width", String(width))
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, width, minSize, maxSize, onResize])

  return (
    <div
      ref={panelRef}
      className={cn("flex h-full flex-col", className)}
      style={{ width: `${width}px` }}
      {...props}
    >
      {children}
      {/* Resize Handle */}
      <div
        className={cn(
          "absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors",
          isResizing && "bg-primary/50",
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}

export { ResizablePanel }
export type { ResizablePanelProps }
