"use client"

import { useEffect, useRef, useCallback } from "react"

const SIZE = 36
const VIEWBOX = 36
const HOTSPOT_X = 18
const HOTSPOT_Y = 27

export function StethoscopeCursor() {
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

    const tx = posRef.current.x - HOTSPOT_X
    const ty = posRef.current.y - HOTSPOT_Y

    const clampedX = Math.max(-SIZE * 0.3, Math.min(window.innerWidth - SIZE * 0.7, tx))
    const clampedY = Math.max(-SIZE * 0.3, Math.min(window.innerHeight - SIZE * 0.7, ty))

    const scale = mouseDownRef.current ? 0.88 : hoverRef.current ? 1.12 : 1

    svgRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) rotate(${tilt}deg) scale(${scale})`
  }, [])

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
          transition: "opacity 0.25s ease-out",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <circle cx="12" cy="4" r="1.8" fill="#0c2d6b" className="dark:fill-[#60b5f0]" />
        <circle cx="24" cy="4" r="1.8" fill="#0c2d6b" className="dark:fill-[#60b5f0]" />
        <circle cx="12" cy="4" r="0.8" fill="#2a5a9a" className="dark:fill-[#80ccf5]" />
        <circle cx="24" cy="4" r="0.8" fill="#2a5a9a" className="dark:fill-[#80ccf5]" />
        <line x1="12" y1="5.8" x2="12" y2="13" stroke="#1a4a8a" strokeWidth="1.4" strokeLinecap="round" className="dark:stroke-[#70c0f0]" />
        <line x1="24" y1="5.8" x2="24" y2="13" stroke="#1a4a8a" strokeWidth="1.4" strokeLinecap="round" className="dark:stroke-[#70c0f0]" />
        <path d="M12 13 C12 17, 14 19, 16 20.5" stroke="#1a4a8a" strokeWidth="1.5" strokeLinecap="round" fill="none" className="dark:stroke-[#80ccf5]" />
        <path d="M24 13 C24 17, 22 19, 20 20.5" stroke="#1a4a8a" strokeWidth="1.5" strokeLinecap="round" fill="none" className="dark:stroke-[#80ccf5]" />
        <circle cx="18" cy="21" r="1" fill="#0c2d6b" className="dark:fill-[#60b5f0]" />
        <line x1="18" y1="22" x2="18" y2="24.5" stroke="#2a5a9a" strokeWidth="1.6" strokeLinecap="round" className="dark:stroke-[#70c0f0]" />
        <circle cx="18" cy="27.5" r="3.5" stroke="#0c2d6b" strokeWidth="1.8" fill="none" className="dark:stroke-[#60b5f0]" />
        <circle cx="18" cy="27.5" r="1.8" fill="#1a4a8a" className="dark:fill-[#80ccf5]" />
        <circle cx="18" cy="27.5" r="0.6" fill="#0c2d6b" className="dark:fill-[#5ba0e0]" />
        <circle cx="18" cy="27.5" r="3.5" stroke="#0c2d6b" strokeWidth="0.8" fill="none" className="dark:stroke-[#60b5f0]" opacity="0.3">
          <animate attributeName="r" values="3.5;7;3.5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
