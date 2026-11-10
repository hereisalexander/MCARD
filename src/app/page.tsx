import { Suspense } from 'react';
import { HomeClient } from '@/components/HomeClient';
import { normalizeNavigationTab } from '@/constants/navigation';

interface PageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab = normalizeNavigationTab(resolvedParams?.tab);

  return (
    <Suspense fallback={null}>
      <HomeClient initialTab={initialTab} />
    </Suspense>
  );
}
