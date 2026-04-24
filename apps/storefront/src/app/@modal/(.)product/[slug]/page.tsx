import { notFound } from 'next/navigation';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { ThemeVars } from '@/lib/theme/theme-provider';
import { QuickViewModal } from '@/components/product/quick-view-modal';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SAMPLE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

/**
 * Intercepted-route modal: when a shopper clicks a product card anywhere
 * under the root layout, this page is rendered into the `@modal` parallel slot.
 * Direct-URL navigation to /product/[slug] bypasses the intercept and renders
 * the full page at app/product/[slug]/page.tsx instead.
 */
export default async function ProductQuickView({ params }: PageProps) {
  const { slug } = await params;
  const product = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <>
      <ThemeVars palette={product.theme_palette} />
      <QuickViewModal product={product} />
    </>
  );
}
