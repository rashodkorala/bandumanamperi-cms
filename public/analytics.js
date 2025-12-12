/**
 * Analytics Tracking Script
 * Add this to your frontend websites to track page views and events
 * 
 * Usage:
 * <script src="https://your-cms-domain.com/analytics.js"></script>
 * <script>
 *   window.CMSAnalytics.init({
 *     apiUrl: 'https://your-cms-domain.com/api/analytics/track',
 *     domain: 'www.rashodkorala.com' // or 'photos.rashodkorala.com'
 *   });
 * </script>
 */

(function () {
  "use strict"

  // Generate or retrieve session ID
  function getSessionId() {
    const key = "cms_session_id"
    let sessionId = sessionStorage.getItem(key)
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem(key, sessionId)
    }
    return sessionId
  }

  // Detect device type
  function detectDevice() {
    const ua = navigator.userAgent.toLowerCase()
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet"
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile"
    }
    return "desktop"
  }

  // Track page view
  function trackPageView(config) {
    const data = {
      eventType: "pageview",
      domain: config.domain || window.location.hostname,
      path: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      deviceType: detectDevice(),
      screenWidth: window.screen?.width || null,
      screenHeight: window.screen?.height || null,
      sessionId: getSessionId(),
      userId: config.userId || null, // Optional: pass userId if using API key
    }

    const headers = {
      "Content-Type": "application/json",
    }

    // Add API key if provided
    if (config.apiKey) {
      headers["x-api-key"] = config.apiKey
    }

    fetch(config.apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
      credentials: "include", // Include cookies for authentication
    }).catch((error) => {
      console.error("Analytics tracking error:", error)
    })
  }

  // Track custom event
  function trackEvent(eventName, metadata, config) {
    const data = {
      eventType: "custom",
      domain: config.domain || window.location.hostname,
      path: window.location.pathname,
      sessionId: getSessionId(),
      userId: config.userId || null,
      metadata: {
        eventName: eventName,
        ...metadata,
      },
    }

    const headers = {
      "Content-Type": "application/json",
    }

    // Add API key if provided
    if (config.apiKey) {
      headers["x-api-key"] = config.apiKey
    }

    fetch(config.apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
      credentials: "include",
    }).catch((error) => {
      console.error("Analytics tracking error:", error)
    })
  }

  // Initialize analytics
  function init(config) {
    if (!config || !config.apiUrl || !config.domain) {
      console.error("CMS Analytics: Missing required config (apiUrl, domain)")
      return
    }

    // Store config globally for use in trackEvent
    window._cmsAnalyticsConfig = config

    // Track initial page view
    trackPageView(config)

    // Track page views on navigation (for SPAs)
    if (typeof window !== "undefined" && window.history) {
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function () {
        originalPushState.apply(history, arguments)
        setTimeout(() => trackPageView(config), 0)
      }

      history.replaceState = function () {
        originalReplaceState.apply(history, arguments)
        setTimeout(() => trackPageView(config), 0)
      }

      window.addEventListener("popstate", () => {
        setTimeout(() => trackPageView(config), 0)
      })
    }
  }

  // Wrapper for trackEvent that uses stored config
  function trackEventWithConfig(eventName, metadata) {
    const config = window._cmsAnalyticsConfig
    if (!config) {
      console.error("CMS Analytics: Not initialized. Call init() first.")
      return
    }
    trackEvent(eventName, metadata, config)
  }

  // Expose API
  if (typeof window !== "undefined") {
    window.CMSAnalytics = {
      init: init,
      trackEvent: trackEventWithConfig,
      trackPageView: (config) => trackPageView(config || window._cmsAnalyticsConfig),
    }
  }
})()

