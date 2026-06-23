import React, { useState, useEffect, useRef } from "react";
import { useDpp, Question } from "../context/DppContext";
import { Send, MessageSquare, Bookmark, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, Sparkles, User, BrainCircuit } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface QuestionCardProps {
  question: Question;
  onAnswerAttempted?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerAttempted }) => {
  const { submitAttempt, chats, sendMessageToChat, spawnSimilarQuestion, attempts, bookmarkedQuestionIds, toggleBookmarkQuestion } = useDpp();
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [timer, setTimer] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isBookmarked = bookmarkedQuestionIds.includes(question.question_id);

  // Check if user has already answered this question in this session
  const priorAttempt = attempts.find((a) => a.question_id === question.question_id);
  const isLocked = !!priorAttempt;

  // Start timers
  useEffect(() => {
    setTimer(0);
    setSelectedOption(null);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isLocked) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.question_id, isLocked]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats[question.question_id]?.conversation_history]);

  const handleSelectOption = (opt: "A" | "B" | "C" | "D") => {
    if (isLocked) return;
    setSelectedOption(opt);

    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = opt === question.correct_option;

    submitAttempt({
      question_id: question.question_id,
      selected_option: opt,
      is_correct: isCorrect,
      time_taken_seconds: timer,
    });

    if (onAnswerAttempted) {
      onAnswerAttempted();
    }

    // Auto trigger supportive AI response contextually
    const wrongOptionExplanation = `You selected Option ${opt}. The correct option is actually ${question.correct_option}. Here's a helpful perspective: When considering "${question.topic_name}", let's recall the standard derivation or principle. Why don't you try explaining your thought process, or ask me for an incremental hint?`;
    const rightOptionExplanation = `Fantastic! Option ${opt} is correct! Excellent conceptual grasp on "${question.topic_name}". Let me know if you would like me to spawn a slightly harder version of this problem to test your mastery!`;

    setTimeout(() => {
      sendMessageToChat(
        question.question_id,
        `System: Answer Evaluated. Selected ${opt}.`,
        isCorrect ? rightOptionExplanation : wrongOptionExplanation
      );
    }, 500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userQuery = chatInput;
    setChatInput("");

    // Simulate supportive contextual peer AI response
    let aiResponse = `Let's break down your question about "${question.topic_name}". Remember that we are looking at: ${question.question_text}. Let's write down the fundamental equation or logic step-by-step. What if we isolated the variable?`;

    if (userQuery.toLowerCase().includes("why") || userQuery.toLowerCase().includes("how")) {
      aiResponse = `Ah, great inquiry. Let's analyze. We know option ${question.correct_option} is true because:
1. In ${question.topic_name}, the equations state a direct physical relation.
2. Any calculation error during alignment leads directly to traps like option ${question.correct_option === "A" ? "B" : "A"}.
What do you think is the key step to proceed?`;
    }

    sendMessageToChat(question.question_id, userQuery, aiResponse);
  };

  const handleSpawnVariant = () => {
    spawnSimilarQuestion(question);
  };

  const activeChat = chats[question.question_id];
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* MAIN QUESTION CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* TOP META */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
              {question.difficulty || "Medium"}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Topic: {question.topic_name}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toggleBookmarkQuestion(question.question_id)}
              className={`p-1.5 rounded-xl border transition-all ${
                isBookmarked
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-slate-950 border-slate-800/80 text-slate-500 hover:text-slate-300"
              }`}
              title={isBookmarked ? "Bookmarked question" : "Bookmark for later review"}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <div className="text-xs text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Timer: {isLocked ? formatTime(priorAttempt?.time_taken_seconds || 0) : formatTime(timer)}
            </div>
          </div>
        </div>

        {/* QUESTION CONTENT */}
        <div className="text-slate-100 text-base md:text-lg font-medium leading-relaxed mb-6">
          {question.question_text}
        </div>

        {/* DIAGRAM PLACEHOLDER (EXTRACTED LINK) */}
        {question.diagram_url && (
          <div className="mb-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
              Extracted Diagram Reference
            </span>
            <img
              src={question.diagram_url}
              alt="Extracted concept diagram"
              className="max-h-40 object-contain rounded-lg border border-slate-800"
            />
          </div>
        )}

        {/* OPTIONS SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {([
            { key: "A", text: question.option_a },
            { key: "B", text: question.option_b },
            { key: "C", text: question.option_c },
            { key: "D", text: question.option_d },
          ] as const).map(({ key, text }) => {
            const isSelected = selectedOption === key || priorAttempt?.selected_option === key;
            const isCorrect = question.correct_option === key;
            const showAsCorrect = isLocked && isCorrect;
            const showAsWrong = isLocked && isSelected && !isCorrect;

            let btnStyle = "bg-slate-950 hover:bg-slate-800/60 border-slate-800 text-slate-200";
            if (showAsCorrect) {
              btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20";
            } else if (showAsWrong) {
              btnStyle = "bg-rose-500/10 border-rose-500 text-rose-300 ring-2 ring-rose-500/20";
            } else if (isSelected && !isLocked) {
              btnStyle = "bg-emerald-500/5 border-emerald-500 text-emerald-300";
            }

            return (
              <button
                key={key}
                disabled={isLocked}
                onClick={() => handleSelectOption(key)}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                  !isLocked ? "active:scale-[0.99] cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    showAsCorrect ? "bg-emerald-500 text-white" :
                    showAsWrong ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {key}
                  </span>
                  <span>{text}</span>
                </div>
                {showAsCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                {showAsWrong && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK BANNER */}
        {isLocked && (
          <div className={`mt-5 p-4 rounded-2xl border flex items-start gap-3 ${
            priorAttempt?.is_correct
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/5 border-rose-500/20 text-rose-300"
          }`}>
            {priorAttempt?.is_correct ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold mb-0.5">Bullseye! That is Correct</p>
                  <p className="text-slate-400">You solved this in {priorAttempt.time_taken_seconds} seconds. Excellent focus!</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold mb-0.5">Incorrect Attempt Recorded</p>
                  <p className="text-slate-400">This question has been automatically cataloged in your Chapter Mistake Book below. Let's study the concept with the AI Copilot.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CO-PILOT CHAT INTERFACE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Contextual Copilot</h4>
              <p className="text-[10px] text-slate-400">Casual peer explainer • Real-time concept analysis</p>
            </div>
          </div>

          <button
            onClick={handleSpawnVariant}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md shadow-emerald-500/15"
          >
            <Sparkles className="w-3 h-3" /> Spawn Similar Question
          </button>
        </div>

        {/* CHAT BUBBLES SCROLLER */}
        <div className="bg-slate-950 border border-slate-800/60 rounded-2xl p-4 h-60 overflow-y-auto flex flex-col gap-3.5">
          {(!activeChat || activeChat.conversation_history.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="w-7 h-7 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-semibold">Ready to chat about this problem?</p>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1">Submit an answer or send a custom question to activate the peer copilot explaining loops, logic and traps.</p>
            </div>
          ) : (
            activeChat.conversation_history.map((msg, index) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 max-w-[85%] ${
                    isAi ? "self-start" : "self-end flex-row-reverse"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isAi ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-300"
                  }`}>
                    {isAi ? <BrainCircuit className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isAi
                      ? "bg-slate-900 border border-slate-800/80 text-slate-200"
                      : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask AI why a certain option is incorrect..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 transition-all"
          />
          <button
            type="submit"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 hover:text-emerald-400 text-slate-300 rounded-xl transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionCard;