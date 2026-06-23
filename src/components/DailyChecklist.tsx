import React from "react";
import { useDpp } from "../context/DppContext";
import { CheckCircle2, Circle, Trophy, Flame } from "lucide-react";

export const DailyChecklist: React.FC = () => {
  const { attempts, mistakes, formulas, studyStats } = useDpp();

  // Dynamic conditions
  const hasSolvedQuestions = attempts.length >= 3;
  const hasAddedFormula = formulas.length >= 4; // Initial is 3, so 4 means they added one!
  const hasFocused = studyStats.focused_minutes > 45; // Initial is 45 mins
  const hasCleanedMistakes = mistakes.length < 5; // Initial mistakes count

  const tasks = [
    {
      id: "solve",
      title: "Complete 3+ Problem Runs",
      desc: `Currently solved: ${attempts.length}/3`,
      isCompleted: hasSolvedQuestions,
    },
    {
      id: "formula",
      title: "Log a New Formula Card",
      desc: "Record a critical mathematical expression",
      isCompleted: hasAddedFormula,
    },
    {
      id: "focus",
      title: "Sprint a Pomodoro Session",
      desc: "Earn focused minutes on the timer",
      isCompleted: hasFocused,
    },
    {
      id: "mistake",
      title: "Maintain Low Mistake Backlog",
      desc: "Keep mistake entries under control",
      isCompleted: hasCleanedMistakes,
    },
  ];

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const overallProgressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-900 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Trophy className="w-4.5 h-4.5 text-amber-400" />
          Daily Solvers Quest
        </h3>
        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] rounded-lg">
          {completedCount}/{tasks.length} Completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
          <span>DAILY COMPLETION</span>
          <span>{overallProgressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="flex flex-col gap-2.5 mt-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
              task.isCompleted
                ? "bg-emerald-500/5 border-emerald-500/10 text-slate-300"
                : "bg-slate-900/40 border-transparent text-slate-400"
            }`}
          >
            {task.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-xs font-bold ${task.isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}>
                {task.title}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{task.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChecklist;