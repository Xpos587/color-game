"use client";

import { useCallback, useReducer } from "react";
import type { GameScreen, GameMode, GameState, HSB, RoundResult } from "@/types/game";
import { randomHsb, randomPickerDefault } from "@/lib/color";

type Action =
  | { type: "START_GAME"; mode: GameMode }
  | { type: "SET_SCREEN"; screen: GameScreen }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "NEXT_COUNTDOWN" }
  | { type: "SET_TARGET"; hsb: HSB }
  | { type: "SET_PICKER"; hsb: HSB }
  | { type: "SUBMIT_ROUND"; playerHsb: HSB; score: number }
  | { type: "NEXT_ROUND" }
  | { type: "RESET" };

const TOTAL_ROUNDS = 5;
const EASY_TIME = 5;
const HARD_TIME = 2;

function getInitialState(): GameState {
  return {
    screen: "intro",
    mode: "easy",
    round: 0,
    totalRounds: TOTAL_ROUNDS,
    targetHsb: { h: 0, s: 0, b: 0 },
    pickerHsb: { h: 0, s: 0, b: 0 },
    roundScores: [],
    totalScore: 0,
    countdownStep: 0,
    memorizeTimeLeft: 0,
    isPlaying: false,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME": {
      const target = randomHsb();
      const pickerDefault = randomPickerDefault(target.h);
      return {
        ...getInitialState(),
        screen: "countdown",
        mode: action.mode,
        targetHsb: target,
        pickerHsb: pickerDefault,
        countdownStep: 0,
        isPlaying: true,
        round: 1,
      };
    }
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "NEXT_COUNTDOWN":
      return { ...state, countdownStep: state.countdownStep + 1 };
    case "SET_TARGET":
      return { ...state, targetHsb: action.hsb };
    case "SET_PICKER":
      return { ...state, pickerHsb: action.hsb };
    case "SUBMIT_ROUND": {
      const result: RoundResult = {
        targetHsb: state.targetHsb,
        playerHsb: action.playerHsb,
        score: action.score,
      };
      const newScores = [...state.roundScores, result];
      const newTotal = newScores.reduce((sum, r) => sum + r.score, 0);
      return {
        ...state,
        roundScores: newScores,
        totalScore: Math.round(newTotal * 100) / 100,
      };
    }
    case "NEXT_ROUND": {
      if (state.round >= state.totalRounds) {
        return { ...state, screen: "total" };
      }
      const target = randomHsb();
      const pickerDefault = randomPickerDefault(target.h);
      return {
        ...state,
        round: state.round + 1,
        targetHsb: target,
        pickerHsb: pickerDefault,
        countdownStep: 0,
        screen: "countdown",
      };
    }
    case "RESET":
      return getInitialState();
    default:
      return state;
  }
}

export function useGameLoop() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  const startGame = useCallback((mode: GameMode) => {
    dispatch({ type: "START_GAME", mode });
  }, []);

  const setScreen = useCallback((screen: GameScreen) => {
    dispatch({ type: "SET_SCREEN", screen });
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const nextCountdown = useCallback(() => {
    dispatch({ type: "NEXT_COUNTDOWN" });
  }, []);

  const setPicker = useCallback((hsb: HSB) => {
    dispatch({ type: "SET_PICKER", hsb });
  }, []);

  const submitRound = useCallback((playerHsb: HSB, score: number) => {
    dispatch({ type: "SUBMIT_ROUND", playerHsb, score });
  }, []);

  const nextRound = useCallback(() => {
    dispatch({ type: "NEXT_ROUND" });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const memorizeTime = state.mode === "easy" ? EASY_TIME : HARD_TIME;

  return {
    state,
    startGame,
    setScreen,
    setMode,
    nextCountdown,
    setPicker,
    submitRound,
    nextRound,
    resetGame,
    memorizeTime,
  };
}
