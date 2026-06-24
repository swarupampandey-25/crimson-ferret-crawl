import React, { createContext, useContext, useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { 
  Chapter, 
  Question, 
  UserAttempt, 
  MistakeEntry, 
  AIChat, 
  Formula, 
  StudyStats 
} from "../types/dpp";
import { initialChapters, initialQuestions, initialFormulas } from "./initialData";

// Re-export type definitions for components that import them directly from here
export type { Chapter, Question, UserAttempt, MistakeEntry, AIChat, Formula, StudyStats };

interface DppContextType {
  chapters: Chapter[];
  questions: Question[];
  attempts: UserAttempt[];
  mistakes: MistakeEntry[];
  chats: Record<string, AIChat>; // keyed by question_id
  formulas: Formula[];
  studyStats: StudyStats;
  bookmarkedQuestionIds: string[];
  addChapter: (subject: "Physics" | "Chemistry" | "Biology", name: string) => void;
  addQuestion: (question: Omit<Question, "question_id" | "created_at">) => Question;
  submitAttempt: (attempt: Omit<UserAttempt, "attempt_id" | "attempted_at">) => void;
  addToMistakeBook: (question_id: string, chapter_id: string, error_type: MistakeEntry["error_type"]) => void;
  removeFromMistakeBook: (question_id: string) => void;
  sendMessageToChat: (question_id: string, message: string, assistantReply?: string) => void;
  spawnSimilarQuestion: (parentQuestion: Question) => Question;
  addFormula: (formula: Omit<Formula, "formula_id" | "is_favorite">) => void;
  toggleFormulaFavorite: (formula_id: string) => void;
  deleteFormula: (formula_id: string) => void;
  addFocusedMinutes: (minutes: number) => void;
  toggleBookmarkQuestion: (question_id: string) => void;
}

const DppContext = createContext<DppContextType | undefined>(undefined);

export const DppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem("dpp_chapters");
    return saved ? JSON.parse(saved) : initialChapters;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem("dpp_questions");
    return saved ? JSON.parse(saved) : initialQuestions;
  });

  const [attempts, setAttempts] = useState<UserAttempt[]>(() => {
    const saved = localStorage.getItem("dpp_attempts");
    return saved ? JSON.parse(saved) : [];
  });

  const [mistakes, setMistakes] = useState<MistakeEntry[]>(() => {
    const saved = localStorage.getItem("dpp_mistakes");
    return saved ? JSON.parse(saved) : [];
  });

  const [chats, setChats] = useState<Record<string, AIChat>>(() => {
    const saved = localStorage.getItem("dpp_chats");
    return saved ? JSON.parse(saved) : {};
  });

  const [formulas, setFormulas] = useState<Formula[]>(() => {
    const saved = localStorage.getItem("dpp_formulas");
    return saved ? JSON.parse(saved) : initialFormulas;
  });

  const [studyStats, setStudyStats] = useState<StudyStats>(() => {
    const saved = localStorage.getItem("dpp_study_stats");
    return saved ? JSON.parse(saved) : { focused_minutes: 45, completed_sessions: 2 };
  });

  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("dpp_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("dpp_chapters", JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem("dpp_questions", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("dpp_attempts", JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem("dpp_mistakes", JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem("dpp_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("dpp_formulas", JSON.stringify(formulas));
  }, [formulas]);

  useEffect(() => {
    localStorage.setItem("dpp_study_stats", JSON.stringify(studyStats));
  }, [studyStats]);

  useEffect(() => {
    localStorage.setItem("dpp_bookmarks", JSON.stringify(bookmarkedQuestionIds));
  }, [bookmarkedQuestionIds]);

  const addChapter = (subject: "Physics" | "Chemistry" | "Biology", name: string) => {
    const alreadyExists = chapters.some(
      (c) => c.subject_name === subject && c.chapter_name.toLowerCase() === name.toLowerCase()
    );
    if (alreadyExists) {
      showError("Chapter already exists under this subject!");
      return;
    }
    const newChapter: Chapter = {
      chapter_id: `ch-${Date.now()}`,
      subject_name: subject,
      chapter_name: name,
    };
    setChapters((prev) => [...prev, newChapter]);
    showSuccess(`Chapter "${name}" added successfully.`);
  };

  const addQuestion = (qData: Omit<Question, "question_id" | "created_at">) => {
    const newQ: Question = {
      ...qData,
      question_id: `q-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setQuestions((prev) => [newQ, ...prev]);
    return newQ;
  };

  const submitAttempt = (attData: Omit<UserAttempt, "attempt_id" | "attempted_at">) => {
    const newAttempt: UserAttempt = {
      ...attData,
      attempt_id: `att-${Date.now()}`,
      attempted_at: new Date().toISOString(),
    };
    setAttempts((prev) => [...prev, newAttempt]);

    // Handle automated Mistake Book logs
    if (!attData.is_correct) {
      const relatedQ = questions.find((q) => q.question_id === attData.question_id);
      if (relatedQ) {
        addToMistakeBook(
          attData.question_id,
          relatedQ.chapter_id,
          attData.selected_option === null ? "Skipped" : "Conceptual Loophole"
        );
      }
    }
  };

  const addToMistakeBook = (question_id: string, chapter_id: string, error_type: MistakeEntry["error_type"]) => {
    const alreadyLogged = mistakes.some((m) => m.question_id === question_id);
    if (alreadyLogged) return;

    const newMistake: MistakeEntry = {
      mistake_id: `mistake-${Date.now()}`,
      question_id,
      chapter_id,
      error_type,
      created_at: new Date().toISOString(),
    };
    setMistakes((prev) => [newMistake, ...prev]);
  };

  const removeFromMistakeBook = (question_id: string) => {
    setMistakes((prev) => prev.filter((m) => m.question_id !== question_id));
    showSuccess("Removed from your Mistake Book!");
  };

  const sendMessageToChat = (question_id: string, message: string, assistantReply?: string) => {
    setChats((prev) => {
      const existing = prev[question_id] || {
        chat_id: `chat-${Date.now()}`,
        question_id,
        conversation_history: [],
        updated_at: new Date().toISOString(),
      };

      const userMsg = { role: "user" as const, content: message };
      const aiMsg = {
        role: "assistant" as const,
        content: assistantReply || `Let's break this down. In the topic "${questions.find(q => q.question_id === question_id)?.topic_name || "Physics"}", remember to use the correct formulas and double-check standard values!`,
      };

      return {
        ...prev,
        [question_id]: {
          ...existing,
          conversation_history: [...existing.conversation_history, userMsg, aiMsg],
          updated_at: new Date().toISOString(),
        },
      };
    });
  };

  const spawnSimilarQuestion = (parentQuestion: Question): Question => {
    let textVariant = "";
    let optA = "";
    let optB = "";
    let optC = "";
    let optD = "";
    let correct: "A" | "B" | "C" | "D" = "A";

    if (parentQuestion.topic_name === "Moment of Inertia") {
      textVariant = `[Spawned Variant] A uniform solid cylinder of mass M and radius R rotates about its central longitudinal axis. Calculate its Moment of Inertia.`;
      optA = "1/2 M R²";
      optB = "M R²";
      optC = "2/5 M R²";
      optD = "3/2 M R²";
      correct = "A";
    } else if (parentQuestion.topic_name === "Gauss's Law") {
      textVariant = `[Spawned Variant] A charge Q is located at the center of a sphere of radius R. If the radius is doubled, how does the electric flux through the surface change?`;
      optA = "Flux increases twofold";
      optB = "Flux decreases to one-fourth";
      optC = "Flux remains unchanged (Q / ε₀)";
      optD = "Flux becomes zero";
      correct = "C";
    } else if (parentQuestion.topic_name === "VSEPR Theory") {
      textVariant = `[Spawned Variant] What is the expected geometry of H₂O (Water molecule) according to the VSEPR theory, taking into account lone pair repulsions?`;
      optA = "Linear";
      optB = "Bent / V-shaped";
      optC = "Trigonal Pyramidal";
      optD = "Tetrahedral";
      correct = "B";
    } else {
      textVariant = `[Spawned Variant of ${parentQuestion.topic_name}] Solve a parallel question where the dimensions/variables are scaled by a factor of 2. What is the newly computed equilibrium value?`;
      optA = `Double the original value`;
      optB = `Four times the original value`;
      optC = `Remains unchanged`;
      optD = `Half the original value`;
      correct = "A";
    }

    const spawned: Question = {
      question_id: `q-spawned-${Date.now()}`,
      chapter_id: parentQuestion.chapter_id,
      topic_name: `${parentQuestion.topic_name} (Variant)`,
      question_text: textVariant,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_option: correct,
      parent_question_id: parentQuestion.question_id,
      difficulty: "Medium",
      created_at: new Date().toISOString(),
    };

    setQuestions((prev) => [spawned, ...prev]);
    showSuccess("Successfully spawned a conceptually similar question right in this chapter!");
    return spawned;
  };

  const addFormula = (fData: Omit<Formula, "formula_id" | "is_favorite">) => {
    const newFormula: Formula = {
      ...fData,
      formula_id: `f-${Date.now()}`,
      is_favorite: false,
    };
    setFormulas((prev) => [newFormula, ...prev]);
    showSuccess(`Formula "${fData.title}" saved successfully!`);
  };

  const toggleFormulaFavorite = (formula_id: string) => {
    setFormulas((prev) =>
      prev.map((f) => (f.formula_id === formula_id ? { ...f, is_favorite: !f.is_favorite } : f))
    );
  };

  const deleteFormula = (formula_id: string) => {
    setFormulas((prev) => prev.filter((f) => f.formula_id !== formula_id));
    showSuccess("Formula removed.");
  };

  const addFocusedMinutes = (minutes: number) => {
    setStudyStats((prev) => ({
      focused_minutes: prev.focused_minutes + minutes,
      completed_sessions: prev.completed_sessions + 1,
    }));
    showSuccess(`Fantastic! You earned +${minutes} focused minutes.`);
  };

  const toggleBookmarkQuestion = (question_id: string) => {
    setBookmarkedQuestionIds((prev) => {
      const isBookmarked = prev.includes(question_id);
      if (isBookmarked) {
        showSuccess("Question removed from bookmarks.");
        return prev.filter((id) => id !== question_id);
      } else {
        showSuccess("Question pinned to your review bookmarks.");
        return [...prev, question_id];
      }
    });
  };

  return (
    <DppContext.Provider
      value={{
        chapters,
        questions,
        attempts,
        mistakes,
        chats,
        formulas,
        studyStats,
        bookmarkedQuestionIds,
        addChapter,
        addQuestion,
        submitAttempt,
        addToMistakeBook,
        removeFromMistakeBook,
        sendMessageToChat,
        spawnSimilarQuestion,
        addFormula,
        toggleFormulaFavorite,
        deleteFormula,
        addFocusedMinutes,
        toggleBookmarkQuestion,
      }}
    >
      {children}
    </DppContext.Provider>
  );
};

export const useDpp = () => {
  const context = useContext(DppContext);
  if (!context) {
    throw new Error("useDpp must be used within a DppProvider");
  }
  return context;
};