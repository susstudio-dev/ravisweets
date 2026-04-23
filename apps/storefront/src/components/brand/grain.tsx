/**
 * Grain overlay — absolute-positioned layer consuming --theme-grain-opacity.
 * Disabled under prefers-reduced-motion via CSS in globals.css (.grain-overlay display: none).
 * Parent must be position: relative.
 */
export function Grain() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
