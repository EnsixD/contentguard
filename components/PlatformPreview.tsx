import React from "react";
import { PlatformConfig } from "../types";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  DiscordLogo,
  TelegramLogo,
  VKLogo,
  Bot,
} from "./Icons";

interface PlatformPreviewProps {
  platform: PlatformConfig;
  text: string;
  imagePreview: string | null;
}

const PlatformPreview: React.FC<PlatformPreviewProps> = ({
  platform,
  text,
  imagePreview,
}) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (platform.id === "telegram") {
    return (
      <div className="w-full bg-[#0F0F0F] rounded-xl overflow-hidden font-sans relative border border-zinc-800 h-full min-h-[400px] shadow-2xl flex flex-col">
        {/* Group Header */}
        <div className="bg-[#212121] px-4 py-3 flex items-center justify-between border-b border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              CG
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">
                Рабочий чат
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                24 участника, 5 онлайн
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-4 flex-1"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #1a1a1a 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 mb-1">
              <Bot className="w-4 h-4 text-white" />
            </div>

            <div className="max-w-[85%] bg-[#212121] rounded-xl rounded-bl-none p-2 shadow-lg border border-white/5 relative">
              {/* Sender Name */}
              <div className="px-2 pt-1 text-xs font-bold text-[#229ED9]">
                Администратор
              </div>

              {imagePreview && (
                <div className="mt-1 mb-2 rounded-lg overflow-hidden mx-1">
                  <img
                    src={imagePreview}
                    alt="TG"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="px-2 pb-1">
                <p className="text-[15px] text-white whitespace-pre-wrap leading-snug font-normal">
                  {text || (
                    <span className="text-zinc-600 italic">
                      Написание поста...
                    </span>
                  )}
                </p>
              </div>
              <div className="flex justify-end items-center gap-1.5 px-2 pb-1">
                <span className="text-[10px] text-zinc-500">{timeString}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform.id === "vk") {
    return (
      <div className="w-full bg-[#19191a] rounded-xl overflow-hidden font-sans border border-zinc-800 h-full min-h-[400px] shadow-2xl">
        <div className="bg-[#222222] m-4 rounded-xl border border-zinc-800 shadow-sm animate-fade-in">
          {/* Header */}
          <div className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0077FF] flex items-center justify-center text-white">
              <VKLogo className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e1e3e6]">
                ContentGuard Public
              </div>
              <div className="text-xs text-[#939393]">
                сегодня в {timeString}
              </div>
            </div>
          </div>

          <div className="px-3 pb-2">
            <p className="text-[13px] text-[#e1e3e6] whitespace-pre-wrap leading-relaxed">
              {text || (
                <span className="text-zinc-600 italic">Написание поста...</span>
              )}
            </p>
          </div>

          {imagePreview && (
            <div className="w-full h-64 bg-zinc-900 overflow-hidden relative">
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
                alt="VK"
              />
            </div>
          )}

          <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-800/50">
            <div className="flex items-center gap-4 text-[#939393]">
              <div className="flex items-center gap-1.5 bg-[#2b2b2b] px-3 py-1 rounded-full hover:text-[#b2b2b2] cursor-pointer transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-medium">42</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#b2b2b2] cursor-pointer transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium">12</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#b2b2b2] cursor-pointer transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-xs font-medium">5</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#939393]">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs">3K</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform.id === "discord") {
    return (
      <div className="w-full bg-[#313338] rounded-xl overflow-hidden font-sans border border-zinc-800 h-full min-h-[400px] flex flex-col shadow-2xl">
        <div className="h-12 border-b border-[#26272D] flex items-center px-4 shadow-sm bg-[#313338] z-10">
          <span className="text-zinc-400 text-xl mr-2">#</span>
          <span className="text-white font-bold text-sm">новости</span>
        </div>

        <div className="p-4 flex gap-4 animate-fade-in bg-[#313338] flex-1">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] shrink-0 flex items-center justify-center mt-0.5 overflow-hidden">
            <DiscordLogo className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-medium hover:underline cursor-pointer">
                ContentGuard Bot
              </span>
              <span className="bg-[#5865F2] text-white text-[10px] px-1.5 rounded-[3px] py-0.5 font-bold h-4 flex items-center">
                BOT
              </span>
              <span className="text-zinc-400 text-xs ml-1">
                Сегодня в {timeString}
              </span>
            </div>

            <p className="text-[#dbdee1] text-[15px] whitespace-pre-wrap leading-[1.375rem] font-light">
              {text || (
                <span className="text-zinc-500 italic">Написание поста...</span>
              )}
            </p>

            {imagePreview && (
              <div className="mt-2 max-w-[400px] rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <img
                  src={imagePreview}
                  className="w-full h-auto rounded-lg"
                  alt="Discord attachment"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-center text-zinc-500">Выберите платформу</div>
  );
};

export default PlatformPreview;
