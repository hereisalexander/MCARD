'use client';

import React, { useState } from 'react';
import { CommunityPost, CommunityPostType, CardTagInfo } from '@/types/community';
import { UserPortfolioItem } from '@/components/PortfolioDashboard';
import { CloseIcon } from '@/components/icons/AppIcons';

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
  const [tagsInput, setTagsInput] = useState<string>('寶可夢151, 曬卡分享');
  const [location, setLocation] = useState<string>('台北市');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');

  // Optional card trade details for marketplace
  const [cardName, setCardName] = useState<string>('');
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [condition, setCondition] = useState<string>('Ungraded');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

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
    if (type === 'marketplace' && !tagsInput.includes('撿漏出清')) {
      setTagsInput((prev) => (prev ? `${prev}, 撿漏出清` : '撿漏出清, 好價秒出'));
    } else if (type === 'grading' && !tagsInput.includes('PSA開箱')) {
      setTagsInput((prev) => (prev ? `${prev}, PSA開箱, 評級心得` : 'PSA開箱, 評級心得'));
    }
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

    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => Boolean(t));

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
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
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  postType === 'showcase'
                    ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                🎁 開箱曬卡
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('marketplace')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  postType === 'marketplace'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                🏷️ 撿漏出清
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('grading')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  postType === 'grading'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                🏆 評級開箱
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('discussion')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  postType === 'discussion'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-background hover:bg-hairline/40 text-secondary border-hairline'
                }`}
              >
                💬 交流討論
              </button>
            </div>
          </div>

          {/* Quick Select from Portfolio */}
          {portfolio.length > 0 && (
            <div className="p-3.5 bg-background border border-hairline rounded-2xl">
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                📦 快速從我的資產庫選擇卡牌 (可選)
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
              placeholder="例如：剛開箱 151 特典包單抽出神賞！手都在發抖..."
              className="w-full bg-background border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              分享心得 / 貼文詳情 *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享這張卡牌的獲得經歷、卡況品相、評級理由，或出清換卡的說明..."
              className="w-full bg-background border border-hairline rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red transition-all"
            />
          </div>

          {/* Image URL with Preview */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              卡牌圖片連結 (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.pokemontcg.io/..."
                className="flex-1 bg-background border border-hairline rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red"
              />
              <button
                type="button"
                onClick={() => setImageUrl('https://images.pokemontcg.io/sv3pt5/199_hires.png')}
                className="px-3 py-2 bg-hairline/40 hover:bg-hairline/70 text-xs font-medium text-foreground rounded-xl transition-colors whitespace-nowrap"
              >
                帶入範例圖
              </button>
            </div>
            {imageUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2 bg-background border border-hairline rounded-xl">
                <img
                  src={imageUrl}
                  alt="預覽圖片"
                  className="w-12 h-16 object-contain rounded-lg bg-black/10 border border-hairline/50"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.pokemontcg.io/sv3pt5/199_hires.png';
                  }}
                />
                <span className="text-xs text-secondary">圖片預覽載入中...</span>
              </div>
            )}
          </div>

          {/* If Marketplace Type: Price & Condition */}
          {postType === 'marketplace' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  💰 出售意向價 (USD) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="例：120"
                  className="w-full bg-surface border border-hairline rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  品相等級
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-surface border border-hairline rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                >
                  <option value="Ungraded">Ungraded (原卡微瑕/近全美)</option>
                  <option value="PSA 10">PSA 10 Gem Mint</option>
                  <option value="PSA 9">PSA 9 Mint</option>
                  <option value="BGS 10">BGS 10 Pristine</option>
                  <option value="CGC 10">CGC 10 Pristine</option>
                </select>
              </div>
            </div>
          )}

          {/* Tags & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                話題標籤 (用逗號隔開)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="例如：開箱大捷, 噴火龍SAR"
                className="w-full bg-background border border-hairline rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                所在城市 / 位置標記
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例如：台北市・信義區"
                className="w-full bg-background border border-hairline rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-hairline flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-secondary hover:text-foreground transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-ferrari-red hover:bg-ferrari-red/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-ferrari-red/20 transition-all transform active:scale-95"
            >
              🚀 即刻發布貼文
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
