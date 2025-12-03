import React, { useState, useRef, useEffect } from "react";
import { analyzeContentWithA4F } from "./services/a4fService";
import {
  AnalysisResult,
  PLATFORMS,
  PlatformConfig,
  PlatformCredentials,
  RiskLevel,
} from "./types";
import {
  publishToTelegram,
  publishToVK,
  publishToDiscord,
} from "./services/publishingService";
import AnalysisPanel from "./components/AnalysisPanel";
import SettingsModal from "./components/SettingsModal";
import GenerationModal from "./components/GenerationModal";
import PlatformPreview from "./components/PlatformPreview";
import {
  UploadCloud,
  RefreshCw,
  Send,
  Trash2,
  Check,
  ShieldCheck,
  Settings,
  DiscordLogo,
  TelegramLogo,
  VKLogo,
  Sparkles,
  Menu,
  X,
  PanelRight,
} from "./components/Icons";

function App() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig>(
    PLATFORMS[0]
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showMobileAnalysis, setShowMobileAnalysis] = useState(false);

  const [credentials, setCredentials] = useState<PlatformCredentials>({
    telegramToken: "",
    telegramChatId: "",
    vkToken: "",
    vkOwnerId: "",
    discordWebhookUrl: "",
    discordBotToken: "",
    discordChannelId: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cg_credentials");
    if (saved) {
      try {
        setCredentials(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse credentials", e);
      }
    }
  }, []);

  const saveCredentials = (creds: PlatformCredentials) => {
    setCredentials(creds);
    localStorage.setItem("cg_credentials", JSON.stringify(creds));
    setShowToast(true);
    setToastMessage("Настройки сохранены.");
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAnalysisResult(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (analysisResult) {
      setAnalysisResult(null);
    }
  };

  const handleAIGeneratedText = (generatedText: string) => {
    setText(generatedText);
    setAnalysisResult(null);
    setToastMessage("Контент сгенерирован");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const runAnalysis = async () => {
    if (!text && !image) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeContentWithA4F(text, image);
      setAnalysisResult(result);

      if (window.innerWidth < 1024) {
        setShowMobileAnalysis(true);
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка анализа. Пожалуйста, попробуйте снова.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyFix = (fixedText: string) => {
    setText(fixedText);

    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        isSafe: true,
        overallRisk: RiskLevel.SAFE,
        issues: [],
      });
    }

    setToastMessage("Исправления применены. Публикация разрешена.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const hasCredentialsForPlatform = (platformId: string): boolean => {
    switch (platformId) {
      case "telegram":
        return !!(credentials.telegramToken && credentials.telegramChatId);
      case "vk":
        return !!(credentials.vkToken && credentials.vkOwnerId);
      case "discord":
        return !!(
          credentials.discordWebhookUrl ||
          (credentials.discordBotToken && credentials.discordChannelId)
        );
      default:
        return false;
    }
  };

  const canPublish =
    hasCredentialsForPlatform(selectedPlatform.id) &&
    analysisResult?.isSafe &&
    !isPublishing;
  const isReadyForIntegration = hasCredentialsForPlatform(selectedPlatform.id);

  const handlePublish = async () => {
    if (!isReadyForIntegration) return;

    setIsPublishing(true);
    const actions = [];
    let apiSuccess = false;

    if (selectedPlatform.id === "telegram") {
      const result = await publishToTelegram(credentials, text, image);
      if (result.success) {
        actions.push("Отправлено в канал Telegram");
        apiSuccess = true;
      } else {
        actions.push(`Ошибка API: ${result.message}`);
      }
    } else if (selectedPlatform.id === "vk") {
      const result = await publishToVK(credentials, text, image);
      if (result.success) {
        actions.push("Опубликовано в VK");
        apiSuccess = true;
      } else {
        actions.push(`Ошибка API VK: ${result.message}`);
      }
    } else if (selectedPlatform.id === "discord") {
      const result = await publishToDiscord(credentials, text, image);
      if (result.success) {
        actions.push("Опубликовано в Discord");
        apiSuccess = true;
      } else {
        actions.push(`Ошибка Discord: ${result.message}`);
      }
    }

    if (!apiSuccess) {
      if (text) {
        try {
          await navigator.clipboard.writeText(text);
          actions.push("Текст скопирован");
        } catch (err) {
          console.error("Clipboard failed", err);
        }
      }

      if (imagePreview) {
        const link = document.createElement("a");
        link.href = imagePreview;
        link.download = `contentguard_safe_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        actions.push("Фото сохранено");
      }

      setTimeout(() => {
        if (selectedPlatform.shareUrl) {
          const url = selectedPlatform.shareUrl(text);
          window.open(url, "_blank", "noopener,noreferrer");
        } else if (selectedPlatform.homeUrl) {
          window.open(
            selectedPlatform.homeUrl,
            "_blank",
            "noopener,noreferrer"
          );
        }
      }, 1000);
    }

    setToastMessage(`${actions.join(" & ")}`);
    setShowToast(true);
    setIsPublishing(false);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="h-screen w-screen bg-transparent flex flex-col font-sans text-zinc-100 selection:bg-white selection:text-black overflow-hidden">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        credentials={credentials}
        onSave={saveCredentials}
      />

      <GenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onGenerate={handleAIGeneratedText}
      />

      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          showMobileNav ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
            showMobileNav ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowMobileNav(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[80%] max-w-[300px] bg-zinc-900 border-r border-zinc-800 shadow-2xl transform transition-transform duration-300 flex flex-col ${
            showMobileNav ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <span className="font-bold text-lg tracking-tight text-white">
              Меню
            </span>
            <button
              onClick={() => setShowMobileNav(false)}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                ContentGuard
              </span>
            </div>

            <div className="h-px bg-zinc-800" />

            <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              СИСТЕМА АКТИВНА
            </div>

            <button
              onClick={() => {
                setShowSettings(true);
                setShowMobileNav(false);
              }}
              className="w-full flex items-center gap-3 p-4 bg-zinc-800 rounded-lg text-white font-medium hover:bg-zinc-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Настройки API
            </button>
          </div>
          <div className="mt-auto p-6 border-t border-zinc-800 text-[10px] text-zinc-600">
            v1.0.4 • ContentGuard Secure
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          showMobileAnalysis ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
            showMobileAnalysis ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowMobileAnalysis(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 w-[85%] max-w-[400px] bg-zinc-900 border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 flex flex-col ${
            showMobileAnalysis ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
            <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400">
              Результаты анализа
            </h3>
            <button
              onClick={() => setShowMobileAnalysis(false)}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <AnalysisPanel
              result={analysisResult}
              isLoading={isAnalyzing}
              onApplyFix={(fixed) => {
                applyFix(fixed);
                setShowMobileAnalysis(false);
              }}
            />
          </div>
        </div>
      </div>

      <nav className="h-16 shrink-0 z-40 glass-panel border-b border-zinc-800">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setShowMobileNav(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:flex w-8 h-8 bg-white rounded-lg items-center justify-center text-black shadow-lg shadow-white/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden lg:block">
              ContentGuard
            </span>
            <span className="font-bold text-lg tracking-tight text-white lg:hidden">
              ContentGuard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileAnalysis(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white relative"
            >
              <PanelRight className="w-6 h-6" />
              {analysisResult && !analysisResult.isSafe && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black"></span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-zinc-500 border-r border-zinc-800 pr-4 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              СИСТЕМА АКТИВНА
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="hidden lg:block p-2.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95 relative group btn-spring"
              title="Настройка API"
            >
              <Settings className="w-5 h-5" />
              {isReadyForIntegration && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-y-auto lg:overflow-hidden bg-black/20">
        <div className="w-full max-w-[1920px] mx-auto p-3 lg:p-6 lg:h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 pb-32 lg:pb-6">
          <div className="lg:col-span-5 flex flex-col h-[350px] lg:h-full lg:min-h-0 animate-slide-up order-1">
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl pro-shadow border border-zinc-800 flex flex-col h-full overflow-hidden group transition-all duration-300 hover:border-zinc-700">
              {/* Toolbar */}
              <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/95 backdrop-blur-sm z-10 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800 px-3 py-2 rounded-lg transition-all active:scale-95 btn-spring"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {image ? "Заменить" : "Медиа"}
                  </button>

                  <div className="w-px h-4 bg-zinc-800 mx-1"></div>

                  <button
                    onClick={() => setShowGenerationModal(true)}
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-3 py-2 rounded-lg transition-all active:scale-95 btn-spring"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Генератор
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing || (!text && !image)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 btn-spring
                      ${
                        isAnalyzing || (!text && !image)
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      }`}
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isAnalyzing ? "animate-spin" : ""
                      }`}
                    />
                    {isAnalyzing ? "..." : "Проверить"}
                  </button>
                </div>
              </div>

              <div className="flex-1 relative min-h-0">
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Напишите ваш пост здесь..."
                  className="w-full h-full p-6 resize-none outline-none text-lg md:text-xl font-light text-zinc-200 placeholder:text-zinc-700 bg-transparent leading-relaxed overflow-y-auto"
                  spellCheck={false}
                />
              </div>

              {imagePreview && (
                <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative group/img h-16 w-16 rounded-md overflow-hidden border border-zinc-700">
                      <img
                        src={imagePreview}
                        className="w-full h-full object-cover"
                        alt="Thumb"
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        onClick={removeImage}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      <p className="font-bold text-zinc-300">
                        Изображение прикреплено
                      </p>
                      <p className="hidden sm:block">
                        Будет проанализировано моделью GPT-4.1 Mini.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 text-[10px] font-mono text-zinc-600 flex justify-between uppercase tracking-widest shrink-0">
                <span>{text.length} симв</span>
                <span>{text.split(/\s+/).filter(Boolean).length} слов</span>
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-7 flex flex-col h-auto lg:h-full min-h-0 animate-slide-up order-2"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 h-auto lg:h-full min-h-0">
              <div className="flex-1 flex flex-col gap-4 min-h-0 lg:overflow-y-auto pr-0 lg:pr-1">
                <div className="bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 flex gap-1 shadow-lg shrink-0 overflow-x-auto no-scrollbar">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p)}
                      className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group btn-spring whitespace-nowrap
                          ${
                            selectedPlatform.id === p.id
                              ? "text-white shadow-md border border-zinc-700/50 bg-zinc-800"
                              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                          }`}
                    >
                      {selectedPlatform.id === p.id && (
                        <div
                          className={`absolute inset-0 opacity-10 ${p.color}`}
                        ></div>
                      )}
                      {p.id === "telegram" && (
                        <TelegramLogo
                          className={`w-4 h-4 ${
                            selectedPlatform.id === p.id
                              ? "text-[#229ED9]"
                              : "text-zinc-500 group-hover:text-zinc-400"
                          }`}
                        />
                      )}
                      {p.id === "vk" && (
                        <VKLogo
                          className={`w-4 h-4 ${
                            selectedPlatform.id === p.id
                              ? "text-[#0077FF]"
                              : "text-zinc-500 group-hover:text-zinc-400"
                          }`}
                        />
                      )}
                      {p.id === "discord" && (
                        <DiscordLogo
                          className={`w-4 h-4 ${
                            selectedPlatform.id === p.id
                              ? "text-[#5865F2]"
                              : "text-zinc-500 group-hover:text-zinc-400"
                          }`}
                        />
                      )}
                      <span className="relative z-10">{p.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 min-h-[350px]">
                  <PlatformPreview
                    platform={selectedPlatform}
                    text={text}
                    imagePreview={imagePreview}
                  />
                </div>

                <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 shadow-lg backdrop-blur-sm shrink-0">
                  <button
                    onClick={handlePublish}
                    disabled={!canPublish}
                    className={`w-full py-4 rounded-lg flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest transition-all btn-spring
                          ${
                            !canPublish
                              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800/50"
                              : "bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                          }`}
                  >
                    <Send
                      className={`w-4 h-4 ${
                        isPublishing ? "animate-ping" : ""
                      }`}
                    />
                    {isPublishing
                      ? "Публикация..."
                      : `Опубликовать в ${selectedPlatform.name}`}
                  </button>

                  <div className="flex justify-center mt-3 h-4 items-center">
                    {!isReadyForIntegration ? (
                      <span className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest">
                        Интеграция не настроена
                      </span>
                    ) : analysisResult?.isSafe ? (
                      <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                        Контент одобрен
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                        Ожидает проверки
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex xl:w-80 2xl:w-96 shrink-0 bg-zinc-900/50 backdrop-blur-sm rounded-xl pro-shadow border border-zinc-800 overflow-hidden flex-col h-full transition-all duration-300 hover:border-zinc-700">
                <AnalysisPanel
                  result={analysisResult}
                  isLoading={isAnalyzing}
                  onApplyFix={applyFix}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showToast && (
        <div className="fixed top-24 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-6 z-[70] animate-fade-in w-[90%] max-w-[400px]">
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Check className="w-4 h-4 text-black" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Уведомление
              </h4>
              <p className="text-sm text-zinc-300 mt-0.5 font-medium">
                {toastMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
