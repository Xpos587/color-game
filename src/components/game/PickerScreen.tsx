"use client"

import { useCallback, useState } from "react"
import { HsbStrip } from "@/components/picker/HsbStrip"
import type { useSound } from "@/hooks/useSound"
import { hsbToCss } from "@/lib/color"
import type { HSB } from "@/types/game"

interface PickerScreenProps {
  pickerHsb: HSB
  onPickerChange: (hsb: HSB) => void
  onSubmit: () => void
  round: number
  totalRounds: number
  sound: ReturnType<typeof useSound>
}

export function PickerScreen({
  pickerHsb,
  onPickerChange,
  onSubmit,
  round,
  totalRounds,
  sound,
}: PickerScreenProps) {
  const [activeChannel, setActiveChannel] = useState<string | null>(null)

  const handleHueChange = useCallback(
    (h: number) => {
      onPickerChange({ ...pickerHsb, h })
      sound.sliderTick(h)
    },
    [pickerHsb, onPickerChange, sound],
  )

  const handleSatChange = useCallback(
    (s: number) => {
      onPickerChange({ ...pickerHsb, s })
      sound.sliderTick(s)
    },
    [pickerHsb, onPickerChange, sound],
  )

  const handleBriChange = useCallback(
    (b: number) => {
      onPickerChange({ ...pickerHsb, b })
      sound.sliderTick(b)
    },
    [pickerHsb, onPickerChange, sound],
  )

  const handleDragStart = useCallback(
    (channel: string) => {
      setActiveChannel(channel)
      sound.sliderReset()
      setTimeout(() => setActiveChannel(null), 500)
    },
    [sound],
  )

  return (
    <div className="relative h-full w-full">
      {/* Background color */}
      <div
        className="absolute inset-0"
        style={{ background: hsbToCss(pickerHsb), transition: "background 0.08s" }}
      />

      {/* Strip container — left-aligned, CSS handles slide-in */}
      <div className="strip-container">
        <div className="strip">
          <HsbStrip
            type="hue"
            value={pickerHsb.h}
            onChange={handleHueChange}
            onDragStart={() => handleDragStart("hue")}
            onDragEnd={() => {}}
          />
        </div>
        <div className="strip">
          <HsbStrip
            type="saturation"
            value={pickerHsb.s}
            hue={pickerHsb.h}
            onChange={handleSatChange}
            onDragStart={() => handleDragStart("saturation")}
            onDragEnd={() => {}}
          />
        </div>
        <div className="strip">
          <HsbStrip
            type="brightness"
            value={pickerHsb.b}
            hue={pickerHsb.h}
            onChange={handleBriChange}
            onDragStart={() => handleDragStart("brightness")}
            onDragEnd={() => {}}
          />
        </div>
      </div>

      {/* Picker info — fade in with delay */}
      <div className="picker-info-fade picker-info">
        {/* "Your selection" label */}
        <div
          className="picker-label pointer-events-none absolute z-20"
          style={{
            bottom: "62px",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "19px",
            letterSpacing: "-0.24px",
            opacity: 0.5,
            transition: "color 0.15s",
          }}
        >
          Your selection
        </div>

        {/* HSB values */}
        <div
          className="picker-values pointer-events-none absolute z-20"
          style={{
            bottom: "44px",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "19px",
            letterSpacing: "-0.24px",
            transition: "color 0.15s",
          }}
        >
          H{pickerHsb.h} S{pickerHsb.s} B{pickerHsb.b}
        </div>
      </div>

      {/* Round indicator */}
      <div
        className="picker-round pointer-events-none absolute z-20"
        style={{
          fontFamily: "inherit",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "19px",
          letterSpacing: "1.92px",
          color: "#fff",
        }}
      >
        {round}/{totalRounds}
      </div>

      {/* Watermark */}
      <div
        className="picker-watermark pointer-events-none absolute z-20"
        style={{
          top: "30px",
          right: "30px",
          fontSize: "14px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "-0.56px",
          lineHeight: 1,
        }}
      >
        Dialed.gg
      </div>

      {/* Channel label */}
      <div
        className="picker-channel pointer-events-none absolute z-20"
        style={{
          bottom: "30px",
          left: "143px",
          fontSize: "12px",
          fontWeight: 500,
          lineHeight: "19px",
          letterSpacing: "1.92px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
          opacity: activeChannel ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        {activeChannel === "hue" && "HUE"}
        {activeChannel === "saturation" && "SATURATION"}
        {activeChannel === "brightness" && "BRIGHTNESS"}
      </div>

      {/* Go button — fade in with delay */}
      <div className="picker-go-fade">
        <button onClick={onSubmit} onMouseEnter={() => sound.hover()} className="go-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 5.75L20.25 12L14 18.25"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.5 12H3.75"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
