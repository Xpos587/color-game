"use client";

import { useCallback } from "react";
import * as sfx from "@/lib/sound";

export function useSound() {
  const get = useCallback(() => sfx, []);

  return {
    init: useCallback(() => {}, []),
    isReady: true,
    hover: useCallback(() => get().hover(), [get]),
    click: useCallback(() => get().click(), [get]),
    soloHover: useCallback(() => get().soloHover(), [get]),
    soloClick: useCallback(() => get().soloClick(), [get]),
    soloClickSound: useCallback(() => get().soloClickSound(), [get]),
    multiHover: useCallback(() => get().multiHover(), [get]),
    multiClick: useCallback(() => get().multiClick(), [get]),
    multiClickSound: useCallback(() => get().multiClickSound(), [get]),
    tick: useCallback(() => get().tick(), [get]),
    keystroke: useCallback(() => get().keystroke(), [get]),
    hardOn: useCallback(() => get().hardOn(), [get]),
    hardOff: useCallback(() => get().hardOff(), [get]),
    toDark: useCallback(() => get().toDark(), [get]),
    toLight: useCallback(() => get().toLight(), [get]),
    blipReady: useCallback(() => get().blipReady(), [get]),
    blipGo: useCallback(() => get().blipGo(), [get]),
    sliderTick: useCallback((v: number) => get().sliderTick(v), [get]),
    sliderReset: useCallback(() => get().sliderReset(), [get]),
    soloHumStart: useCallback(() => get().soloHumStart(), [get]),
    soloHumUpdate: useCallback((speed: number, max: number) => get().soloHumUpdate(speed, max), [get]),
    soloHumStop: useCallback(() => get().soloHumStop(), [get]),
    multiHumStart: useCallback(() => get().multiHumStart(), [get]),
    multiHumUpdate: useCallback((speed: number, max: number) => get().multiHumUpdate(speed, max), [get]),
    multiHumStop: useCallback(() => get().multiHumStop(), [get]),
    flutterStart: useCallback(() => get().flutterStart(), [get]),
    flutterUpdate: useCallback((progress: number) => get().flutterUpdate(progress), [get]),
    flutterStop: useCallback(() => get().flutterStop(), [get]),
    scoreTick: useCallback((progress: number, isInt: boolean) => get().scoreTick(progress, isInt), [get]),
    scoreLand: useCallback(() => get().scoreLand(), [get]),
    goLock: useCallback(() => get().goLock(), [get]),
    startPlaying: useCallback(() => get().startPlaying(), [get]),
    dismiss: useCallback(() => get().dismiss(), [get]),
    tabFlick: useCallback(() => get().tabFlick(), [get]),
    creditHumStart: useCallback(() => get().creditHumStart(), [get]),
    creditHumStop: useCallback(() => get().creditHumStop(), [get]),
    tileFlip: useCallback((index: number) => get().tileFlip(index), [get]),
    dailyDroneStart: useCallback(() => get().dailyDroneStart(), [get]),
    dailyDroneStop: useCallback(() => get().dailyDroneStop(), [get]),
    challengeSend: useCallback(() => get().challengeSend(), [get]),
    robotCopied: useCallback(() => get().robotCopied(), [get]),
    robotSolo: useCallback(() => get().robotSolo(), [get]),
    robotMulti: useCallback(() => get().robotMulti(), [get]),
    robotEasy: useCallback(() => get().robotEasy(), [get]),
    robotHardcore: useCallback(() => get().robotHardcore(), [get]),
    robotHighscores: useCallback(() => get().robotHighscores(), [get]),
    robotDaily: useCallback(() => get().robotDaily(), [get]),
  };
}
