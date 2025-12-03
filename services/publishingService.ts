
import { PlatformCredentials } from "../types";

export interface PublishResult {
  success: boolean;
  message: string;
}

/**
 * Publishes content to Telegram via Bot API
 */
export const publishToTelegram = async (
  credentials: PlatformCredentials, 
  text: string, 
  image: File | null
): Promise<PublishResult> => {
  const { telegramToken, telegramChatId } = credentials;

  if (!telegramToken || !telegramChatId) {
    return { success: false, message: "Отсутствуют учетные данные Telegram" };
  }

  try {
    const formData = new FormData();
    formData.append("chat_id", telegramChatId);
    
    // Telegram caps captions at 1024 chars, split if necessary or just warn
    const caption = text.length > 1024 ? text.substring(0, 1021) + "..." : text;

    let endpoint = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

    if (image) {
      endpoint = `https://api.telegram.org/bot${telegramToken}/sendPhoto`;
      formData.append("photo", image);
      if (caption) formData.append("caption", caption);
    } else {
      formData.append("text", text);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || "Ошибка API Telegram");
    }

    return { success: true, message: "Успешно отправлено в Telegram" };
  } catch (error: any) {
    console.error("Telegram Publish Error:", error);
    return { success: false, message: error.message || "Не удалось опубликовать в Telegram" };
  }
};

/**
 * Publishes content to VK via Wall.Post
 */
export const publishToVK = async (
  credentials: PlatformCredentials,
  text: string,
  image: File | null
): Promise<PublishResult> => {
  const { vkToken, vkOwnerId } = credentials;

  if (!vkToken || !vkOwnerId) {
    return { success: false, message: "Отсутствуют учетные данные VK" };
  }
  
  try {
    const params = new URLSearchParams({
      access_token: vkToken,
      owner_id: vkOwnerId, 
      message: text,
      v: '5.131'
    });

    if (image) {
       return { success: false, message: "Загрузка фото в VK через API требует прокси. Используйте ссылку 'Поделиться'." };
    }

    const response = await fetch(`https://api.vk.com/method/wall.post?${params.toString()}`, {
        method: 'GET',
        mode: 'cors'
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.error_msg);
    }

    return { success: true, message: "Успешно опубликовано на стене VK" };
  } catch (error: any) {
    console.error("VK Publish Error:", error);
    return { success: false, message: "Ошибка API VK (CORS). Используйте кнопку 'Поделиться'." };
  }
};

/**
 * Publishes content to Discord via Webhook or Bot API
 */
export const publishToDiscord = async (
  credentials: PlatformCredentials,
  text: string,
  image: File | null
): Promise<PublishResult> => {
  const { discordWebhookUrl, discordBotToken, discordChannelId } = credentials;

  // Mode 1: Webhook (Preferred for simple messaging)
  if (discordWebhookUrl) {
    try {
      if (!discordWebhookUrl.startsWith('https://discord.com/api/webhooks')) {
        return { success: false, message: "Неверный формат URL вебхука Discord" };
      }

      // If Channel ID is provided with webhook, treat it as a thread_id
      let url = discordWebhookUrl;
      if (discordChannelId) {
        url += `?thread_id=${discordChannelId}`;
      }

      if (image) {
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify({ content: text }));
        formData.append('file', image);

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
           throw new Error(`Ошибка Discord Webhook: ${response.status}`);
        }
      } else {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка Discord Webhook: ${response.status}`);
        }
      }

      return { success: true, message: "Успешно опубликовано через Discord Webhook" };

    } catch (error: any) {
      console.error("Discord Webhook Error:", error);
      return { success: false, message: error.message || "Не удалось отправить через Webhook" };
    }
  } 
  
  // Mode 2: Bot API (Advanced, requires token and channel)
  else if (discordBotToken && discordChannelId) {
    try {
      const endpoint = `https://discord.com/api/v10/channels/${discordChannelId}/messages`;
      const headers = {
        'Authorization': `Bot ${discordBotToken}`
      };

      if (image) {
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify({ content: text }));
        formData.append('file', image);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: headers, // FormData automatically sets boundary, but we need Auth
          body: formData,
        });
        
        if (!response.ok) throw new Error(`Ошибка Discord API: ${response.status}`);
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: text }),
        });

        if (!response.ok) throw new Error(`Ошибка Discord API: ${response.status}`);
      }

      return { success: true, message: "Успешно опубликовано через Discord Bot" };

    } catch (error: any) {
      console.error("Discord Bot API Error:", error);
      return { success: false, message: "Ошибка Discord Bot API (CORS или токен)" };
    }
  }

  return { success: false, message: "Отсутствуют данные Discord (Webhook URL или Токен Бота)" };
};