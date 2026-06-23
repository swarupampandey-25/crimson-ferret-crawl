import React from "react";
import { useDpp } from "../context/DppContext";
import { Award, BrainCircuit, Activity, Flame, CheckCircle, AlertCircle, Clock, Compass, Star } from "lucide-react";

export const AnalyticsDashboard: React.FC = () => {
  const { attempts, mistakes, questions, chapters, studyStats } = useDpp();

  // Dynamic calculations
  const totalSolved = attempts.length;
  const correctAttempts = attempts.filter((a) => a.is_correct);
  const totalCorrect = correctAttempts.length;
  const totalIncorrect = totalSolved - totalCorrect;
  const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 100;

  // Subject-wise grouping
  const getSubjectStats = (subject: "Physics" | "Chemistry" | "Biology") => {
    const subChapters = chapters.filter((c) => c.subject_name === subject);
    const subChapterIds = subChapters.map((c) => c.chapter_id);
    
    // Find questions in this subject
    const subQuestions = questions.filter((q) => subChapterIds.includes(q.chapter_id));
    const subQuestionIds = subQuestions.map((q) => q.question_id);

    // Find attempts on these questions
    const subAttempts = attempts.filter((a) => subQuestionIds.includes(a.question_id));
    const subCorrect = subAttempts.filter((a) => a.is_correct).length;
    const subAccuracy = subAttempts.length > 0 ? Math.round((subCorrect / subAttempts.length) * 100) : 0;

    return {
      total: subQuestions.length,
      solved: subAttempts.length,
      correct: subCorrect,
      accuracy: subAccuracy
    };
  };

  const physics = getSubjectStats("Physics");
  const chemistry = getSubjectStats("Chemistry");
  const biology = getSubjectStats("Biology");

  // Calculate speed trends
  const averageTime = attempts.length > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.time_taken_seconds, 0) / attempts.length)
    : 0;

  // Projected percentile rank simulator based on accuracy & focus
  const basePercentile = 70;
  const performanceBoost = Math.round((accuracy - 50) * 0.4 + (studyStats.focused_minutes / 100) * 2);
  const projectedPercentile = Math.min(99.9, Math.max(10, basePercentile + performanceBoost));

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER GRAPHICS & PROJECTED RANK */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Cognitive Profile Active
            </span>
            <h2 className="text-xl font-bold text-slate-100">National Rank Simulator</h2>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Based on your interactive solving history, error rates inside the Mistake Book, and focus streaks, the engine has synthesized your active potential ranking.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center shrink-0 min-w-[160px] relative z-10">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Projected Percentile</span>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mt-1">
              {projectedPercentile}%
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Top Tier candidate</span>
          </div>
        </div>

        {/* STUDY STREAK CARD */}
        <div className="md:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-semibold">Current Consistency</span>
            <Flame className="w-6 h-6 text-amber-500 animate-bounce" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-100 flex items-baseline gap-1">
              {studyStats.completed_sessions} <span className="text-xs text-slate-500">Consecutive Runs</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Keep the momentum going! Completing mock modules or Pomodoro timers preserves your weekly active streak.
            </p>
          </div>
        </div>
      </div>

      {/* CORE SUBJECT PROGRESS METERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PHYSICS ACCURACY */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-900" strokeWidth="6" fill="transparent" />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-cyan-400 transition-all duration-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * physics.accuracy) / 100}
              />
            </svg>
            <div className="absolute text-xl font-extrabold text-cyan-300 font-mono">
              {physics.accuracy}%
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-200">Physics Mastery</h4>
          <span className="text-[10px] text-slate-500 mt-1">
            Solved {physics.solved} / {physics.total} questions
          </span>
        </div>

        {/* CHEMISTRY ACCURACY */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-900" strokeWidth="6" fill="transparent" />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-amber-400 transition-all duration-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * chemistry.accuracy) / 100}
              />
            </svg>
            <div className="absolute text-xl font-extrabold text-amber-300 font-mono">
              {chemistry.accuracy}%
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-200">Chemistry Mastery</h4>
          <span className="text-[10px] text-slate-500 mt-1">
            Solved {chemistry.solved} / {chemistry.total} questions
          </span>
        </div>

        {/* BIOLOGY ACCURACY */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-900" strokeWidth="6" fill="transparent" />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-emerald-400 transition-all duration-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * biology.accuracy) / 100}
              />
            </svg>
            <div className="absolute text-xl font-extrabold text-emerald-300 font-mono">
              {biology.accuracy}%
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-200">Biology Mastery</h4>
          <span className="text-[10px] text-slate-500 mt-1">
            Solved {biology.solved} / {biology.total} questions
          </span>
        </div>
      </div>

      {/* COGNITIVE BREAKDOWN AND LOGISTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRITICAL COGNITIVE LOOPS */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              Cognitive Fault Diagnostics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              A real-time analysis of error types logged under your Mistake Book. Focus efforts on fixing these conceptual traps.
            </p>
          </div>

          <div className="space-y-4">
            {/* Conceptual loop indicator */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Conceptual Loopholes</span>
                <span className="text-rose-400">
                  {mistakes.filter((m) => m.error_type === "Conceptual Loophole").length} logs
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, mistakes.filter((m) => m.error_type === "Conceptual Loophole").length * 20)}%`
                  }}
                />
              </div>
            </div>

            {/* Calculation Error loop */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Calculation Accuracy</span>
                <span className="text-amber-400">
                  {mistakes.filter((m) => m.error_type === "Calculation Error").length} logs
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, mistakes.filter((m) => m.error_type === "Calculation Error").length * 20)}%`
                  }}
                />
              </div>
            </div>

            {/* Skipped questions loop */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Time-Pressure Skips</span>
                <span className="text-cyan-400">
                  {mistakes.filter((m) => m.error_type === "Skipped").length} logs
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, mistakes.filter((m) => m.error_type === "Skipped").length * 20)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TIME ALLOCATION STATISTICS */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Solving Velocity Map
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Track your average pace per question. Target velocity for NEET/JEE preparation is typically under 60 seconds per item.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 text-center flex-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Your Average Pace</span>
              <div className="text-2xl font-black text-emerald-300 mt-1">{averageTime}s</div>
              <span className="text-[9px] text-slate-400 mt-1 block">Seconds/Item</span>
            </div>

            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 text-center flex-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Exam Target Pace</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">60s</div>
              <span className="text-[9px] text-emerald-400 font-semibold mt-1 block">Optimal Threshold</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-900/20 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2.5">
            <Compass className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Your average response pace is {averageTime <= 60 ? "fully optimized" : "slightly above NEET guidelines"}. Continue doing mock tests under strict timed conditions to lock in optimal speed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;