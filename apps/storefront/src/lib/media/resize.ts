'use client';

/**
 * Client-side downscale before upload (spec §5.3) — browser-only, no test
 * coverage by design (vitest runs in a node environment with no canvas).
 *
 * Raster images are drawn to a canvas at ≤2400px long edge and re-encoded
 * as WebP q=0.82 — a phone's 12 MB HEIC-turned-JPEG becomes ~300 KB before
 * it ever leaves the owner's device. SVG passes through un-re-encoded.
 * The bucket's 8 MB limit is only a backstop against a bypassed client.
 */

const MAX_LONG_EDGE = 2400;
const WEBP_QUALITY = 0.82;
const MAX_BYTES = 8 * 1024 * 1024;

export async function prepareForUpload(
  file: File,
): Promise<{ blob: Blob; ext: string; mime: string; width: number | null; height: number | null }> {
  const type = file.type;

  // SVG: passthrough — re-encoding vector art to WebP would only lose it.
  if (type === 'image/svg+xml') {
    return { blob: file, ext: 'svg', mime: type, width: null, height: null };
  }

  if (!type.startsWith('image/')) {
    throw new Error(
      "That file isn't a photo — please choose a JPEG, PNG, WebP, AVIF or SVG image.",
    );
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = objectUrl;
    try {
      await img.decode();
    } catch {
      throw new Error("Couldn't read that image — the file may be damaged. Try exporting it again.");
    }

    const scale = Math.min(1, MAX_LONG_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error("This browser couldn't process the photo — try a different browser.");
    }
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
    );
    if (!blob) {
      throw new Error("This browser couldn't convert the photo — try a different browser.");
    }
    if (blob.size > MAX_BYTES) {
      throw new Error('That photo is still over 8 MB after shrinking — please pick a smaller one.');
    }
    return { blob, ext: 'webp', mime: 'image/webp', width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
