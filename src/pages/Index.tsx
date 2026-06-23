import React, { useState } from "react";
import { DppProvider, useDpp } from "../context/DppContext";
import { UploadZone } from "../components/UploadZone";
import { QuestionCard } from "../components/QuestionCard";
import { MistakeBookExplorer } from "../components/MistakeBookExplorer";
import { FormulaSheet } from "../components/FormulaSheet";
import { MockTestGenerator } from "../components/MockTestGenerator";
import { PomodoroTimer } from "../components/PomodoroTimer";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { BookOpen, Sparkles, Database, LayoutGrid, CheckCircle2, Award, BrainCircuit, Play, Layers, Timer, BarChart3 } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const DashboardContent: React.FC = () => {
  const { questions, attempts, mistakes, chapters, studyStats } = useDpp();
  const [activeTab, setActiveTab] = useState<"dpp" | "upload" | "mistakes" | "formulas" | "mocks" | "analytics">("dpp");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<"Physics" | "Chemistry" | "Biology">("Physics");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Filter questions down to chapter (core rule: STRICT CHAPTER-WISE ISOLATION)
  const filteredChapters = chapters.filter((c) => c.subject_name === selectedSubjectFilter);
  const selectedChapter = chapters.find((c) => c.chapter_id === selectedChapterId) || filteredChapters[0];

  const currentChapterId = selectedChapter?.chapter_id || "";
  const chapterQuestions = questions.filter((q) => q.chapter_id === currentChapterId);

  // Global Stat math
  const totalCorrect = attempts.filter((a) => a.is_correct).length;
  const accuracyRate = attempts.length > 0 ? Math.round((totalCorrect / attempts.length) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Apex DPP Maker & Copilot
              </h1>
              <p className="text-xs text-slate-400">Contextual AI-Powered Problem Solver & Log</p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-wrap justify-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {(["dpp", "upload", "mistakes", "formulas", "mocks", "analytics"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-slate-800 text-emerald-400 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "dpp"
                  ? "Solve Live DPP"
                  : tab === "upload"
                  ? "Ingest Hub / PDF"
                  : tab === "mistakes"
                  ? "Mistake Book"
                  : tab === "formulas"
                  ? "Formula Cards"
                  : tab === "mocks"
                  ? "Mocks"
                  : "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CORE STAT BAR */}
      <section className="bg-slate-950 border-b border-slate-900/60 px-4 py-5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Questions</div>
              <div className="text-xl font-black text-slate-100">{questions.length} items</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Solving Accuracy</div>
              <div className="text-xl font-black text-slate-100">{accuracyRate}% Rate</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mistakes Book</div>
              <div className="text-xl font-black text-slate-100">{mistakes.length} flags</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Focus Streak</div>
              <div className="text-xl font-black text-slate-100">{studyStats.focused_minutes} Mins</div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN APPLICATION CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {activeTab === "dpp" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* SUBJECT & CHAPTER CONTROLLERS */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-900 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Play className="w-4.5 h-4.5 text-emerald-400" />
                  Live Study Room
                </h3>

                {/* Subject Selector */}
                <div className="flex gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  {(["Physics", "Chemistry", "Biology"] as const).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSubjectFilter(sub);
                        const firstCh = chapters.find((c) => c.subject_name === sub);
                        setSelectedChapterId(firstCh?.chapter_id || "");
                        setActiveQuestionIdx(0);
                      }}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider ${
                        selectedSubjectFilter === sub
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* Chapter list under chosen Subject */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Chapter Selection ({filteredChapters.length})
                  </label>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                    {filteredChapters.map((ch) => {
                      const isActive = (selectedChapterId || filteredChapters[0]?.chapter_id) === ch.chapter_id;
                      return (
                        <button
                          key={ch.chapter_id}
                          onClick={() => {
                            setSelectedChapterId(ch.chapter_id);
                            setActiveQuestionIdx(0);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                            isActive
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                              : "bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {ch.chapter_name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STAT SUMMARY OF SELECTED CHAPTER */}
              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-900 text-xs text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-200 mb-1">Chapter isolation rule active:</p>
                Currently reviewing questions exclusively bound to <span className="text-emerald-400 font-semibold">"{selectedChapter?.chapter_name || "N/A"}"</span>. Flat lists are blocked.
              </div>

              {/* INTEGRATED POMODORO STUDY TIMER ON SIDEBAR FOR QUICK FOCUS */}
              <PomodoroTimer />
            </div>

            {/* LIVE DPP EXAM & COPILOT CHAT BOX */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {chapterQuestions.length === 0 ? (
                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                  <Database className="w-12 h-12 text-slate-700 mb-3" />
                  <h4 className="text-sm font-bold text-slate-200">This Chapter folder is currently empty</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                    Navigate to the "Ingest Hub" tab above to upload complex PDFs or manually draft highly custom math questions using the AI extractions simulation engine.
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all"
                  >
                    Go to Ingest Hub
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* SLIDESHOW NAVIGATION */}
                  <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-900 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">
                      Question <b className="text-slate-200">{activeQuestionIdx + 1}</b> of <b className="text-slate-200">{chapterQuestions.length}</b>
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={activeQuestionIdx === 0}
                        onClick={() => setActiveQuestionIdx((prev) => prev - 1)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl text-xs text-slate-300 font-bold transition-all"
                      >
                        Previous
                      </button>
                      <button
                        disabled={activeQuestionIdx === chapterQuestions.length - 1}
                        onClick={() => setActiveQuestionIdx((prev) => prev - 1)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl text-xs text-slate-300 font-bold transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <QuestionCard question={chapterQuestions[activeQuestionIdx]} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "upload" && <UploadZone />}

        {activeTab === "mistakes" && <MistakeBookExplorer />}

        {activeTab === "formulas" && <FormulaSheet />}

        {activeTab === "mocks" && <MockTestGenerator />}

        {activeTab === "analytics" && <AnalyticsDashboard />}
      </main>

      <footer className="mt-auto py-6 border-t border-slate-900/80 bg-slate-950/40 text-center">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <DppProvider>
      <DashboardContent />
    </DppProvider>
  );
};

export default Index;