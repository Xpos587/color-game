import type { HSB, Lab, RGB } from "@/types/game"

/** HSB to RGB conversion */
export function hsbToRgb({ h, s, b }: HSB): RGB {
  const sN = s / 100
  const bN = b / 100
  const c = bN * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = bN - c

  let r1 = 0,
    g1 = 0,
    b1 = 0
  if (h < 60) {
    r1 = c
    g1 = x
  } else if (h < 120) {
    r1 = x
    g1 = c
  } else if (h < 180) {
    g1 = c
    b1 = x
  } else if (h < 240) {
    g1 = x
    b1 = c
  } else if (h < 300) {
    r1 = x
    b1 = c
  } else {
    r1 = c
    b1 = x
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

/** RGB to HSB conversion */
export function rgbToHsb({ r, g, b }: RGB): HSB {
  const rN = r / 255
  const gN = g / 255
  const bN = b / 255

  const max = Math.max(rN, gN, bN)
  const min = Math.min(rN, gN, bN)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === rN) h = 60 * (((gN - bN) / d) % 6)
    else if (max === gN) h = 60 * ((bN - rN) / d + 2)
    else h = 60 * ((rN - gN) / d + 4)
  }
  if (h < 0) h += 360

  const s = max === 0 ? 0 : (d / max) * 100
  const bVal = max * 100

  return { h: Math.round(h), s: Math.round(s), b: Math.round(bVal) }
}

