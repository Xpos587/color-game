"use client"

import { useEffect } from "react"

export function useMountEffect(effect: () => undefined | (() => void)) {
  // eslint-disable-next-line no-restricted-syntax, react-hooks/exhaustive-deps
  useEffect(effect, [effect])
}
