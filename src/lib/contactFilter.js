// Best-effort filter to stop off-platform personal-contact sharing in chat.
// NOT foolproof — it blocks the common/obvious patterns. Pair it with the
// database trigger (real server-side enforcement) and admin review.

const NUMBER_WORDS = ['zero', 'oh', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'double', 'triple']

const BLOCK_MSG = "To keep everyone safe, please don't share or ask for phone numbers, emails, or social media — keep all chats and sessions on Stuumo."

function block() { return { blocked: true, reason: BLOCK_MSG } }

export function detectContactShare(raw) {
  if (!raw) return { blocked: false }
  const text = String(raw)
  const lower = text.toLowerCase()

  // 1) Email (plain or obfuscated "name at gmail dot com")
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) return block()
  if (/[a-z0-9._%+-]+\s*(?:@|\(?\s*at\s*\)?|\[\s*at\s*\])\s*[a-z0-9.-]+\s*(?:\.|\(?\s*dot\s*\)?|\[\s*dot\s*\])\s*(?:com|net|org|io|co|gmail|yahoo|hotmail|outlook)/i.test(lower)) return block()

  // 2) Phone: any run containing 7+ digits (separators allowed)
  const runs = text.match(/\+?\d[\d\s().\-]{5,}\d/g) || []
  for (const r of runs) { if (r.replace(/\D/g, '').length >= 7) return block() }

  // 3) Spelled-out phone number (5+ number words)
  const words = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean)
  if (words.filter(w => NUMBER_WORDS.includes(w)).length >= 5) return block()

  // 4) Links to contact / social apps
  if (/(wa\.me|whatsapp\.com|chat\.whatsapp|t\.me|telegram\.me|m\.me|messenger\.com|snapchat\.com|instagram\.com|facebook\.com|fb\.com|tiktok\.com|skype:)/i.test(lower)) return block()

  // 5) Moving off-platform
  if (/\b(off|outside|away from)\b[^.!?\n]{0,12}\b(app|platform|stuumo|site|here)\b/i.test(lower)) return block()

  // 6) Intent to exchange contact details
  const APP = "(?:whats\\s?app|whatsapp|wsp|wtsp|telegram|\\btg\\b|signal|viber|imo|botim|snap(?:chat)?|insta(?:gram)?|\\big\\b|tiktok|facebook|\\bfb\\b|messenger|skype|gmail|e-?mail)"
  const PHONE = "(?:number|numbers|digits|phone|cell|mobile|contact|handle|\\bline\\b)"
  const VERB = "(?:send|share|give|drop|reach|call|text|\\bdm\\b|add|contact|message|your|my|here\\s+is|here's)"
  if (new RegExp(VERB + "\\b[^.!?\\n]{0,20}\\b" + APP, 'i').test(lower)) return block()
  if (new RegExp(VERB + "\\b[^.!?\\n]{0,15}\\b" + PHONE, 'i').test(lower)) return block()
  // "whatsapp me", "insta: xyz", "number is ..."
  if (new RegExp(APP + "\\b[^.!?\\n]{0,10}\\b(?:me|is|:|at)\\b", 'i').test(lower)) return block()
  // "find/follow me on instagram", "catch me on snap"
  if (new RegExp("\\b(?:me|us)\\b\\s+(?:on|at|via|through)\\s+" + APP, 'i').test(lower)) return block()

  return { blocked: false }
}
