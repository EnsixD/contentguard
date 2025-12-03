import React, { useState, useEffect } from "react";
import { PlatformCredentials } from "../types";
import { X, Lock, Check } from "./Icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: PlatformCredentials;
  onSave: (creds: PlatformCredentials) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSave,
}) => {
  const [localCreds, setLocalCreds] =
    useState<PlatformCredentials>(credentials);
  const [activeTab, setActiveTab] = useState<"telegram" | "vk" | "discord">(
    "telegram"
  );

  useEffect(() => {
    setLocalCreds(credentials);
  }, [credentials, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localCreds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all"
        onClick={onClose}
      ></div>

      <div className="relative bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-zinc-800">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-zinc-500" />
            <h2 className="font-bold text-white text-sm uppercase tracking-wide">
              Настройка API
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("telegram")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "telegram"
                ? "border-white text-white bg-zinc-800"
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            Telegram
          </button>
          <button
            onClick={() => setActiveTab("vk")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "vk"
                ? "border-white text-white bg-zinc-800"
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            VKontakte
          </button>
          <button
            onClick={() => setActiveTab("discord")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "discord"
                ? "border-white text-white bg-zinc-800"
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            Discord
          </button>
        </div>

        <div className="p-6 space-y-5 bg-zinc-900">
          {activeTab === "telegram" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Токен Бота (Bot Token)
                </label>
                <input
                  type="password"
                  value={localCreds.telegramToken}
                  onChange={(e) =>
                    setLocalCreds({
                      ...localCreds,
                      telegramToken: e.target.value,
                    })
                  }
                  placeholder="123456789:ABCdefGHIjkl..."
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  ID Чата / ID Канала
                </label>
                <input
                  type="text"
                  value={localCreds.telegramChatId}
                  onChange={(e) =>
                    setLocalCreds({
                      ...localCreds,
                      telegramChatId: e.target.value,
                    })
                  }
                  placeholder="@mychannel или -100123456789"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                />
                <p className="text-[10px] text-zinc-500 mt-2">
                  Убедитесь, что бот является администратором канала.
                </p>
              </div>
            </div>
          )}

          {activeTab === "vk" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-amber-900/20 border border-amber-900/50 rounded-lg text-amber-500 text-xs font-medium">
                <strong>Примечание:</strong> VK API требует настройки CORS или
                использования прокси. Прямая публикация из браузера может быть
                заблокирована.
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Access Token
                </label>
                <input
                  type="password"
                  value={localCreds.vkToken}
                  onChange={(e) =>
                    setLocalCreds({ ...localCreds, vkToken: e.target.value })
                  }
                  placeholder="vk1.a.Is..."
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  ID Владельца (ID Группы)
                </label>
                <input
                  type="text"
                  value={localCreds.vkOwnerId}
                  onChange={(e) =>
                    setLocalCreds({ ...localCreds, vkOwnerId: e.target.value })
                  }
                  placeholder="-123456789 (Используйте минус для групп)"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          {activeTab === "discord" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 text-xs">
                <strong>Метод 1: Webhook (Простой)</strong>
                <br />
                Integrations &gt; Webhooks &gt; New Webhook.
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  URL Вебхука
                </label>
                <input
                  type="password"
                  value={localCreds.discordWebhookUrl || ""}
                  onChange={(e) =>
                    setLocalCreds({
                      ...localCreds,
                      discordWebhookUrl: e.target.value,
                    })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="h-px bg-zinc-800 my-4"></div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 text-xs">
                <strong>Метод 2: Бот (Продвинутый)</strong>
                <br />
                Требуется Токен Бота и ID Канала. Оставьте поле Webhook пустым.
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  ID Канала (или ID Темы)
                </label>
                <input
                  type="text"
                  value={localCreds.discordChannelId || ""}
                  onChange={(e) =>
                    setLocalCreds({
                      ...localCreds,
                      discordChannelId: e.target.value,
                    })
                  }
                  placeholder="123456789012345678"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  При использовании Webhook, это поле работает как ID Темы
                  (Thread).
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Токен Бота
                </label>
                <input
                  type="password"
                  value={localCreds.discordBotToken || ""}
                  onChange={(e) =>
                    setLocalCreds({
                      ...localCreds,
                      discordBotToken: e.target.value,
                    })
                  }
                  placeholder="MTA..."
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <Check className="w-3 h-3" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
