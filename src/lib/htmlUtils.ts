// Decode HTML entities and clean text
const entityMap: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&hellip;': '…', '&mdash;': '—', '&ndash;': '–',
  '&laquo;': '«', '&raquo;': '»', '&nbsp;': ' ',
  '&#8220;': '\u201C', '&#8221;': '\u201D', '&#8216;': '\u2018', '&#8217;': '\u2019',
  '&#8230;': '…', '&#8211;': '–', '&#8212;': '—',
};

export function decodeHtmlEntities(text: string | null | undefined): string {
  if (!text) return '';
  let result = text;
  // Named and numeric entities
  for (const [entity, char] of Object.entries(entityMap)) {
    result = result.split(entity).join(char);
  }
  // Numeric entities &#NNN;
  result = result.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
  // Hex entities &#xHH;
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  // Strip remaining HTML tags
  result = result.replace(/<[^>]*>/g, '');
  // Clean extra whitespace
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

export function cleanArticleContent(html: string | null | undefined): string {
  if (!html) return '';
  let text = html;
  // Remove script/style tags and content
  text = text.replace(/<(script|style|nav|footer|header)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Convert <br> and <p> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/?(div|section|article)[^>]*>/gi, '\n');
  // Strip all HTML
  text = text.replace(/<[^>]*>/g, '');
  // Decode entities
  text = decodeHtmlEntities(text);
  // Fix excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}
