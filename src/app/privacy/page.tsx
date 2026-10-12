import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: '隱私權政策 (Privacy Policy) | MCARD',
  description: 'MCARD 寶可夢卡牌遙測與資產管理平台之 100% 本地優先隱私權政策與資料安全性聲明。',
};

export default function PrivacyPage() {
  return <LegalPageLayout activeTab="privacy" />;
}
