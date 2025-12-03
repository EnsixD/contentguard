import React, { useState } from "react";
import { X, Sparkles } from "./Icons";
import { generatePostWithAI } from "../services/a4fService";

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string) => void;
}

const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError("");

    try {
      const text = await generatePostWithAI(topic);
      onGenerate(text);
      onClose();
      setTopic("");
    } catch (err: any) {
      setError(err.message || "Не удалось сгенерировать контент");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all"
        onClick={onClose}
      ></div>

      <div className="relative bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-zinc-800">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm uppercase tracking-wide">
                Авто Генератор
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
            Тема или ключевые слова
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Опишите, о чем нужно написать пост..."
            className="w-full h-40 px-4 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-base text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all resize-none placeholder:text-zinc-600"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          {error && (
            <div className="mt-4 text-xs font-medium text-red-400 bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className={`px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2
                 ${
                   isGenerating || !topic.trim()
                     ? "opacity-50 cursor-not-allowed"
                     : "active:scale-95"
                 }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Пишем...
                </>
              ) : (
                <>Сгенерировать</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationModal;
