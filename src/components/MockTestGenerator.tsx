import React, { useState, useEffect } from "react";
import { useDpp, Question } from "../context/DppContext";
import { Play, ClipboardList, CheckCircle, Clock, AlertCircle, RefreshCw, Star } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

export const MockTestGenerator: React.FC = () => {
  const { questions, chapters, submitAttempt } = useDpp();
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [testLimit, setTestLimit] = useState(5);
  const [testActive, setTestActive] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active testing variables
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<string, "A" | "B" | "C" | "D" | null>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 mins
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Graded report state
  const [report, setReport] = useState<{
    score: number;
    total: number;
    accuracy: number;
    correctKeys: string[];
  } | null>(null);

  const activeChapter = chapters.find((c) => c.chapter_id === selectedChapterId);
  const totalChapterQs = questions.filter((q) => q.chapter_id === selectedChapterId);

  // Timer runner
  useEffect(() => {
    if (testActive && secondsRemaining > 0) {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteTest(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [testActive]);

  const handleStartTest = () => {
    if (!selectedChapterId) {
      showError("Please pick a chapter to test your skills!");
      return;
    }
    const filtered = questions.filter((q) => q.chapter_id === selectedChapterId);
    if (filtered.length === 0) {
      showError("This chapter currently contains no questions. Ingest some first!");
      return;
    }

    // Limit set
    const selectedBatch = filtered.slice(0, testLimit);
    setTestQuestions(selectedBatch);
    setAnswersMap({});
    setCurrentIndex(0);
    setSelectedOption(null);
    setSecondsRemaining(testLimit * 60); // 1 minute per question
    setReport(null);
    setTestActive(true);
    showSuccess(`Launched ${selectedBatch.length}-question practice module. Stay sharp!`);
  };

  const handleSelectOption = (opt: "A" | "B" | "C" | "D") => {
    setSelectedOption(opt);
    setAnswersMap((prev) => ({
      ...prev,
      [testQuestions[currentIndex].question_id]: opt,
    }));
  };

  const handleNext = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const pastAns = answersMap[testQuestions[currentIndex + 1]?.question_id] || null;
      setSelectedOption(pastAns);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const pastAns = answersMap[testQuestions[currentIndex - 1]?.question_id] || null;
      setSelectedOption(pastAns);
    }
  };

  const handleCompleteTest = (auto = false) => {
    setTestActive(false);
    if (timerInterval) clearInterval(timerInterval);

    let calculatedScore = 0;
    const correctIds: string[] = [];

    testQuestions.forEach((q) => {
      const selected = answersMap[q.question_id] || null;
      const isCorrect = selected === q.correct_option;

      if (isCorrect) {
        calculatedScore += 4; // standard 4 marks for JEE/NEET
        correctIds.push(q.question_id);
      } else if (selected !== null) {
        calculatedScore -= 1; // negative marking -1
      }

      // Submit each to the global registry so they are logged in statistics
      submitAttempt({
        question_id: q.question_id,
        selected_option: selected,
        is_correct: isCorrect,
        time_taken_seconds: 40, // avg simulation
      });
    });

    const accuracyRate =
      testQuestions.length > 0
        ? Math.round((correctIds.length / testQuestions.length) * 100)
        : 100;

    setReport({
      score: calculatedScore,
      total: testQuestions.length * 4,
      accuracy: accuracyRate,
      correctKeys: correctIds,
    });

    if (auto) {
      showError("Time expired! Automatically submitting your mock session.");
    } else {
      showSuccess("Test completed! Analyzing your cognitive breakdown.");
    }
  };

  const formatMinSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
      {/* 1. SELECTION FORM & SETUP PANEL */}
      {!testActive && !report && (
        <div className="max-w-xl mx-auto flex flex-col gap-5 text-center items-center py-6">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Chapter-Wise Mock Generator</h3>
            <p className="text-xs text-slate-400 mt-1">
              Test your exam endurance. Customize the length and launch graded mini-DPPs.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Target Chapter</label>
              <select
                value={selectedChapterId}
                onChange={(e) => {
                  setSelectedChapterId(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="" disabled>-- Choose Test Chapter --</option>
                {chapters.map((ch) => (
                  <option key={ch.chapter_id} value={ch.chapter_id}>
                    [{ch.subject_name}] {ch.chapter_name}
                  </option>
                ))}
              </select>
              {selectedChapterId && (
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Found {totalChapterQs.length} questions inside this directory.
                </span>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Question Count</label>
              <select
                value={testLimit}
                onChange={(e) => setTestLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={3}>3 Questions (Sprint)</option>
                <option value={5}>5 Questions (Moderate)</option>
                <option value={10}>10 Questions (Complete Test)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartTest}
            className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" /> Launch Practice Test
          </button>
        </div>
      )}

      {/* 2. LIVE ACTIVE TEST PORTAL */}
      {testActive && testQuestions.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                Mock: {activeChapter?.chapter_name}
              </span>
              <h4 className="text-xs text-slate-400 mt-1">
                Question {currentIndex + 1} of {testQuestions.length}
              </h4>
            </div>

            <div className="text-xs text-rose-400 bg-rose-500/5 px-3 py-1.5 rounded-xl border border-rose-500/10 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Time Remaining: {formatMinSec(secondsRemaining)}</span>
            </div>
          </div>

          {/* Question context */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm md:text-base text-slate-100 font-medium">
            {testQuestions[currentIndex].question_text}
          </div>

          {/* Option pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {([
              { key: "A", text: testQuestions[currentIndex].option_a },
              { key: "B", text: testQuestions[currentIndex].option_b },
              { key: "C", text: testQuestions[currentIndex].option_c },
              { key: "D", text: testQuestions[currentIndex].option_d },
            ] as const).map(({ key, text }) => {
              const isSelected = selectedOption === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold ${
                    isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}>
                    {key}
                  </span>
                  <span>{text}</span>
                </button>
              );
            })}
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-bold"
              >
                Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === testQuestions.length - 1}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-bold"
              >
                Next
              </button>
            </div>

            <button
              onClick={() => handleCompleteTest(false)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs"
            >
              Submit & Finish Test
            </button>
          </div>
        </div>
      )}

      {/* 3. TEST FEEDBACK & MARK SUMMARY */}
      {report && (
        <div className="flex flex-col gap-6 max-w-xl mx-auto text-center items-center py-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded border border-slate-800">
              Scorecard Analysis
            </span>
            <h3 className="text-lg font-black text-slate-100 mt-2">Test Completed Successfully</h3>
          </div>

          {/* Grade Metrics block */}
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">JEE/NEET Score</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {report.score} <span className="text-xs text-slate-500">/ {report.total}</span>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Answering Accuracy</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {report.accuracy}%
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-2">
            Incorrectly answered questions have been saved automatically to your **Mistake Book Explorer** so you can chat with the AI Peer and learn the optimal derivations.
          </p>

          <button
            onClick={() => setReport(null)}
            className="mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all"
          >
            Return to Mock Hub
          </button>
        </div>
      )}
    </div>
  );
};

export default MockTestGenerator;