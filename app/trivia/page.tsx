"use client";

import { useState } from "react";
import { TRIVIA_CARDS, QUIZ_QUESTIONS } from "@/data";
import { cn } from "@/lib/utils";

export default function TriviaPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ_QUESTIONS.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);

  const question = QUIZ_QUESTIONS[currentQ];
  const score = answers.filter((a, i) => a === QUIZ_QUESTIONS[i].correctIndex).length;

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const updated = [...answers];
    updated[currentQ] = idx;
    setAnswers(updated);
  }

  function handleNext() {
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(answers[currentQ + 1]);
    } else {
      setQuizDone(true);
    }
  }

  function handlePrev() {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setSelected(answers[currentQ - 1]);
    }
  }

  function resetQuiz() {
    setCurrentQ(0);
    setSelected(null);
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setQuizDone(false);
    setQuizStarted(false);
  }

  const scorePercent = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const scoreLabel =
    scorePercent >= 80 ? { label: "Election Expert! 🏆", color: "text-green-700", bg: "bg-green-50 border-green-200" } :
    scorePercent >= 60 ? { label: "Civic Champion! 🎖", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" } :
    scorePercent >= 40 ? { label: "Good Voter! 🗳", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" } :
    { label: "Keep Learning! 📚", color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">🧠 Trivia & Quiz</h1>
        <p className="text-gray-500">
          Discover Kerala election history, fascinating facts, and test your civic knowledge with our interactive quiz.
        </p>
      </div>

      {/* Trivia Cards */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span>📜</span> Kerala Election Facts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRIVIA_CARDS.map((card) => (
            <div key={card.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm card-hover">
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{card.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold bg-kerala-green/10 text-kerala-green px-2 py-0.5 rounded-full">
                      {card.category}
                    </span>
                    {card.year && (
                      <span className="text-xs text-gray-400">{card.year}</span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{card.fact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>❓</span> Civic Knowledge Quiz
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {QUIZ_QUESTIONS.length} questions · Test how well you know Indian elections and voting.
        </p>

        {!quizStarted && !quizDone && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🗳️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to test your knowledge?</h3>
            <p className="text-gray-600 text-sm mb-6">
              {QUIZ_QUESTIONS.length} questions on Kerala elections, voting process, and Indian civic life.
              <br />Each question has one correct answer with an explanation.
            </p>
            <button
              onClick={() => setQuizStarted(true)}
              className="gradient-kerala text-white font-bold px-8 py-3 rounded-xl transition-all hover:opacity-90"
            >
              Start Quiz →
            </button>
          </div>
        )}

        {quizStarted && !quizDone && (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100">
              <div
                className="h-full bg-kerala-green transition-all duration-500"
                style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            <div className="p-6">
              {/* Q counter */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-xs text-gray-400">
                  {answers.filter((a) => a !== null).length} answered
                </span>
              </div>

              {/* Question */}
              <h3 className="text-lg font-bold text-gray-900 mb-5 leading-snug">
                {question.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {question.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = idx === question.correctIndex;
                  const revealed = selected !== null;

                  let style = "bg-gray-50 border-gray-200 text-gray-800 hover:border-kerala-green hover:bg-green-50";
                  if (revealed && isCorrect) style = "bg-green-50 border-green-500 text-green-800";
                  else if (revealed && isSelected && !isCorrect) style = "bg-red-50 border-red-400 text-red-800";
                  else if (!revealed && isSelected) style = "bg-blue-50 border-blue-400 text-blue-800";

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-3",
                        style,
                        selected === null && "cursor-pointer"
                      )}
                    >
                      <span className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0",
                        revealed && isCorrect ? "bg-green-500 border-green-500 text-white" :
                        revealed && isSelected && !isCorrect ? "bg-red-400 border-red-400 text-white" :
                        "border-current"
                      )}>
                        {revealed && isCorrect ? "✓" : revealed && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {selected !== null && (
                <div className={cn(
                  "rounded-xl p-4 mb-5 text-sm border",
                  selected === question.correctIndex
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                )}>
                  <span className="font-bold mr-1">
                    {selected === question.correctIndex ? "✅ Correct!" : "💡 Explanation:"}
                  </span>
                  {question.explanation}
                </div>
              )}

              {/* Nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentQ === 0}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <div className="flex gap-1">
                  {QUIZ_QUESTIONS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentQ(i); setSelected(answers[i]); }}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all",
                        i === currentQ ? "bg-kerala-green" :
                        answers[i] !== null ? (answers[i] === QUIZ_QUESTIONS[i].correctIndex ? "bg-green-400" : "bg-red-400") :
                        "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={selected === null}
                  className="px-5 py-2 rounded-lg text-sm font-medium bg-kerala-green text-white hover:bg-kerala-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {currentQ === QUIZ_QUESTIONS.length - 1 ? "Finish →" : "Next →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {quizDone && (
          <div className="animate-fade-in">
            <div className={cn("rounded-xl border-2 p-8 text-center mb-6", scoreLabel.bg)}>
              <div className="text-6xl mb-3">
                {scorePercent >= 80 ? "🏆" : scorePercent >= 60 ? "🎖" : scorePercent >= 40 ? "🗳" : "📚"}
              </div>
              <h3 className={cn("text-2xl font-black mb-1", scoreLabel.color)}>{scoreLabel.label}</h3>
              <p className="text-gray-600 mb-4">
                You scored <strong className={scoreLabel.color}>{score} out of {QUIZ_QUESTIONS.length}</strong> ({scorePercent}%)
              </p>
              <button
                onClick={resetQuiz}
                className="gradient-kerala text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm"
              >
                Try Again
              </button>
            </div>

            {/* Answer Review */}
            <h3 className="font-bold text-gray-900 mb-4">Review Your Answers</h3>
            <div className="space-y-3">
              {QUIZ_QUESTIONS.map((q, i) => {
                const userAns = answers[i];
                const correct = userAns === q.correctIndex;
                return (
                  <div key={q.id} className={cn("rounded-xl border p-4", correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="flex-shrink-0 mt-0.5">{correct ? "✅" : "❌"}</span>
                      <p className="font-medium text-gray-900 text-sm">{q.question}</p>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">
                      <span className="font-semibold">Your answer:</span>{" "}
                      <span className={correct ? "text-green-700" : "text-red-700"}>
                        {userAns !== null ? q.options[userAns] : "Not answered"}
                      </span>
                    </p>
                    {!correct && (
                      <p className="text-xs text-gray-600 ml-6 mt-0.5">
                        <span className="font-semibold">Correct:</span>{" "}
                        <span className="text-green-700">{q.options[q.correctIndex]}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 ml-6 mt-1.5 italic">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
