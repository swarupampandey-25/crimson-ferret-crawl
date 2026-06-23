import React, { useState, useEffect, useRef } from "react";
import { useDpp } from "../context/DppContext";
import { Play, Pause, RotateCcw, Timer, Award, Sparkles, Brain } from "lucide-react";
import { showSuccess } from "@/utils/toast";

export const PomodoroTimer: React.FC = () => {
  const { addFocusedMinutes, studyStats } = useDpp();
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"Work" | "Break">("Work");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode]);

  const handleSessionComplete = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mode === "Work") {
      addFocusedMinutes(25);
      showSuccess("Excellent concentration! Rest for 5 minutes.");
      setMode("Break");
      setTimeLeft(300); // 5 minutes break
    } else {
      showSuccess("Break over! Ready to lock back in?");
      setMode("Work");
      setTimeLeft(1500);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "Work" ? 1500 : 300);
  };

  const setCustomTime = (minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  };

  const formatDisplayTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Progress percentage calculation
  const totalSeconds = mode === "Work" ? 1500 : 300;
  const progressPercent = Math.min(100, ((totalSeconds - timeLeft) / totalSeconds) * 100);

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-3">
        <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <Brain className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          Zen Concentration Hub
        </h3>
      </div>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        Maximize cognitive retention by dividing your solving sprint into 25-minute Pomodoro sections.
      </p>

      {/* GLOWING ROUNDED TIMER VIEW */}
      <div className="relative w-44 h-44 flex items-center justify-center rounded-full border-4 border-slate-900/80 shadow-inner mb-6 bg-slate-900/30">
        {/* Animated Background Progress Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="80"
            className="stroke-slate-800/60"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="88"
            cy="88"
            r="80"
            className="stroke-emerald-400 transition-all duration-300"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={502.4}
            strokeDashoffset={502.4 - (502.4 * progressPercent) / 100}
          />
        </svg>

        <div className="z-10">
          <div className="text-3xl font-black font-mono text-emerald-300 leading-none mb-1">
            {formatDisplayTime(timeLeft)}
          </div>
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
            {mode === "Work" ? "Focus Session" : "Intermission"}
          </span>
        </div>
      </div>

      {/* TIMINGS PRESET BUTTONS */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setCustomTime(25)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-300 rounded-lg"
        >
          25 min focus
        </button>
        <button
          onClick={() => setCustomTime(15)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-300 rounded-lg"
        >
          15 min sprint
        </button>
        <button
          onClick={() => setCustomTime(5)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-300 rounded-lg"
        >
          5 min break
        </button>
      </div>

      {/* PLAY/PAUSE/RESET CONTROL KEYS */}
      <div className="flex gap-4 items-center justify-center mb-6">
        <button
          onClick={resetTimer}
          className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-2xl transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
            isActive
              ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10 text-slate-950"
              : "bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/20 text-slate-950"
          }`}
        >
          {isActive ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950" />}
        </button>

        <div className="p-3 bg-slate-900/40 text-emerald-400 rounded-2xl border border-slate-800 font-bold text-xs flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-300" />
          <span>{studyStats.focused_minutes} Mins Focus</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Completing slots auto-adds focus points globally.
      </div>
    </div>
  );
};

export default PomodoroTimer;