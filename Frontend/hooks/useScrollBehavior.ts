/**
 * Custom React hooks for scroll management, focus trap, and body scroll lock
 * Used by AdvancedJobSearch component for optimal UX
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to automatically scroll element into view with smooth behavior
 * Usage: const ref = useScrollIntoView(); <div ref={ref} />
 */
export function useScrollIntoView(shouldScroll: boolean = true, delay: number = 100) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldScroll || !ref.current) return

    // Use setTimeout to ensure DOM is fully rendered before scrolling
    const timer = setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [shouldScroll, delay])

  return ref
}

/**
 * Hook to scroll to a specific element with optional offset
 * Usage: const scroll = useScrollToElement(); 
 *        onClick={() => scroll(elementRef, 80)} // 80px offset for sticky header
 */
export function useScrollToElement() {
  return useCallback((
    ref: React.RefObject<HTMLElement>,
    offsetTop: number = 0,
    smooth: boolean = true
  ) => {
    if (!ref.current) return

    const element = ref.current
    const offsetPosition = element.offsetTop - offsetTop

    window.scrollTo({
      top: offsetPosition,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])
}

/**
 * Hook to remember and restore scroll position
 * Usage: 
 *   const { saveScrollPosition, restoreScrollPosition } = useScrollPositionMemory()
 *   const handleCloseDetail = () => { saveScrollPosition(); setSelected(null); }
 *   useEffect(() => { restoreScrollPosition(); }, [isDetailOpen])
 */
export function useScrollPositionMemory(key: string = 'scrollPos') {
  const scrollPositionRef = useRef<number>(0)

  const saveScrollPosition = useCallback(() => {
    scrollPositionRef.current = window.scrollY
    // Also store in sessionStorage for persistence across re-renders
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, String(window.scrollY))
    }
  }, [key])

  const restoreScrollPosition = useCallback(() => {
    // Try to restore from sessionStorage first
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(key)
      const targetY = saved ? parseInt(saved) : scrollPositionRef.current

      // Restore with smooth animation if significant distance
      const distance = Math.abs(targetY - window.scrollY)
      const useSmoothScroll = distance > 100

      window.scrollTo({
        top: targetY,
        behavior: useSmoothScroll ? 'smooth' : 'auto',
      })

      // Clean up
      sessionStorage.removeItem(key)
    }
  }, [key])

  const clearScrollPosition = useCallback(() => {
    scrollPositionRef.current = 0
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key)
    }
  }, [key])

  return { saveScrollPosition, restoreScrollPosition, clearScrollPosition }
}

/**
 * Hook to lock body scroll while modal is open
 * Usage: useBodyScrollLock(isModalOpen)
 */
export function useBodyScrollLock(isLocked: boolean = false) {
  useEffect(() => {
    if (!isLocked) {
      document.body.style.overflow = 'unset'
      return
    }

    // Save original overflow value
    const originalOverflow = document.body.style.overflow

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = '0px'
    }
  }, [isLocked])
}

/**
 * Hook to trap focus inside modal/dialog
 * Usage: const { ref: modalRef, setReturnFocus } = useFocusTrap(isOpen)
 */
export function useFocusTrap(isActive: boolean = false) {
  const modalRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !modalRef.current) return

    // Save the element that had focus before modal opened
    returnFocusRef.current = document.activeElement as HTMLElement

    // Get all focusable elements in the modal
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first element
    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // Trap focus within modal
      if (e.shiftKey) {
        // Shift + Tab on first element -> focus last element
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab on last element -> focus first element
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        // You can dispatch a close action here
      }
    }

    modalRef.current.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      modalRef.current?.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleEscapeKey)

      // Restore focus to the element that triggered the modal
      returnFocusRef.current?.focus()
    }
  }, [isActive])

  return { ref: modalRef, setReturnFocus: (el: HTMLElement) => { returnFocusRef.current = el } }
}

/**
 * Hook to handle keyboard navigation through job list
 * Usage: useJobListKeyboardNav(filteredJobs, selectedJobId, onJobSelect)
 */
export function useJobListKeyboardNav(
  items: Array<{ id: string }>,
  selectedId: string | null,
  onSelect: (id: string) => void,
  isEnabled: boolean = true
) {
  useEffect(() => {
    if (!isEnabled || items.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return

      // Check if target is an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      e.preventDefault()

      const currentIndex = selectedId ? items.findIndex(item => item.id === selectedId) : -1
      let nextIndex = currentIndex

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1
      }

      if (nextIndex >= 0 && nextIndex < items.length) {
        onSelect(items[nextIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedId, onSelect, isEnabled])
}

/**
 * Hook to smooth scroll to element with offset for sticky headers
 * Usage: const scrollTo = useScrollToWithOffset(stickyHeaderHeight)
 *        scrollTo(elementRef)
 */
export function useScrollToWithOffset(headerOffset: number = 80) {
  return useCallback((
    element: HTMLElement | null,
    additionalOffset: number = 0,
    behavior: 'smooth' | 'auto' = 'smooth'
  ) => {
    if (!element) return

    const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset - additionalOffset

    window.scrollTo({
      top: targetPosition,
      behavior,
    })
  }, [headerOffset])
}

/**
 * Hook to detect if element is in viewport
 * Usage: const isVisible = useIsInViewport(ref)
 */
export function useIsInViewport(ref: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useRef(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref])

  return isVisible
}
