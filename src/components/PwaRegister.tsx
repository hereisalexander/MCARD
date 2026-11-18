"use client";

import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaRegister: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // 註冊 Service Worker
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      const handleWindowLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      };

      window.addEventListener("load", handleWindowLoad);

      // 監聽 PWA 安裝提示事件
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("load", handleWindowLoad);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
      } else {
        console.log("[PWA] User dismissed the install prompt");
      }
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    } finally {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleDismissClick = () => {
    setIsDismissed(true);
  };

  const handleKeyDownDismiss = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDismissClick();
    }
  };

  const handleKeyDownInstall = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleInstallClick();
    }
  };

  // 早退出：若不可安裝或已被藏家關閉，則不渲染橫幅
  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <aside
      role="banner"
      aria-label="PWA 應用程式安裝提示"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 md:bottom-6 md:right-6 md:left-auto md:w-96"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-gradient-to-br from-red-600/30 to-black/60 shadow-inner">
            <span className="font-mono text-sm font-black tracking-wider text-red-500">MC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">安裝 MCARD 應用程式</span>
            <span className="text-xs text-neutral-400">取得極致全螢幕原生體驗與離線快取</span>
          </div>
        </div>

        <button
          type="button"
          tabIndex={0}
          aria-label="關閉安裝提示"
          onClick={handleDismissClick}
          onKeyDown={handleKeyDownDismiss}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          tabIndex={0}
          aria-label="立即安裝 MCARD PWA"
          onClick={handleInstallClick}
          onKeyDown={handleKeyDownInstall}
          className="flex-1 rounded-xl bg-ferrari-red py-2.5 px-3 text-center text-xs font-semibold text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          立即安裝
        </button>
        <button
          type="button"
          tabIndex={0}
          aria-label="稍後再說"
          onClick={handleDismissClick}
          onKeyDown={handleKeyDownDismiss}
          className="rounded-xl border border-white/10 bg-neutral-800/80 py-2.5 px-3 text-center text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
        >
          稍後再說
        </button>
      </div>
    </aside>
  );
};
