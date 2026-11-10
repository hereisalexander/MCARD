'use client';

import React, { useState, useRef } from 'react';
import { CommunityPost, CommunityPostType, CardTagInfo } from '@/types/community';
import { UserPortfolioItem } from '@/components/PortfolioDashboard';
import {
  CloseIcon,
  CameraIcon,
  TagIcon,
  UnboxIcon,
  ShieldCheckIcon,
  ChatBubbleIcon,
  BoxIcon,
  UploadIcon,
  LinkChainIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
} from '@/components/icons/AppIcons';

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: UserPortfolioItem[];
  onSubmitPost: (post: CommunityPost) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onSubmitPost,
}) => {

  const [postType, setPostType] = useState<CommunityPostType>('showcase');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [location, setLocation] = useState<string>('中國 (China)');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');

  // Optional card trade details for marketplace
  const [cardName, setCardName] = useState<string>('');
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [condition, setCondition] = useState<string>('Ungraded');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Real card photo upload state
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handleAddHashtag = () => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setContent((prev) => (prev ? `${prev} #` : '#'));
      return;
    }

    const startPos = textarea.selectionStart ?? content.length;
    const endPos = textarea.selectionEnd ?? content.length;
    const needsLeadingSpace =
      startPos > 0 &&
      content[startPos - 1] !== ' ' &&
      content[startPos - 1] !== '\n';
    const insertText = needsLeadingSpace ? ' #' : '#';

    const newContent =
      content.substring(0, startPos) + insertText + content.substring(endPos);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('請上傳有效的實物照片 (支援 JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('照片大小超過 10MB 限制，請選擇較小的圖片');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        if (result?.data?.url) {
          setImageUrl(result.data.url);
          setIsUploading(false);
          return;
        }
      }

      // 退避機制：若後端上傳服務未配置 R2，使用本地 FileReader 生成即時 Data URL 預覽
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('讀取照片失敗，請重試');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('讀取照片失敗，請重試');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleProcessFile(file);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPortfolioCard = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPortfolioId(pId);
    if (!pId) return;

    const matched = portfolio.find((item) => item.id === pId);
    if (!matched) return;

    setCardName(matched.name);
    setImageUrl(matched.imageUrl);
    setCondition(matched.condition || 'Ungraded');
    if (matched.price) {
      setAskingPrice(matched.price.toString());
    }
  };

  const handleTypeChange = (type: CommunityPostType) => {
    setPostType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('請填寫貼文標題');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('請填寫分享心得或貼文內容');
      return;
    }

    const finalImage =
      imageUrl.trim() ||
      'https://images.pokemontcg.io/sv3pt5/199_hires.png';

    // 從貼文內容中自動提取 #標籤（例如 #寶可夢151、#開箱）
    const extractedTags = Array.from(content.matchAll(/#([^\s#]+)/g))
      .map((match) => match[1].trim())
      .filter(Boolean);

    const defaultTypeTag =
      postType === 'showcase'
        ? '開箱曬卡'
        : postType === 'marketplace'
        ? '撿漏出清'
        : postType === 'grading'
        ? '評級開箱'
        : '交流討論';

    const tags = extractedTags.length > 0 ? extractedTags : [defaultTypeTag, '玩家分享'];

    const cardInfo: CardTagInfo | undefined =
      cardName.trim()
        ? {
            cardName: cardName.trim(),
            price: askingPrice ? parseFloat(askingPrice) : undefined,
            isForSale: postType === 'marketplace',
            condition: condition,
            imageUrl: finalImage,
          }
        : undefined;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author: {
        id: 'current-user',
        name: '我 (MCARD VIP 藏家)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        handle: '@my_tcg_vault',
        badge: '認證玩家',
        isVerified: true,
      },
      type: postType,
      title: title.trim(),
      content: content.trim(),
      imageUrl: finalImage,
      tags: tags.length > 0 ? tags : ['寶可夢TCG', '玩家分享'],
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      createdAt: '剛剛',
      location: location.trim() || undefined,
      cardInfo,
    };

    onSubmitPost(newPost);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-[max(env(safe-area-inset-top),16px)] bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-surface border border-hairline w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ferrari-red" />
            <h2 id="create-post-title" className="text-base font-bold text-foreground">
              發布社群動態・玩家帖子
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉視窗"
            className="p-1.5 rounded-full hover:bg-hairline/30 text-secondary transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              選擇帖子類型
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('showcase')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  postType === 'showcase'
                    ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                <UnboxIcon className="w-3.5 h-3.5 shrink-0" />
                <span>開箱曬卡</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('marketplace')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  postType === 'marketplace'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                <TagIcon className="w-3.5 h-3.5 shrink-0" />
                <span>撿漏出清</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('grading')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  postType === 'grading'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0" />
                <span>評級開箱</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('discussion')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  postType === 'discussion'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                <ChatBubbleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>交流討論</span>
              </button>
            </div>
          </div>

          {/* Quick Select from Portfolio */}
          {portfolio.length > 0 && (
            <div className="p-3.5 bg-background border border-hairline rounded-2xl">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-1.5">
                <BoxIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <span>快速從我的資產庫選擇卡牌 (可選)</span>
              </label>
              <select
                value={selectedPortfolioId}
                onChange={handleSelectPortfolioCard}
                className="w-full bg-surface border border-hairline rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-ferrari-red"
              >
                <option value="">-- 手動輸入或不綁定資產 --</option>
                {portfolio.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} ({card.condition || 'Ungraded'}) - 市價 ${card.price} USD
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              貼文標題 *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="分享近期入手的寶可夢卡牌收藏"
              className="w-full bg-background border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              分享心得 / 貼文詳情 *
            </label>
            <textarea
              ref={contentTextareaRef}
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享這張卡牌的獲得經歷、卡況品相、評級理由，或出清換卡的說明..."
              className="w-full bg-background border border-hairline rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red transition-all"
            />
            {/* 標籤按鈕置於文本框下方 */}
            <div className="flex items-center mt-1.5">
              <button
                type="button"
                onClick={handleAddHashtag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface hover:bg-hairline/60 border border-hairline text-xs font-bold text-ferrari-red transition-all cursor-pointer shadow-2xs"
                title="在內文中插入 #話題標籤"
              >
                <span># 話題標籤</span>
              </button>
            </div>
          </div>

          {/* Real Card Photo Upload / Image Selection */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider shrink-0 whitespace-nowrap">
                卡牌實物照片
              </label>
              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-background border border-hairline p-0.5 rounded-lg text-[11px] shrink-0 self-start sm:self-auto" role="group" aria-label="圖片上傳方式切換">
                <button
                  type="button"
                  onClick={() => setUploadMode('upload')}
                  aria-pressed={uploadMode === 'upload'}
                  aria-label="上傳實物照片"
                  tabIndex={0}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    uploadMode === 'upload'
                      ? 'bg-ferrari-red text-white font-bold shadow-2xs'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  <UploadIcon className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">上傳照片</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  aria-pressed={uploadMode === 'url'}
                  aria-label="外部圖片連結"
                  tabIndex={0}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    uploadMode === 'url'
                      ? 'bg-ferrari-red text-white font-bold shadow-2xs'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  <LinkChainIcon className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">圖片網址</span>
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="選取實物卡牌照片"
            />

            {/* Upload Area Mode */}
            {uploadMode === 'upload' ? (
              <div>
                {!imageUrl ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleTriggerFileInput}
                    role="button"
                    tabIndex={0}
                    aria-label="點擊拍攝或選取實物照片"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTriggerFileInput();
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 select-none ${
                      isDragging
                        ? 'border-ferrari-red bg-ferrari-red/10 scale-[1.01]'
                        : 'border-hairline hover:border-ferrari-red/60 hover:bg-surface-hover/50 bg-background/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center text-ferrari-red shadow-2xs">
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-ferrari-red border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CameraIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {isUploading ? '正在上傳並處理照片...' : '點擊拍攝、選取實物照片，或將照片拖曳至此'}
                      </p>
                      <p className="text-[11px] text-secondary">
                        支援手機相機拍照、相簿選取 (JPG, PNG, WEBP，單檔最大 10MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-background border border-hairline rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-black/10 border border-hairline/80 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="實物卡牌照片預覽"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.pokemontcg.io/sv3pt5/199_hires.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-xs font-bold text-foreground">實物相片已就緒</p>
                        </div>
                        <p className="text-[11px] text-secondary truncate mt-0.5">
                          已成功載入實物卡況照片
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleTriggerFileInput}
                        className="px-2.5 py-1.5 rounded-lg border border-hairline text-xs font-medium text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        更換照片
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* URL Input Mode */
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... 貼上卡牌圖片網址"
                  className="w-full bg-background border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red transition-all"
                />
                {imageUrl && (
                  <div className="flex items-center justify-between p-2.5 bg-background border border-hairline rounded-xl">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="預覽圖片"
                        className="w-12 h-16 object-contain rounded-lg bg-black/10 border border-hairline/50"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.pokemontcg.io/sv3pt5/199_hires.png';
                        }}
                      />
                      <span className="text-xs text-secondary">網路圖片預覽載入完成</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs text-red-500 hover:underline px-2 cursor-pointer"
                    >
                      清除
                    </button>
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-ferrari-red font-medium">{uploadError}</p>
            )}
          </div>

          {/* If Marketplace Type: Price */}
          {postType === 'marketplace' && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                <CurrencyDollarIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>出售意向價 (USD) *</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="例：120"
                className="w-full bg-surface border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Country / Region Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              所在國家 / 地區標記
            </label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-background border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-ferrari-red transition-all cursor-pointer appearance-none pr-8"
              >
                <optgroup label="亞太主要市場">
                  <option value="中國 (China)">中國 (China)</option>
                  <option value="澳門 (Macau)">澳門 (Macau)</option>
                  <option value="香港 (Hong Kong)">香港 (Hong Kong)</option>
                  <option value="台灣 (Taiwan)">台灣 (Taiwan)</option>
                  <option value="日本 (Japan)">日本 (Japan)</option>
                  <option value="新加坡 (Singapore)">新加坡 (Singapore)</option>
                  <option value="馬來西亞 (Malaysia)">馬來西亞 (Malaysia)</option>
                </optgroup>
                <optgroup label="美洲與歐洲市場">
                  <option value="美國 (United States)">美國 (United States)</option>
                  <option value="加拿大 (Canada)">加拿大 (Canada)</option>
                  <option value="英國 (United Kingdom)">英國 (United Kingdom)</option>
                  <option value="澳洲 (Australia)">澳洲 (Australia)</option>
                  <option value="歐洲其他 (Europe)">歐洲其他 (Europe)</option>
                  <option value="其他國家/地區 (Other)">其他國家/地區 (Other)</option>
                </optgroup>
                <option value="">不公開所在國家地區</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-secondary">
                <ChevronDownIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-ferrari-red hover:bg-ferrari-red/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-ferrari-red/20 transition-all transform active:scale-95 cursor-pointer"
            >
              即刻發布貼文
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
