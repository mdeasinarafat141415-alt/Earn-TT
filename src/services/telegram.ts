/**
 * TT BOT - Telegram WebApp SDK Wrapper
 * Safely accesses Telegram WebApp properties & methods with fallbacks for browser preview
 */

import { TelegramWebApp, TelegramWebAppUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export class TelegramService {
  private static instance: TelegramService;
  public readonly isAvailable: boolean = false;
  private webApp?: TelegramWebApp;

  private constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.isAvailable = Boolean(this.webApp.initData || this.webApp.initDataUnsafe?.user);
      
      // Initialize Telegram Mini App defaults
      try {
        this.webApp.ready();
        this.webApp.expand();
        if (typeof this.webApp.enableClosingConfirmation === 'function') {
          this.webApp.enableClosingConfirmation();
        }
      } catch (e) {
        console.warn('Failed to call WebApp lifecycle methods:', e);
      }
    }
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  public getWebApp(): TelegramWebApp | undefined {
    return this.webApp;
  }

  public isRunningInTelegram(): boolean {
    return Boolean(this.webApp?.initData && this.webApp.initData.length > 0);
  }

  public getRawInitData(): string {
    return this.webApp?.initData || '';
  }

  public getUser(): { user: TelegramWebAppUser; isSimulated: boolean } {
    if (this.webApp?.initDataUnsafe?.user) {
      return {
        user: this.webApp.initDataUnsafe.user,
        isSimulated: false,
      };
    }

    // Default preview fallback when tested in desktop/standard browser
    return {
      user: {
        id: 748291045,
        first_name: 'Alex',
        last_name: 'Vance',
        username: 'alex_tapmaster',
        is_premium: true,
        language_code: 'en',
      },
      isSimulated: true,
    };
  }

  public triggerHaptic(
    type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error' | 'selection'
  ): void {
    if (!this.webApp?.HapticFeedback) return;
    try {
      if (type === 'selection') {
        this.webApp.HapticFeedback.selectionChanged();
      } else if (type === 'success' || type === 'warning' || type === 'error') {
        this.webApp.HapticFeedback.notificationOccurred(type);
      } else {
        this.webApp.HapticFeedback.impactOccurred(type);
      }
    } catch {
      // Haptics not supported on device
    }
  }

  public openLink(url: string): void {
    if (this.webApp?.openTelegramLink && url.includes('t.me/')) {
      this.webApp.openTelegramLink(url);
    } else if (this.webApp?.openLink) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  public openTelegramShare(text: string, url: string): void {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    this.openLink(shareUrl);
  }
}

export const telegram = TelegramService.getInstance();
