// Existing feature suites exercise the preserved previous-range workspace.
// The current-term suite separately tests the new default class-selection route.
export function previousUrl(url) {
  const u = new URL(url);
  u.hash = 'previous';
  return u.toString();
}
