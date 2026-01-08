"use client"

import { useEffect, useRef, useState } from 'react'

// Custom hook for mobile-first enhancements
export const useMobileEnhancements = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [hasTouch, setHasTouch] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      setHasTouch('ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])
  
  return { isMobile, orientation, hasTouch }
}

// Custom hook for swipe gestures
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) => {
  const elementRef = useRef<HTMLElement>(null)
  const startTouch = useRef<{ x: number; y: number } | null>(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startTouch.current = { x: touch.clientX, y: touch.clientY }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault() // Prevent scrolling while swiping
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!startTouch.current) return
      
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startTouch.current.x
      const deltaY = touch.clientY - startTouch.current.y
      
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)
      
      // Determine if it's a horizontal or vertical swipe
      if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
      
      startTouch.current = null
    }
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])
  
  return elementRef
}

// Custom hook for haptic feedback
export const useHaptic = () => {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }
  
  const lightTap = () => vibrate(10)
  const mediumTap = () => vibrate(50)
  const heavyTap = () => vibrate(100)
  const success = () => vibrate([50, 50, 50])
  const error = () => vibrate([100, 100, 100])
  const notification = () => vibrate([200, 100, 200])
  
  return { vibrate, lightTap, mediumTap, heavyTap, success, error, notification }
}

// Custom hook for voice guidance
export const useVoiceGuidance = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true)
    }
  }, [])
  
  const speak = (text: string, options?: {
    rate?: number
    pitch?: number
    volume?: number
    lang?: string
  }) => {
    if (!isSupported || !isEnabled) return
    
    // Cancel any ongoing speech
    speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options?.rate || 1
    utterance.pitch = options?.pitch || 1
    utterance.volume = options?.volume || 1
    utterance.lang = options?.lang || 'en-US'
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    speechRef.current = utterance
    speechSynthesis.speak(utterance)
  }
  
  const stop = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }
  
  const toggle = () => setIsEnabled(!isEnabled)
  
  return { isSupported, isEnabled, isSpeaking, speak, stop, toggle }
}

// Custom hook for offline support
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineData, setOfflineData] = useState<any>({})
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  const saveOfflineData = (key: string, data: any) => {
    try {
      const dataToSave = {
        ...data,
        timestamp: Date.now(),
        offline: true
      }
      localStorage.setItem(`offline_${key}`, JSON.stringify(dataToSave))
      setOfflineData(prev => ({ ...prev, [key]: dataToSave }))
    } catch (error) {
      console.error('Failed to save offline data:', error)
    }
  }
  
  const getOfflineData = (key: string) => {
    try {
      const data = localStorage.getItem(`offline_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get offline data:', error)
      return null
    }
  }
  
  const clearOfflineData = (key: string) => {
    localStorage.removeItem(`offline_${key}`)
    setOfflineData(prev => {
      const newData = { ...prev }
      delete newData[key]
      return newData
    })
  }
  
  return { isOnline, saveOfflineData, getOfflineData, clearOfflineData, offlineData }
}

// Custom hook for accessibility features
export const useAccessibility = () => {
  const [highContrast, setHighContrast] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  
  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
    
    setReducedMotion(prefersReducedMotion.matches)
    setHighContrast(prefersHighContrast.matches)
    
    // Load saved preferences
    const savedPrefs = localStorage.getItem('accessibility_prefs')
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      setHighContrast(prefs.highContrast || prefersHighContrast.matches)
      setLargeText(prefs.largeText || false)
      setReducedMotion(prefs.reducedMotion || prefersReducedMotion.matches)
      setScreenReader(prefs.screenReader || false)
    }
    
    // Detect screen reader
    const detectScreenReader = () => {
      return !!document.querySelector('[aria-live]') || 
             !!window.speechSynthesis || 
             navigator.userAgent.includes('NVDA') ||
             navigator.userAgent.includes('JAWS')
    }
    
    setScreenReader(detectScreenReader())
  }, [])
  
  const savePreferences = () => {
    const prefs = { highContrast, largeText, reducedMotion, screenReader }
    localStorage.setItem('accessibility_prefs', JSON.stringify(prefs))
  }
  
  useEffect(() => {
    savePreferences()
  }, [highContrast, largeText, reducedMotion, screenReader])
  
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    
    document.body.appendChild(announcement)
    announcement.textContent = message
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  return {
    highContrast,
    largeText,
    reducedMotion,
    screenReader,
    setHighContrast,
    setLargeText,
    setReducedMotion,
    setScreenReader,
    announceToScreenReader
  }
}

// Custom hook for progressive web app features
export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  const installApp = async () => {
    if (!deferredPrompt) return false
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstallable(false)
      return true
    }
    
    return false
  }
  
  return { isInstalled, isInstallable, installApp }
}

// Custom hook for performance monitoring
export const usePerformance = () => {
  const [performanceData, setPerformanceData] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  })
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          setPerformanceData(prev => ({
            ...prev,
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart
          }))
        }
        
        if (entry.entryType === 'measure') {
          if (entry.name === 'render') {
            setPerformanceData(prev => ({
              ...prev,
              renderTime: entry.duration
            }))
          }
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          setPerformanceData(prev => ({
            ...prev,
            interactionTime: entry.startTime
          }))
        }
      }
    })
    
    observer.observe({ entryTypes: ['navigation', 'measure', 'largest-contentful-paint'] })
    
    return () => observer.disconnect()
  }, [])
  
  const measureRender = (name: string, fn: () => void) => {
    performance.mark(`${name}-start`)
    fn()
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
  }
  
  return { performanceData, measureRender }
}

// Export all hooks
export {
  useMobileEnhancements,
  useSwipeGesture,
  useHaptic,
  useVoiceGuidance,
  useOfflineSupport,
  useAccessibility,
  usePWA,
  usePerformance
}