/** RGB to hex string */
export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`
}

/** HSB to CSS color string */
export function hsbToCss(hsb: HSB): string {
  const { r, g, b } = hsbToRgb(hsb)
  return `rgb(${r}, ${g}, ${b})`
}

/** sRGB gamma correction */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** RGB to Lab (D65 white point) */
export function rgbToLab({ r, g, b }: RGB): Lab {
  const rL = srgbToLinear(r / 255)
  const gL = srgbToLinear(g / 255)
  const bL = srgbToLinear(b / 255)

  // XYZ
  let x = rL * 0.4124564 + gL * 0.3575761 + bL * 0.1804375
  let y = rL * 0.2126729 + gL * 0.7151522 + bL * 0.072175
  let z = rL * 0.0193339 + gL * 0.119192 + bL * 0.9503041

  // D65 reference
  x /= 0.95047
  y /= 1.0
  z /= 1.08883

  const f = (t: number) => (t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116)

  const fx = f(x)
  const fy = f(y)
  const fz = f(z)

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

/** Delta E 2000 (CIEDE2000) color difference */
export function deltaE2000(lab1: Lab, lab2: Lab): number {
  const { L: L1, a: a1, b: b1 } = lab1
  const { L: L2, a: a2, b: b2 } = lab2

  // Step 1: Calculate C'ab, h'ab
  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const CBar = (C1 + C2) / 2

  const CBar7 = CBar ** 7
  const G = 0.5 * (1 - Math.sqrt(CBar7 / (CBar7 + 25 ** 7)))

  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)

  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)

  let h1p = Math.atan2(b1, a1p) * (180 / Math.PI)
  if (h1p < 0) h1p += 360
  let h2p = Math.atan2(b2, a2p) * (180 / Math.PI)
  if (h2p < 0) h2p += 360

  // Step 2: Calculate ΔL', ΔC', ΔH'
  const dLp = L2 - L1
  const dCp = C2p - C1p

  let dhp: number
  if (C1p * C2p === 0) {
    dhp = 0
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360
  } else {
    dhp = h2p - h1p + 360
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * (Math.PI / 180))

  // Step 3: Calculate CIEDE2000
  const LBarp = (L1 + L2) / 2
  const CBarp = (C1p + C2p) / 2

  let hBarp: number
  if (C1p * C2p === 0) {
    hBarp = h1p + h2p
  } else if (Math.abs(h1p - h2p) <= 180) {
    hBarp = (h1p + h2p) / 2
  } else if (h1p + h2p < 360) {
    hBarp = (h1p + h2p + 360) / 2
  } else {
    hBarp = (h1p + h2p - 360) / 2
  }

  const T =
    1 -
    0.17 * Math.cos((hBarp - 30) * (Math.PI / 180)) +
    0.24 * Math.cos(2 * hBarp * (Math.PI / 180)) +
    0.32 * Math.cos((3 * hBarp + 6) * (Math.PI / 180)) -
    0.2 * Math.cos((4 * hBarp - 63) * (Math.PI / 180))

  const SL = 1 + (0.015 * (LBarp - 50) * (LBarp - 50)) / Math.sqrt(20 + (LBarp - 50) * (LBarp - 50))
  const SC = 1 + 0.045 * CBarp
  const SH = 1 + 0.015 * CBarp * T

  const dTheta = 30 * Math.exp(-(((hBarp - 275) / 25) ** 2))
  const CBarp7 = CBarp ** 7
  const RC = 2 * Math.sqrt(CBarp7 / (CBarp7 + 25 ** 7))
  const RT = -Math.sin(2 * dTheta * (Math.PI / 180)) * RC

  const dE = Math.sqrt(
    (dLp / SL) * (dLp / SL) +
      (dCp / SC) * (dCp / SC) +
      (dHp / SH) * (dHp / SH) +
      RT * (dCp / SC) * (dHp / SH),
  )

  return dE
}

/** Calculate score for a round */
export function calculateScore(target: HSB, player: HSB): number {
  const targetRgb = hsbToRgb(target)
  const playerRgb = hsbToRgb(player)
  const targetLab = rgbToLab(targetRgb)
  const playerLab = rgbToLab(playerRgb)

  const dE = deltaE2000(targetLab, playerLab)

  // Base score
  const base = 10 / (1 + (dE / 25.25) ** 1.55)

  // Hue accuracy bonus (power curve, not linear)
  const hueDiff = Math.min(Math.abs(target.h - player.h), 360 - Math.abs(target.h - player.h))
  const avgSat = (target.s + player.s) / 2
  const hueAcc = Math.max(0, 1 - (hueDiff / 25) ** 1.5)
  const satWeightR = Math.min(1, avgSat / 30)
  const recovery = (10 - base) * hueAcc * satWeightR * 0.25

  // Hue penalty for large hue differences
  const huePenFactor = Math.max(0, (hueDiff - 30) / 150)
  const satWeightP = Math.min(1, avgSat / 40)
  const penalty = base * huePenFactor * satWeightP * 0.15

  const raw = base + recovery - penalty
  const jitter = raw < 9.8 ? (Math.random() - 0.5) * 0.08 : 0
  return Math.max(0, Math.min(10, Math.round((raw + jitter) * 100) / 100))
}

/** Get feedback text based on score — 2 options per range, deterministic pick */
export function getScoreFeedback(score: number): string {
  const pairs: [number, string, string][] = [
    [
      10.0,
      "You're either cheating or broken. Either way, we're concerned.",
      "Perfect. Literally perfect. We have questions.",
    ],
    [9.8, "Off by a pixel. We're disturbed, not impressed.", "That's so close it's creepy."],
    [
      9.6,
      "Photographic memory. Still not a personality trait.",
      "Are you a Pantone swatch in human form? Seek help.",
    ],
    [9.4, "A superpower nobody asked for.", "Were you even blinking? Blink. Please blink."],
    [
      9.2,
      "You remembered that color like it owed you money.",
      "Your brain took a photograph. What a waste of talent.",
    ],
    [9.0, "Impressive. And nobody cares.", "Disgustingly accurate. It's off-putting."],
    [
      8.8,
      "Congrats, your cones work. Don't make it a personality.",
      "Unsettling precision. Take it down a notch.",
    ],
    [8.6, "Weirdly good. Suspiciously good.", "That kind of accuracy makes people uncomfortable."],
    [
      8.4,
      "That was good. Don't expect a trophy.",
      "People don't like playing games with you, do they.",
    ],
    [8.2, "Your visual cortex woke up for this one. Finally.", "A small gift. Emphasis on small."],
    [8.0, "Be honest. Did you cheat?", "Annoyingly close. Nobody likes a try-hard."],
    [
      7.8,
      "You have color memory. A questionable amount of it.",
      "Careful, you're almost impressing someone.",
    ],
    [7.6, "Genuinely decent. We're as surprised as you are.", "Lucky guess? It was a lucky guess."],
    [
      7.4,
      "Don't let this go to your head. It will.",
      "Your rods and cones are doing the bare minimum.",
    ],
    [
      7.2,
      "You paid attention. Not great attention, but attention.",
      "Solid. In the way that concrete is solid. And equally exciting.",
    ],
    [7.0, "Suspiciously decent. Probably a fluke.", "Okay. Don't get cocky."],
    [
      6.8,
      "The vibes are right. The execution needs therapy.",
      "Approaching respectability. Still approaching.",
    ],
    [
      6.6,
      "Okay, it wasn't terrible. Don't let it go to your head.",
      "Competence is creeping in. Slowly. Reluctantly.",
    ],
    [
      6.4,
      "Above average. Your mother would be underwhelmed.",
      "Adequate. Frame that word and hang it on your wall.",
    ],
    [
      6.2,
      "Not bad. Not good, either. Let's not celebrate.",
      "You got the gist. The gist is all you got.",
    ],
    [6.0, "Getting somewhere. Don't get excited — slowly.", "Fine. That was fine. Just fine."],
    [5.8, "You can see the shore from here. Don't drown.", "A noble attempt. Emphasis on attempt."],
    [
      5.6,
      "The score equivalent of elevator music.",
      "Hovering in 'not embarrassing' territory. Barely.",
    ],
    [
      5.4,
      "Not terrible. Not good. Not anything, really.",
      "Your color memory is as unremarkable as it gets.",
    ],
    [5.2, "A solid 'meh.' And 'meh' isn't a compliment.", "Treading water in the sea of adequacy."],
    [5.0, "Perfectly, boringly, depressingly average.", "The exact score where we stop caring."],
    [
      4.8,
      "Almost passable. That 'almost' is doing heavy lifting.",
      "Approaching decent. Very slowly.",
    ],
    [
      4.6,
      "Right in the fat middle of mediocrity.",
      "Dead center of the bell curve. How does it feel?",
    ],
    [4.4, "The human equivalent of a shrug.", "Even your score looks bored."],
    [4.2, "Violently average.", "Peak mediocrity. You've arrived."],
    [
      4.0,
      "The beige of scores. Functional. Forgettable.",
      "Four out of ten. Room temperature performance.",
    ],
    [3.8, "You can smell mediocrity from here.", "We expected nothing and you still surprised us."],
    [
      3.6,
      "You have the color recall of a concussed goldfish.",
      "Your brain stored the color at 144p.",
    ],
    [
      3.4,
      "Close only counts in horseshoes. This is not horseshoes.",
      "Was that a guess or your best work? Don't answer that.",
    ],
    [
      3.2,
      "You got the general mood. The general mood of a different color.",
      "If squinting were a score, this would be it.",
    ],
    [
      3.0,
      "You answered 'blue' on a color test. Every question was red.",
      "Three out of ten. You remembered the concept of color. That's about it.",
    ],
    [
      2.8,
      "Reliably terrible. There's something to be said for consistency.",
      "At least you're consistent. Consistently off.",
    ],
    [
      2.6,
      "You're giving 'I don't see color' a whole new meaning.",
      "Color blindness would actually explain a lot right now.",
    ],
    [
      2.4,
      "The confidence of someone who thinks they aced it.",
      "You look like you feel good about this. You shouldn't.",
    ],
    [
      2.2,
      "A colorblind dog would have gotten closer.",
      "You memorized vibes, not colors. It didn't work.",
    ],
    [
      2.0,
      "Did something happen during the memorize phase? Be honest.",
      "Two seconds of looking. Zero seconds of remembering.",
    ],
    [
      1.8,
      "You remembered a color. Just not this one.",
      "You brought the wrong answer to the right question.",
    ],
    [
      1.6,
      "The color equivalent of boarding the wrong flight.",
      "You walked into the wrong room and sat down with confidence.",
    ],
    [
      1.4,
      "Not even the same zip code. Or state.",
      "The gap between what you saw and what you picked is measurable in light-years.",
    ],
    [1.2, "Boldly, catastrophically wrong.", "Wrong with conviction. We respect the confidence."],
    [1.0, "You had to work hard to be this wrong.", "Maximum effort. Minimum accuracy."],
    [
      0.8,
      "That's not even the right continent of color.",
      "You went left. The color went right. Into a different dimension.",
    ],
    [0.6, "Your retinas filed a complaint.", "Somewhere, a color is pressing charges."],
    [
      0.4,
      "This is what quitting looks like in color form.",
      "You didn't guess a color. You guessed a vibe. A wrong vibe.",
    ],
    [
      0.0,
      "A random number generator would be embarrassed for you.",
      "This score is a cry for help disguised as gameplay.",
    ],
  ]

  for (const [threshold, a, b] of pairs) {
    if (score >= threshold) {
      // Deterministic pick based on score decimal
      const idx = Math.floor(score * 100) % 2
      return idx === 0 ? a : b
    }
  }

  return "This score shouldn't exist. We're investigating."
}

/** Get total score feedback text */
export function getTotalFeedback(score: number): string {
  const pairs: [number, string, string][] = [
    [
      50,
      "Perfect score. You've peaked. It's all downhill from here. Tell everyone.",
      "Fifty out of fifty. Either you're inhuman or you cheated. We'll allow both.",
    ],
    [
      48,
      "Suspiciously accurate. We're going to need to see your browser history.",
      "One point from perfect. That one point will haunt you forever.",
    ],
    [
      46,
      "Tetrachromat or obsessive? Either way, maybe go outside.",
      "Okay, this is actually good. We hate admitting that.",
    ],
    [
      44,
      "Genuinely unsettling accuracy. Please find a hobby.",
      "Alright, we see you. Don't make it weird.",
    ],
    [42, "Annoyingly good. It doesn't make you interesting, though.", "We'll allow it. Barely."],
    [
      40,
      "Okay, you're not terrible. Don't let it go to your head.",
      "Competent. The most boring compliment in the English language.",
    ],
    [
      38,
      "You have functioning eyes. That's about all we can confirm.",
      "Not bad. Not good. Not anything, really.",
    ],
    [
      36,
      "Fine. The word 'fine' was invented for scores like this.",
      "Above average. Nobody will be impressed by 'above average.'",
    ],
    [
      34,
      "Decent. In the way that gas station coffee is decent.",
      "You can see colors. Congrats on meeting the minimum bar for having eyes.",
    ],
    [
      32,
      "Almost respectable. Almost. Don't get comfortable.",
      "The 'I tried' of scores. Nobody asked if you tried.",
    ],
    [
      30,
      "Your confidence does not match your ability. At all.",
      "You peaked in the tutorial. It was all downhill from there.",
    ],
    [
      28,
      "Not embarrassing. But definitely nothing to mention. Ever.",
      "The participation trophy of scores.",
    ],
    [
      26,
      "Mediocre. The off-white of achievement. The eggshell of ambition.",
      "Aggressively mid. You are the room temperature of color perception.",
    ],
    [
      24,
      "Painfully average. The human beige of performance.",
      "Halfway to perfect. Which means halfway to zero.",
    ],
    [22, "Not the worst we've seen. But we had to scroll.", "Your monitor is fine. You are not."],
    [
      20,
      "You call teal 'blue' and magenta 'pink,' don't you.",
      "This score has the energy of someone who microwaves salad.",
    ],
    [
      18,
      "You see the world in 4 colors and 3 of them are wrong.",
      "Not even close. Like, geographically not close. Different continent.",
    ],
    [
      16,
      "The human equivalent of a corrupted JPEG.",
      "A random number generator would outscore you. Let that sink in.",
    ],
    [
      14,
      "Somewhere, a color wheel is drafting a cease and desist.",
      "You looked at colors and chose violence.",
    ],
    [
      12,
      "Your eyes are open. That's the only positive takeaway.",
      "You are living proof that eyes are wasted on some people.",
    ],
    [
      10,
      "You didn't play the game. The game played you.",
      "If this were a school test, they'd call your parents.",
    ],
    [
      8,
      "A golden retriever pawing at the screen would outscore you. They're colorblind.",
      "A blindfolded toddler smashing the screen would have outperformed you.",
    ],
    [
      6,
      "We showed you colors. You showed us pain.",
      "Genuinely impressive how wrong you were. That takes commitment.",
    ],
    [
      4,
      "This isn't a score. It's a cry for help.",
      "Your brain didn't forget the colors. It actively sabotaged you.",
    ],
    [
      2,
      "Historic. The worst score we've ever recorded. Screenshot it. Frame it.",
      "You have the color memory of a potato. A colorblind, concussed potato.",
    ],
    [
      0,
      "We didn't know a score this low was possible. Engineers have been notified.",
      "This score shouldn't exist. We're investigating.",
    ],
  ]

  for (const [threshold, a, b] of pairs) {
    if (score >= threshold) {
      const idx = Math.floor(score) % 2
      return idx === 0 ? a : b
    }
  }

  return "This score shouldn't exist. We're investigating."
}

/** Generate a random HSB color for the game */
export function randomHsb(): HSB {
  return {
    h: Math.floor(Math.random() * 360),
    s: 15 + Math.floor(Math.random() * 86),
    b: 15 + Math.floor(Math.random() * 86),
  }
}

/** Generate a random picker default at least 60° away from target */
/** Check if a color is light enough to need dark text */
export function textColorForBg(hsb: HSB): string {
  const { r, g, b } = hsbToRgb(hsb)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.45 ? "#000" : "#fff"
}

export function labelColorForBg(hsb: HSB): string {
  const { r, g, b } = hsbToRgb(hsb)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.45 ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"
}

export function randomPickerDefault(targetH: number): HSB {
  let h: number
  do {
    h = Math.floor(Math.random() * 360)
  } while (Math.abs(h - targetH) < 60 || Math.abs(h - targetH) > 300)

  return {
    h,
    s: 30 + Math.floor(Math.random() * 61),
    b: 40 + Math.floor(Math.random() * 51),
  }
}
