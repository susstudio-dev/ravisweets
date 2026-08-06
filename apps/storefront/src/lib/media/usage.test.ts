import { describe, expect, it } from 'vitest';
import { parsePageMedia, setSlot } from '../content/page-media';
import { scanAssetUsage } from './usage';

const EMPTY = parsePageMedia(undefined);

describe('scanAssetUsage', () => {
  it('names page slots in owner language', () => {
    let media = setSlot(EMPTY, 'about.portrait', { assetId: 'a1', alt: '' });
    media = setSlot(media, 'festivals.diwali', { assetId: 'a1', alt: '' });
    const hits = scanAssetUsage({
      assetId: 'a1',
      storagePath: 'general/a1.webp',
      pageMedia: media,
      products: [],
    });
    expect(hits.map((h) => h.where)).toEqual(['About page — portrait', 'Festival page — Diwali']);
  });

  it('matches products whose image URL contains the storage path', () => {
    const hits = scanAssetUsage({
      assetId: 'a2',
      storagePath: 'product/a2.webp',
      pageMedia: EMPTY,
      products: [
        {
          title: 'Kaju Katli',
          images: [
            { url: 'https://abc.supabase.co/storage/v1/object/public/media/product/a2.webp' },
          ],
        },
        { title: 'Motichoor Ladoo', images: [{ url: '/products/motichoor.webp' }] },
      ],
    });
    expect(hits).toEqual([{ where: 'Product — Kaju Katli' }]);
  });

  it('returns an empty list when the asset is unused', () => {
    const hits = scanAssetUsage({
      assetId: 'a3',
      storagePath: 'og/a3.webp',
      pageMedia: EMPTY,
      products: [{ title: 'Kaju Katli', images: [{ url: '/products/kaju.webp' }] }],
    });
    expect(hits).toEqual([]);
  });
});
