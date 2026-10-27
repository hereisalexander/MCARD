'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CardScanResult, PriceHistoryPoint } from '@/contracts/scan.schema';
import { CameraIcon, CloseIcon, SparklesIcon, CheckCircleIcon } from '@/components/icons/AppIcons';

export type ScannerStep = 'viewfinder' | 'analyzing' | 'result';

export interface CardScannerModalProps {
  isOpen: boolean;
  resetKey?: number;
  onClose: () => void;
  onAddToVault: (cardData: {
    name: string;
    category: string;
    price: number | null;
    buyPrice: number;
    condition: string;
    imageUrl: string;
    cardNumber?: string;
    setName?: string;
  }) => void;
  onCreateListing: (cardData: {
    name: string;
    category: string;
    askingPrice: number;
    condition: string;
    photoUrl: string;
    cardNumber?: string;
    setName?: string;
  }) => void;
}

export const CardScannerModal: React.FC<CardScannerModalProps> = ({
  isOpen,
  resetKey,
  onClose,
  onAddToVault,
  onCreateListing,
}) => {
  const [step, setStep] = useState<ScannerStep>('viewfinder');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<CardScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analysisStatusText, setAnalysisStatusText] = useState<string>('正在啟動多模態辨識...');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 停止鏡頭串流
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // 2. 啟動鏡頭串流 (優選後置環境鏡頭)
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('當前瀏覽器環境不支援相機存取，請改用圖片檔案上傳。');
        return;
      }

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('[Camera Access Warning]:', err);
      setCameraError('無法存取相機鏡頭，請確認是否已授權相機權限，或直接選擇照片上傳。');
    }
  }, [stopCamera]);

  // 監聽彈窗開關或外部點擊重置觸發，以啟動或釋放相機
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen) {
      setStep('viewfinder');
      setCapturedPhoto(null);
      setScanResult(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, resetKey, startCamera, stopCamera]);

  // 3. Canvas 壓縮圖片 (縮放長邊至 1200px 內，壓縮為輕量 JPEG)
  const compressImage = (source: HTMLVideoElement | HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const sourceWidth = 'videoWidth' in source ? source.videoWidth : source.naturalWidth;
    const sourceHeight = 'videoHeight' in source ? source.videoHeight : source.naturalHeight;

    if (!sourceWidth || !sourceHeight) return '';

    const maxDimension = 1000;
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
      if (sourceWidth > sourceHeight) {
        targetWidth = maxDimension;
        targetHeight = Math.round((sourceHeight * maxDimension) / sourceWidth);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((sourceWidth * maxDimension) / sourceHeight);
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // 4. 發送至後端辨識 API
  const analyzeImagePayload = async (base64Data: string) => {
    setStep('analyzing');
    setAnalysisStatusText('正在進行多模態卡牌特徵辨識...');

    const timer1 = setTimeout(() => {
      setAnalysisStatusText('正在聯網檢索 TCGplayer 與 eBay 最新二級市場成交行情...');
    }, 1800);

    const timer2 = setTimeout(() => {
      setAnalysisStatusText('正在解算歷史價格走勢節點並組裝數據...');
    }, 3800);

    try {
      const response = await fetch('/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || '辨識失敗，請重試或確認圖片清晰度。');
      }

      const result: CardScanResult = json.data;
      setScanResult(result);
      setStep('result');
      stopCamera();
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      const msg = err instanceof Error ? err.message : '發生未知錯誤';
      alert(`辨識失敗: ${msg}`);
      setStep('viewfinder');
      startCamera();
    }
  };

  // 拍照觸發
  const handleCaptureClick = () => {
    if (!videoRef.current) return;
    const compressed = compressImage(videoRef.current);
    if (!compressed) {
      alert('無法擷取畫面，請確認相機運作正常');
      return;
    }
    setCapturedPhoto(compressed);
    analyzeImagePayload(compressed);
  };

  // 本地照片上傳觸發
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        const compressed = compressImage(img);
        setCapturedPhoto(compressed);
        analyzeImagePayload(compressed);
      };
      img.src = loadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 拖曳上傳
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        const compressed = compressImage(img);
        setCapturedPhoto(compressed);
        analyzeImagePayload(compressed);
      };
      img.src = loadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 重拍
  const handleRescanClick = () => {
    setCapturedPhoto(null);
    setScanResult(null);
    setStep('viewfinder');
    startCamera();
  };

  // 一鍵入庫處理（autoClose 控制是否關閉彈窗）
  const handleConfirmVaultClick = (autoClose = true) => {
    if (!scanResult) return;
    const defaultPrice = scanResult.isGraded
      ? (resolvedPsa10Price || scanResult.pricing.currentPrice || 0)
      : (resolvedRawPrice || scanResult.pricing.currentPrice || 0);

    const conditionTag = scanResult.isGraded
      ? `${scanResult.gradingCompany || 'PSA'} ${scanResult.gradeScore || '10'}`
      : 'Ungraded';

    onAddToVault({
      name: scanResult.cardName,
      category: scanResult.category === 'unknown' ? 'pokemon' : scanResult.category,
      price: scanResult.pricing.currentPrice,
      buyPrice: defaultPrice,
      condition: conditionTag,
      imageUrl: capturedPhoto || '',
      cardNumber: scanResult.cardNumber,
      setName: scanResult.setName,
    });

    if (autoClose) {
      onClose();
    }
  };

  // 入庫並立即準備拍下一張
  const handleSaveAndScanNextClick = () => {
    handleConfirmVaultClick(false);
    setCapturedPhoto(null);
    setScanResult(null);
    setStep('viewfinder');
    startCamera();
  };

  // 一鍵刊登處理
  const handleConfirmListingClick = () => {
    if (!scanResult) return;
    const defaultAskingPrice = scanResult.isGraded
      ? (resolvedPsa10Price || scanResult.pricing.currentPrice || 0)
      : (resolvedRawPrice || scanResult.pricing.currentPrice || 0);

    const conditionTag = scanResult.isGraded
      ? `${scanResult.gradingCompany || 'PSA'} ${scanResult.gradeScore || '10'}`
      : 'Near Mint';

    onCreateListing({
      name: scanResult.cardName,
      category: scanResult.category === 'unknown' ? 'pokemon' : scanResult.category,
      askingPrice: defaultAskingPrice,
      condition: conditionTag,
      photoUrl: capturedPhoto || '',
      cardNumber: scanResult.cardNumber,
      setName: scanResult.setName,
    });
    onClose();
  };

  // 歷史走勢平滑 SVG 路徑計算
  const chartPathData = useMemo(() => {
    if (!scanResult || !scanResult.pricing.history || scanResult.pricing.history.length < 2) {
      return null;
    }

    const history: PriceHistoryPoint[] = scanResult.pricing.history;
    const prices = history.map((h) => h.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const pRange = maxP - minP || 1;

    const width = 360;
    const height = 90;
    const padX = 24;
    const padY = 16;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    const points = history.map((pt, idx) => {
      const x = padX + (idx / (history.length - 1)) * usableW;
      const normalizedY = (pt.price - minP) / pRange;
      const y = height - padY - normalizedY * usableH;
      return { x, y, price: pt.price, period: pt.period };
    });

    // 構建平滑貝茲曲線指令
    let lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const pCurrent = points[i];
      const pNext = points[i + 1];
      const controlX = (pCurrent.x + pNext.x) / 2;
      lineD += ` C ${controlX} ${pCurrent.y}, ${controlX} ${pNext.y}, ${pNext.x} ${pNext.y}`;
    }

    const areaD = `${lineD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    const startP = prices[0];
    const endP = prices[prices.length - 1];
    const diff = endP - startP;
    const pct = startP > 0 ? (diff / startP) * 100 : 0;

    return { lineD, areaD, points, diff, pct, isUp: diff >= 0 };
  }, [scanResult]);

  // 解析流通品相 (Raw) 參考價格（含智能兜底）
  const resolvedRawPrice = (() => {
    if (!scanResult) return null;
    if (typeof scanResult.pricing.rawPrice === 'number') return scanResult.pricing.rawPrice;
    if (!scanResult.isGraded && typeof scanResult.pricing.currentPrice === 'number') {
      return scanResult.pricing.currentPrice;
    }
    if (typeof scanResult.pricing.psa10Price === 'number') {
      return Number((scanResult.pricing.psa10Price / 2.8).toFixed(2));
    }
    if (typeof scanResult.pricing.currentPrice === 'number') {
      return Number((scanResult.pricing.currentPrice / 2.8).toFixed(2));
    }
    return null;
  })();

  // 解析 PSA 10 滿分評級參考價格（含智能兜底）
  const resolvedPsa10Price = (() => {
    if (!scanResult) return null;
    if (typeof scanResult.pricing.psa10Price === 'number') return scanResult.pricing.psa10Price;
    if (scanResult.isGraded && typeof scanResult.pricing.currentPrice === 'number') {
      return scanResult.pricing.currentPrice;
    }
    if (resolvedRawPrice !== null) {
      return Number((resolvedRawPrice * 2.8).toFixed(2));
    }
    return null;
  })();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI 智能拍照識卡"
      className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-2xl bg-surface sm:border sm:border-hairline/80 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 頂部標題列 (固定不滾動 + 手機頂部安全區避讓) */}
        <div className="shrink-0 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),14px)] pb-3.5 border-b border-hairline/60 bg-surface/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ferrari-red/10 border border-ferrari-red/30 flex items-center justify-center text-ferrari-red">
              <CameraIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm sm:text-base text-foreground tracking-tight flex items-center gap-1.5">
                <span>AI 智能識卡</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-ferrari-red text-white uppercase tracking-wider">
                  Camera 2.0
                </span>
              </h2>
              <p className="text-[11px] text-text-muted font-mono">Multimodal Vision & Real-time Grounding</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            tabIndex={0}
            aria-label="關閉"
            className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 隱藏的檔案上傳輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 中間內容區塊 (獨立滾動，頂部自然靠齊) */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 flex flex-col items-center ${step === 'result' ? 'justify-start' : 'justify-center'}`}>
          {/* ==================== 1. 取景框 (Viewfinder) ==================== */}
          {step === 'viewfinder' && (
            <div className="w-full flex flex-col items-center gap-4">
              {/* 取景畫布：標準卡牌 2.5:3.5 比例 */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[2.5/3.5] bg-black/60 rounded-2xl border border-hairline/60 overflow-hidden shadow-inner flex items-center justify-center group">
                {/* 視訊預覽 */}
                {!cameraError ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center text-text-muted flex flex-col items-center gap-3">
                    <CameraIcon className="w-8 h-8 opacity-40 text-ferrari-red" />
                    <p className="text-xs leading-relaxed">{cameraError}</p>
                    <button
                      type="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-surface border border-hairline hover:border-ferrari-red text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
                    >
                      點擊選擇本地卡片照片
                    </button>
                  </div>
                )}

                {/* 2.5:3.5 極簡標準對齊導引框 */}
                <div className="absolute inset-4 rounded-xl border border-white/40 pointer-events-none flex flex-col justify-between p-3">
                  {/* 四角極簡定位微標 */}
                  <div className="flex justify-between items-start">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-ferrari-red" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-ferrari-red" />
                  </div>
                  <div className="text-center">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 text-white/90 text-[10px] font-mono tracking-wide backdrop-blur-xs">
                      將卡牌置於框內
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-ferrari-red" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-ferrari-red" />
                  </div>
                </div>
              </div>

              {/* 拍攝與選取操作欄 */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="從相簿選取圖片"
                  className="px-3.5 py-2 rounded-xl bg-surface-hover/80 hover:bg-surface-hover border border-hairline text-xs font-medium text-text-muted hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>從相片選取</span>
                </button>

                {/* 快門按鈕 */}
                <button
                  type="button"
                  tabIndex={0}
                  onClick={handleCaptureClick}
                  disabled={!!cameraError}
                  aria-label="拍攝辨識"
                  className="w-14 h-14 rounded-full bg-ferrari-red hover:bg-ferrari-red/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-white" />
                  </div>
                </button>

                <button
                  type="button"
                  tabIndex={0}
                  onClick={startCamera}
                  aria-label="重新整理鏡頭"
                  className="px-3.5 py-2 rounded-xl bg-surface-hover/80 hover:bg-surface-hover border border-hairline text-xs font-medium text-text-muted hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>重新整理鏡頭</span>
                </button>
              </div>

              <p className="text-[11px] text-text-muted text-center max-w-xs mt-1">
                支援全領域卡牌：Pokémon、遊戲王、航海王、七龍珠及 PSA/BGS 評級卡盒。
              </p>
            </div>
          )}

          {/* ==================== 2. 分析中過渡 (Analyzing) ==================== */}
          {step === 'analyzing' && (
            <div className="w-full flex flex-col items-center gap-6 py-6">
              {/* 實拍卡圖凍結預覽 + 微光掃描線 */}
              <div className="relative w-full max-w-[260px] aspect-[2.5/3.5] rounded-2xl overflow-hidden border border-ferrari-red/50 shadow-2xl bg-black">
                {capturedPhoto && (
                  <img
                    src={capturedPhoto}
                    alt="實拍預覽"
                    className="w-full h-full object-cover opacity-75"
                  />
                )}
                {/* 柔和呼吸掃描光條 */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-ferrari-red to-transparent animate-pulse shadow-[0_0_12px_rgba(230,0,0,0.8)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              </div>

              {/* 狀態提示 */}
              <div className="flex flex-col items-center gap-2 text-center max-w-sm">
                <div className="flex items-center gap-2 text-ferrari-red font-mono text-xs font-bold tracking-wider uppercase">
                  <SparklesIcon className="w-4 h-4 animate-spin" />
                  <span>Gemini Multimodal Appraiser</span>
                </div>
                <p className="font-sans text-sm font-semibold text-foreground animate-pulse">
                  {analysisStatusText}
                </p>
                <p className="text-[11px] font-mono text-text-muted">
                  透過 Google Search 檢索最新成交行情中...
                </p>
              </div>
            </div>
          )}

          {/* ==================== 3. 結果確認面板 (Result View) ==================== */}
          {step === 'result' && scanResult && (
            <div className="w-full flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* 左側：實拍照片縮圖 */}
                <div className="relative w-full sm:w-[190px] aspect-[2.5/3.5] rounded-xl overflow-hidden border border-hairline/80 shadow-md bg-surface shrink-0 mx-auto sm:mx-0">
                  {capturedPhoto ? (
                    <img
                      src={capturedPhoto}
                      alt={scanResult.cardName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-hover text-text-muted text-xs">
                      實拍照片
                    </div>
                  )}

                  {/* 評級鑑定標籤 */}
                  {scanResult.isGraded && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-amber-400/80 text-amber-300 font-mono text-[10px] font-bold tracking-wider backdrop-blur-xs flex items-center gap-1 shadow-sm">
                      <span>{scanResult.gradingCompany || 'PSA'}</span>
                      <span>{scanResult.gradeScore || '10'}</span>
                    </div>
                  )}

                  {/* 分類標籤 */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface/90 border border-hairline text-foreground font-mono text-[10px] uppercase font-bold tracking-wider backdrop-blur-xs">
                    {scanResult.category}
                  </div>
                </div>

                {/* 右側：解析參數與實時行情 */}
                <div className="flex-1 w-full flex flex-col gap-3">
                  {/* 標題與基本資料 */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-text-muted">
                        {scanResult.cardNumber || '無卡號'}
                      </span>
                      {scanResult.rarity && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-ferrari-red/10 text-ferrari-red border border-ferrari-red/20">
                          {scanResult.rarity}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans font-bold text-lg sm:text-xl text-foreground leading-snug mt-0.5">
                      {scanResult.cardName}
                    </h3>
                    <p className="text-xs text-text-muted font-sans mt-0.5">
                      {scanResult.setName || '未指定系列名稱'}
                    </p>
                  </div>

                  {/* 實時行情卡片 (流通品相 vs PSA 10 評級雙價格清晰標示) */}
                  <div className="p-3.5 rounded-xl bg-surface-hover/60 border border-hairline/80 flex flex-col gap-2.5">
                    {/* 1. 流通品相價格 */}
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                        <span className="text-xs font-semibold text-foreground">
                          流通品相
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                          {resolvedRawPrice !== null ? `$${resolvedRawPrice.toFixed(2)}` : '--'}
                        </span>
                        <span className="font-mono text-xs text-text-muted">USD</span>
                      </div>
                    </div>

                    {/* 2. PSA 10 價格 */}
                    <div className="flex items-baseline justify-between border-t border-hairline/50 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                          PSA 10
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-amber-500 dark:text-amber-400 tabular-nums">
                          {resolvedPsa10Price !== null ? `$${resolvedPsa10Price.toFixed(2)}` : '--'}
                        </span>
                        <span className="font-mono text-xs text-text-muted">USD</span>
                      </div>
                    </div>

                    {/* 預估市場區間與資料來源 */}
                    <div className="flex flex-col gap-1 border-t border-hairline/40 pt-1.5 text-[10px] font-mono text-text-muted">
                      {scanResult.pricing.priceRange && (
                        <div className="flex items-center justify-between">
                          <span>預估市場區間</span>
                          <span className="font-medium text-foreground">
                            ${scanResult.pricing.priceRange.low?.toFixed(2) || '0'} ~ $
                            {scanResult.pricing.priceRange.high?.toFixed(2) || '0'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-text-muted/80">
                        <span>來源: {scanResult.pricing.source}</span>
                        <span>更新: {scanResult.pricing.lastUpdated.split('T')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* 歷史價格走勢圖 (SVG 貝茲平滑曲線) */}
                  {chartPathData && (
                    <div className="p-3 rounded-xl bg-surface border border-hairline/70 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground">歷史趨勢分析 (1Y)</span>
                        <span
                          className={`font-mono text-xs font-bold tabular-nums ${
                            chartPathData.isUp ? 'text-semantic-success' : 'text-ferrari-red'
                          }`}
                        >
                          {chartPathData.isUp ? '▲ +' : '▼ '}
                          {chartPathData.pct.toFixed(1)}%
                        </span>
                      </div>

                      <div className="w-full h-[76px] relative overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 360 90" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="scannerChartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#E60000" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#E60000" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d={chartPathData.areaD} fill="url(#scannerChartGrad)" />
                          <path
                            d={chartPathData.lineD}
                            fill="none"
                            stroke="#E60000"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />
                          {chartPathData.points.map((pt, i) => (
                            <circle
                              key={i}
                              cx={pt.x}
                              cy={pt.y}
                              r="3"
                              fill="#FFFFFF"
                              stroke="#E60000"
                              strokeWidth="1.5"
                            />
                          ))}
                        </svg>
                      </div>

                      {/* 時間軸標註 */}
                      <div className="flex justify-between text-[10px] font-mono text-text-muted px-2">
                        {chartPathData.points.map((pt, i) => (
                          <span key={i}>{pt.period}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== 底部固定操作列 (Footer：吸底固定 + 安全區避讓) ==================== */}
        {step === 'result' && (
          <div className="shrink-0 w-full px-4 sm:px-6 py-3 pb-[max(env(safe-area-inset-bottom),14px)] border-t border-hairline/60 bg-surface/95 backdrop-blur-md z-10 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              tabIndex={0}
              onClick={handleRescanClick}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-hairline text-xs font-semibold text-text-muted hover:text-foreground transition-all cursor-pointer text-center"
            >
              放棄重拍
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={handleConfirmListingClick}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-surface border border-hairline hover:border-text-muted text-xs font-semibold text-foreground transition-all cursor-pointer text-center shadow-xs"
            >
              刊登市集
            </button>

            <div className="flex-1 w-full flex items-center gap-2">
              <button
                type="button"
                tabIndex={0}
                onClick={handleSaveAndScanNextClick}
                className="flex-1 px-3 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-ferrari-red/40 hover:border-ferrari-red text-xs font-bold text-ferrari-red transition-all cursor-pointer text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <CameraIcon className="w-4 h-4" />
                <span>入庫並拍下一張</span>
              </button>

              <button
                type="button"
                tabIndex={0}
                onClick={() => handleConfirmVaultClick(true)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-ferrari-red hover:bg-ferrari-red/90 text-white text-xs font-bold transition-all cursor-pointer text-center shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>存入並完成</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
