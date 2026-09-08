// Split the original template once. Never scan inserted markers for blanks:
// the old __PH_0__ markers matched the underscore rule and froze the browser.
export function highlightAnswers(front: string, back: string): string {
  const blank = /\([ 　\t]*\)|[＿_]{2,}|\(\s*[^)]+?(?:\s*\/\s*[^)]+?)+\s*\)/;
  const template = front.split('\n').find(line => blank.test(line));
  if (!template || !back) return back;
  // Adjacent blanks form one answer span; do not split a word between captures.
  const group = new RegExp(`(?:${blank.source})(?:[ \\t]*(?:${blank.source}))*`, 'g');
  const pieces = template.trim().split(group);
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = pieces.map(piece => escape(piece).replace(/\s+/g, '\\s+')).join('(.+?)');
  const match = back.trim().match(new RegExp(`^\\s*${pattern}\\s*$`, 'di'));
  if (!match?.indices) return back;
  // Insert brackets into the answer itself, preserving source wording,
  // punctuation, capitalization and whitespace exactly.
  let result = back.trim();
  for (let i = match.indices.length - 1; i > 0; i--) {
    const range = match.indices[i];
    if (range) result = result.slice(0, range[0]) + '[' + result.slice(range[0], range[1]) + ']' + result.slice(range[1]);
  }
  return back.slice(0, back.indexOf(back.trim())) + result + back.slice(back.trimEnd().length);
}
