// ── XSS Sanitization Utilities ──
// Sanitize user-generated text content before storing in DB

// HTML entity encode dangerous characters
const DANGEROUS_CHARS: [RegExp, string][] = [
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#x27;'],
  [/`/g, '&#96;'],
]

// More aggressive: strip ALL tags and dangerous content
const STRIP_TAGS_REGEX = /<[^>]*>/g
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const EVENT_HANDLER_REGEX = /\bon\w+\s*=\s*["'][^"']*["']/gi
const JAVASCRIPT_REGEX = /javascript\s*:/gi
const DATA_URI_REGEX = /data\s*:\s*text\/html/gi

/**
 * Basic sanitization: encode dangerous HTML characters
 * Use for: short text fields like names, titles, categories
 */
export function sanitizeBasic(input: string): string {
  let sanitized = input
  for (const [regex, replacement] of DANGEROUS_CHARS) {
    sanitized = sanitized.replace(regex, replacement)
  }
  return sanitized.trim()
}

/**
 * Full sanitization: strip all HTML tags and dangerous patterns
 * Use for: descriptions, messages, user-generated rich text
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  let sanitized = input
  // Remove script tags first
  sanitized = sanitized.replace(SCRIPT_REGEX, '')
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(EVENT_HANDLER_REGEX, '')
  // Remove javascript: URIs
  sanitized = sanitized.replace(JAVASCRIPT_REGEX, '')
  // Remove data:text/html URIs
  sanitized = sanitized.replace(DATA_URI_REGEX, '')
  // Remove remaining HTML tags
  sanitized = sanitized.replace(STRIP_TAGS_REGEX, '')
  // Encode any remaining dangerous chars
  sanitized = sanitizeBasic(sanitized)
  return sanitized
}

/**
 * URL sanitization: validate and clean URLs
 * Only allows http, https protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  // Remove whitespace and control characters
  const cleaned = url.trim().replace(/[\x00-\x1F\x7F]/g, '')
  // Only allow http/https protocols
  if (/^(https?:\/\/)/i.test(cleaned)) {
    return cleaned
  }
  // If no protocol, it might be a relative URL
  if (/^\/\//.test(cleaned)) {
    return 'https:' + cleaned
  }
  return ''
}

/**
 * Sanitize store/product description - allows basic formatting but no scripts
 */
export function sanitizeDescription(input: string): string {
  return sanitizeHtml(input).slice(0, 1000)
}
