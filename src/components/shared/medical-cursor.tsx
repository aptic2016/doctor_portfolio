"use client"

import { useEffect, useRef, useCallback } from "react"

const SIZE = 48
const VIEWBOX = 68

const HOTSPOTS = {
  stethoscope: { x: 34, y: 6 },
  capsule: { x: 7, y: 7 },
}

function StethoscopeSVG() {
  return (
    <>
      {/* Left earpiece */}
      <circle cx="22" cy="6" r="2.5" fill="currentColor" />
      <circle cx="22" cy="6" r="1" fill="currentColor" opacity="0.5" />

      {/* Right earpiece */}
      <circle cx="46" cy="6" r="2.5" fill="currentColor" />
      <circle cx="46" cy="6" r="1" fill="currentColor" opacity="0.5" />

      {/* Left metal tube */}
      <line x1="22" y1="8.5" x2="22" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Right metal tube */}
      <line x1="46" y1="8.5" x2="46" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Left flexible tubing - smooth curve to junction */}
      <path d="M22 20 C22 30, 28 36, 34 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Right flexible tubing - smooth curve to junction */}
      <path d="M46 20 C46 30, 40 36, 34 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Junction dot */}
      <circle cx="34" cy="38" r="1.5" fill="currentColor" />

      {/* Lower hanging tube */}
      <path d="M34 39.5 C34 44, 34 48, 34 52" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Chestpiece outer ring */}
      <circle cx="34" cy="56" r="5" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Chestpiece inner */}
      <circle cx="34" cy="56" r="2.5" fill="currentColor" opacity="0.6" />

      {/* Chestpiece center dot */}
      <circle cx="34" cy="56" r="1" fill="currentColor" />

      {/* Subtle pulse ring */}
      <circle cx="34" cy="56" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2">
        <animate attributeName="r" values="5;10;5" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </>
  )
}

function CapsuleSVG() {
  return (
    <g transform="rotate(40, 24, 24)">
      {/* Capsule body - rounded pill shape */}
      <rect x="4" y="16" width="40" height="16" rx="8" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Left half accent fill */}
      <rect x="4" y="16" width="20" height="16" rx="8" ry="8" fill="currentColor" opacity="0.15" />

      {/* Center divider line */}
      <line x1="24" y1="16" x2="24" y2="32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />

      {/* Small detail dots on left half */}
      <circle cx="12" cy="24" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="17" cy="21" r="0.8" fill="currentColor" opacity="0.25" />
      <circle cx="15" cy="27" r="0.7" fill="currentColor" opacity="0.2" />

      {/* Subtle animated outline */}
      <rect x="4" y="16" width="40" height="16" rx="8" ry="8" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.12">
        <animate attributeName="opacity" values="0.12;0.25;0.12" dur="2.5s" repeatCount="indefinite" />
      </rect>
    </g>
  )
}

interface MedicalCursorProps {
  mode: "stethoscope" | "capsule"
}

export function MedicalCursor({ mode }: MedicalCursorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const targetRef = useRef({ x: -100, y: -100 })
  const velRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mouseDownRef = useRef(false)
  const hoverRef = useRef(false)
  const visibleRef = useRef(false)

  const hotspot = HOTSPOTS[mode]

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const tick = useCallback(() => {
    if (!svgRef.current) return

    posRef.current.x = lerp(posRef.current.x, targetRef.current.x, 0.35)
    posRef.current.y = lerp(posRef.current.y, targetRef.current.y, 0.35)

    const dx = targetRef.current.x - posRef.current.x
    const dy = targetRef.current.y - posRef.current.y
    velRef.current.x = lerp(velRef.current.x, dx, 0.2)
    velRef.current.y = lerp(velRef.current.y, dy, 0.2)

    const speed = Math.sqrt(velRef.current.x * velRef.current.x + velRef.current.y * velRef.current.y)
    const tilt = Math.max(-3, Math.min(3, speed * 0.015))

    const tx = posRef.current.x - hotspot.x
    const ty = posRef.current.y - hotspot.y

    const clampedX = Math.max(-SIZE * 0.3, Math.min(window.innerWidth - SIZE * 0.7, tx))
    const clampedY = Math.max(-SIZE * 0.3, Math.min(window.innerHeight - SIZE * 0.7, ty))

    const scale = mouseDownRef.current ? 0.92 : hoverRef.current ? 1.08 : 1

    svgRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) rotate(${tilt}deg) scale(${scale})`
  }, [hotspot])

  const startLoop = useCallback(() => {
    const loop = () => {
      tick()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [tick])

  const showCursor = useCallback(() => {
    if (!visibleRef.current && svgRef.current) {
      visibleRef.current = true
      svgRef.current.style.opacity = "1"
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (svgRef.current) {
        svgRef.current.style.opacity = "0"
        visibleRef.current = false
      }
    }, 1000)
  }, [])

  const isInteractive = useCallback((el: Element | null): boolean => {
    if (!el) return false
    const tag = el.tagName.toLowerCase()
    if (tag === "a" || tag === "button" || tag === "input" || tag === "textarea" || tag === "select") return true
    if ((el as HTMLElement).role === "button") return true
    if (el.closest("a, button, [role='button'], input, textarea, select")) return true
    return false
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      startLoop()
    })

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      targetRef.current = { x: e.clientX, y: e.clientY }
      showCursor()
    }

    const onMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
      showCursor()
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      mouseDownRef.current = true
    }

    const onMouseUp = () => {
      mouseDownRef.current = false
    }

    const onMouseOver = (e: MouseEvent) => {
      hoverRef.current = isInteractive(e.target as Element)
    }

    const onMouseOut = (e: MouseEvent) => {
      if (isInteractive(e.target as Element)) {
        hoverRef.current = false
      }
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true })
    document.addEventListener("mousemove", onMouseMove, { passive: true })
    document.addEventListener("mousedown", onMouseDown, { passive: true })
    document.addEventListener("mouseup", onMouseUp, { passive: true })
    document.addEventListener("mouseover", onMouseOver, { passive: true })
    document.addEventListener("mouseout", onMouseOut, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("mouseover", onMouseOver)
      document.removeEventListener("mouseout", onMouseOut)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [startLoop, showCursor, isInteractive])

  const colorClass = "text-[#0c2d6b] dark:text-[#60b5f0]"

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
        cursor: "none",
      }}
    >
      <svg
        ref={svgRef}
        className={colorClass}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          willChange: "transform",
          transition: "opacity 0.25s ease-out, transform 0.08s ease-out",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        {mode === "stethoscope" ? <StethoscopeSVG /> : <CapsuleSVG />}
      </svg>
    </div>
  )
}
