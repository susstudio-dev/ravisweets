/**
 * Serialise a JSON-LD object for safe injection into a <script> tag.
 *
 * `JSON.stringify` does NOT escape `<`, `>`, `&`, or the U+2028/U+2029 line
 * separators, so a string containing `</script>` (or a lone paragraph
 * separator) can break out of the script element — a stored-XSS sink the
 * moment any embedded value comes from the database or an admin editor.
 * This rewrites those code points to their `\uXXXX` form, which is still
 * valid JSON-LD but cannot terminate the script tag.
 */
export function jsonLdHtml(data: unknown): string {
  const backslash = String.fromCharCode(92);
  return JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (ch) => backslash + 'u' + ch.charCodeAt(0).toString(16).padStart(4, '0'),
  );
}
