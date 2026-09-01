'use client'
import { useEffect, useState } from 'react'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm bg-white shadow-lg h-full overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export function SheetTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <div onClick={onClick}>{children}</div>
}

export function SheetTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={`sr-only ${className || ''}`}>{children}</h2>
}

export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className || ''}>{children}</div>
}
