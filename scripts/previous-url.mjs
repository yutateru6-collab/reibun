// Existing feature suites exercise the preserved previous-range workspace.
// The current-term suite separately tests the new default class-selection route.
let navigation = 0;
export function previousUrl(url) {
  const u = new URL(url);
  u.hash = 'previous';
  // Re-enter the legacy app with a full navigation, even from the same hash.
  u.searchParams.set('previous_qa', String(++navigation));
  return u.toString();
}
