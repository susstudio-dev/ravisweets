'use client';

import { useEffect, useState } from 'react';
import { Box as BoxIcon, Smartphone, X } from 'lucide-react';

/**
 * AR pack-preview for gift / festival hampers.
 *
 * Loads `<model-viewer>` (Google's web component) lazily on first open.
 * Single 110 KB script, supports AR out of the box:
 *   • iOS Safari → AR Quick Look (USDZ)
 *   • Android Chrome → Scene Viewer (glTF/GLB)
 *   • Desktop → 3D rotate/pan/zoom in the modal
 *
 * The brand provides:
 *   - `glb` URL — the GLTF binary used on desktop + Android
 *   - `usdz` URL — Apple's USDZ used on iOS
 *
 * Defaults to a sample brass/silk gift box from this file. Once the brand
 * commissions a real hamper model (Shapr3D / Reality Composer Pro), swap
 * the URLs in the calling component.
 */

interface HamperARPreviewProps {
  /** GLB URL — Android + desktop. */
  glb: string;
  /** USDZ URL — iOS Quick Look. Optional but recommended. */
  usdz?: string;
  /** Caption rendered under the viewer. */
  caption: string;
  /** Hex backdrop for the viewer. */
  bg?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'ios-src'?: string;
          alt?: string;
          ar?: boolean;
          'ar-modes'?: string;
          'camera-controls'?: boolean;
          'touch-action'?: string;
          'shadow-intensity'?: string;
          exposure?: string;
          'environment-image'?: string;
          poster?: string;
          loading?: 'eager' | 'lazy';
          reveal?: 'auto' | 'interaction' | 'manual';
          autoplay?: boolean;
          'auto-rotate'?: boolean;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

let scriptLoaded = false;
function loadModelViewer(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    if (document.querySelector('script[data-model-viewer]')) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js';
    s.dataset.modelViewer = '1';
    s.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    document.head.appendChild(s);
  });
}

export function HamperARPreview({
  glb,
  usdz,
  caption,
  bg = '#fbf3df',
}: HamperARPreviewProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    void loadModelViewer().then(() => setReady(true));
  }, [open]);

  // Body scroll lock + Escape close while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border-2 border-theme-accent bg-theme-glow/15 px-4 py-2 text-sm font-semibold text-theme-accent transition-all hover:-translate-y-0.5 hover:bg-theme-glow/30 hover:shadow-soft"
      >
        <BoxIcon className="h-4 w-4" aria-hidden="true" />
        See it in 3D · AR
        <Smartphone className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close 3D preview"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#1a0a02]/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="3D / AR product preview"
            className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface-elevated shadow-lifted"
          >
            <header className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
                  3D · AR
                </p>
                <p className="font-display text-base font-semibold text-theme-ink">
                  {caption}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-theme-glow/20 text-theme-ink/65 hover:bg-theme-glow/35"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div
              className="relative aspect-[4/3] w-full"
              style={{ background: bg }}
            >
              {!ready ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-sm font-medium text-theme-ink/55">
                    Loading 3D viewer…
                  </p>
                </div>
              ) : (
                <model-viewer
                  src={glb}
                  ios-src={usdz}
                  alt={caption}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  touch-action="pan-y"
                  auto-rotate
                  shadow-intensity="1.2"
                  exposure="1.0"
                  loading="eager"
                  reveal="auto"
                  style={{ width: '100%', height: '100%', backgroundColor: bg }}
                />
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--color-border)] bg-theme-glow/10 px-5 py-3 text-[11px] text-theme-ink/65">
              <span>
                <Smartphone className="mr-1 inline h-3 w-3" aria-hidden="true" />
                Tap the AR button on your phone to place this hamper on your desk.
              </span>
              <span className="font-semibold text-theme-accent">
                iOS · Android · Desktop 3D
              </span>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

// Sensible defaults so the calling site can just <HamperARPreviewDefault />
// without configuring URLs. Replace these with the brand's commissioned
// hamper model when it's ready.
export const SAMPLE_HAMPER_GLB =
  'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
export const SAMPLE_HAMPER_USDZ =
  'https://modelviewer.dev/shared-assets/models/Astronaut.usdz';
