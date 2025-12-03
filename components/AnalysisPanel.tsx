import React from "react";
import { AnalysisResult, RiskLevel } from "../types";
import { ShieldCheck, AlertTriangle, Check, Sparkles } from "./Icons";

interface AnalysisPanelProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  onApplyFix: (newText: string) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  result,
  isLoading,
  onApplyFix,
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 animate-pulse">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin mb-6"></div>
        <p className="text-sm font-medium tracking-widest uppercase text-zinc-500">
          Обработка контента...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-zinc-500">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-zinc-400" />
        </div>
        <p className="text-center text-sm font-medium text-zinc-400">
          Готов к анализу
        </p>
        <p className="text-center text-xs mt-2 text-zinc-600">
          Загрузите медиа или текст для начала
        </p>
      </div>
    );
  }

  const isSafe = result.isSafe;
  const riskColor = isSafe
    ? "text-zinc-300"
    : result.overallRisk === RiskLevel.CRITICAL
    ? "text-red-500"
    : "text-amber-500";

  return (
    <div className="h-full flex flex-col animate-fade-in relative text-zinc-200">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Статус проверки
          </h2>
          <span
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
              isSafe
                ? "border-zinc-700 bg-zinc-800 text-zinc-300"
                : "border-red-900/50 bg-red-900/20 text-red-400"
            }`}
          >
            {isSafe ? "ОДОБРЕНО" : "НАЙДЕНЫ НАРУШЕНИЯ"}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-4">
          {isSafe ? (
            <div className="p-2 bg-emerald-900/20 rounded-full border border-emerald-900/50">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
          ) : (
            <div className="p-2 bg-red-900/20 rounded-full border border-red-900/50">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          )}
          <div>
            <h3 className={`text-lg font-semibold ${riskColor}`}>
              {isSafe
                ? "Контент готов к публикации."
                : "Публикация ограничена."}
            </h3>
            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
              {isSafe
                ? "Запрещенных терминов или визуальных нарушений не найдено."
                : "Исправьте ошибки вручную или используйте авто-исправление ниже."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {result.imageAnalysis && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Визуальный анализ
            </h3>
            <p className="text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3 leading-relaxed">
              {result.imageAnalysis}
            </p>
          </div>
        )}

        {result.issues.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Список замечаний
            </h3>
            <div className="space-y-4">
              {result.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="group border border-red-900/30 bg-red-950/10 p-5 rounded-lg hover:border-red-900/50 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-red-900/20 text-red-400 rounded border border-red-900/30">
                      {issue.category}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        issue.severity === RiskLevel.CRITICAL
                          ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                          : "bg-amber-500"
                      }`}
                    ></span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Фрагмент
                      </span>
                      <p className="text-zinc-200 font-medium font-serif italic border-l-2 border-red-800 pl-2 py-1 my-1">
                        "{issue.snippet}"
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Причина
                      </span>
                      <p className="text-sm text-red-300/80">{issue.reason}</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/50 mt-2">
                      <span className="text-[10px] text-emerald-500/80 uppercase tracking-wider block mb-1">
                        Рекомендация
                      </span>
                      <p className="text-sm text-zinc-300 font-medium">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isSafe && result.revisedText && (
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-xl sticky bottom-0 z-10">
          <div className="mb-3 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Доступно безопасное решение
            </p>
          </div>
          <button
            onClick={() => onApplyFix(result.revisedText)}
            className="w-full group relative overflow-hidden bg-white hover:bg-emerald-50 text-black py-4 px-6 rounded-lg font-medium transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 border-2 border-transparent hover:border-emerald-400"
          >
            <div className="flex items-center justify-center gap-3 relative z-10">
              <div className="p-1 bg-black text-white rounded-full">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight">
                Исправить и разрешить публикацию
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
