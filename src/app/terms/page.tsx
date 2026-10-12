import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: '服務條款 (Terms of Service) | MCARD',
  description: 'MCARD 寶可夢卡牌遙測與資產管理平台之服務條款、智慧財產權與市場數據免責聲明。',
};

export default function TermsPage() {
  return <LegalPageLayout activeTab="terms" />;
}
