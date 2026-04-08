"use client";

import { useCallback, useState } from "react";
import { useMountEffect } from "@/lib/useMountEffect";
import { GameShell } from "@/components/game/GameShell";
import { Screen } from "@/components/game/Screen";
import { IntroScreen } from "@/components/game/IntroScreen";
import { CountdownController } from "@/components/game/CountdownController";
import { MemorizeScreen } from "@/components/game/MemorizeScreen";
import { PickerScreen } from "@/components/game/PickerScreen";
import { ResultScreen } from "@/components/game/ResultScreen";
import { TotalScreen } from "@/components/game/TotalScreen";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useSound } from "@/hooks/useSound";
import { calculateScore } from "@/lib/color";

export default function Home() {
  const {
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
  } = useGameLoop();

  const sound = useSound();

  // Rule 4: mount-only one-time external sync (font loading)
  useMountEffect(() => {
    const reveal = () => document.body.classList.add("fonts-ready");
    document.fonts?.ready?.then(reveal);
    const timeout = setTimeout(reveal, 2000);
    return () => clearTimeout(timeout);
  });

  const fadeActive = state.screen === "fade-to-black";
  const [startFade, setStartFade] = useState(false);

  // Handle memorize timer expiry
  const handleMemorizeTimeUp = useCallback(() => {
    if (state.mode === "hard") {
      setScreen("fade-to-black");
      setTimeout(() => setScreen("picker"), 1000);
    } else {
      setScreen("picker");
    }
  }, [state.mode, setScreen]);

  // Handle picker submit
  const handlePickerSubmit = useCallback(() => {
    const score = calculateScore(state.targetHsb, state.pickerHsb);
    submitRound(state.pickerHsb, score);
    sound.goLock();
    setScreen("result");
  }, [state.targetHsb, state.pickerHsb, submitRound, setScreen, sound]);

  // Handle result continue
  const handleResultNext = useCallback(() => {
    sound.click();
    nextRound();
  }, [nextRound, sound]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    sound.click();
    resetGame();
  }, [resetGame, sound]);

  // Handle mode change on intro
  const handleModeChange = useCallback(
    (mode: "easy" | "hard") => {
      if (mode === "hard") {
        sound.hardOn();
        sound.robotHardcore();
      } else {
        sound.hardOff();
        sound.robotEasy();
      }
      setMode(mode);
    },
    [sound, setMode]
  );

  // Handle play from intro
  const handlePlay = useCallback(() => {
    sound.soloClickSound();
    sound.robotSolo();
    // Fade overlay fast → show countdown behind it → remove overlay
    setStartFade(true);
    setTimeout(() => {
      startGame(state.mode);
      setTimeout(() => sound.startPlaying(), 100);
      setTimeout(() => setStartFade(false), 80);
    }, 420);
  }, [sound, startGame, state.mode]);

  // Get the latest round score for result screen
  const currentRoundScore =
    state.roundScores.length > 0
      ? state.roundScores[state.roundScores.length - 1]
      : null;

  return (
    <main className="h-full">
      <GameShell fadeActive={fadeActive || startFade} fastFade={startFade}>
        <Screen id="intro" isActive={state.screen === "intro"}>
          <IntroScreen
            mode={state.mode}
            onModeChange={handleModeChange}
            onPlay={handlePlay}
            sound={sound}
          />
        </Screen>

        <Screen id="countdown" isActive={state.screen === "countdown"}>
          {state.screen === "countdown" && (
            <CountdownController
              key={state.round}
              step={state.countdownStep}
              mode={state.mode}
              targetHsb={state.targetHsb}
              nextCountdown={nextCountdown}
              setScreen={setScreen}
              sound={sound}
            />
          )}
        </Screen>

        <Screen id="memorize" isActive={state.screen === "memorize"}>
          {state.screen === "memorize" && (
            <MemorizeScreen
              targetHsb={state.targetHsb}
              round={state.round}
              totalRounds={state.totalRounds}
              timeLimit={memorizeTime}
              onTimeUp={handleMemorizeTimeUp}
              sound={sound}
            />
          )}
        </Screen>

        <Screen id="fade-to-black" isActive={state.screen === "fade-to-black"}>
          <div className="flex h-full w-full bg-black" />
        </Screen>

        <Screen id="picker" isActive={state.screen === "picker"}>
          <PickerScreen
            pickerHsb={state.pickerHsb}
            onPickerChange={setPicker}
            onSubmit={handlePickerSubmit}
            round={state.round}
            totalRounds={state.totalRounds}
            sound={sound}
          />
        </Screen>

        <Screen id="result" isActive={state.screen === "result"}>
          {currentRoundScore && (
            <ResultScreen
              targetHsb={currentRoundScore.targetHsb}
              playerHsb={currentRoundScore.playerHsb}
              score={currentRoundScore.score}
              round={state.round}
              totalRounds={state.totalRounds}
              onNext={handleResultNext}
              sound={sound}
            />
          )}
        </Screen>

        <Screen id="total" isActive={state.screen === "total"}>
          <TotalScreen
            totalScore={state.totalScore}
            roundScores={state.roundScores}
            onPlayAgain={handlePlayAgain}
            sound={sound}
          />
        </Screen>
      </GameShell>
    </main>
  );
}
