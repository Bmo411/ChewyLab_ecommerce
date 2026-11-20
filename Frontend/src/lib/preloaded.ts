import type { CatalogSnapshot } from './catalog';

let snapshot: CatalogSnapshot | null = null;
let readDocument = false;
export function setPreloadedData(data: CatalogSnapshot | null) { snapshot = data; }
export function getPreloadedData(): CatalogSnapshot | null {
  if (typeof document !== 'undefined' && !readDocument) {
    readDocument = true;
    const content = document.getElementById('chewylab-catalog')?.textContent;
    if (content) try { snapshot = JSON.parse(content); } catch { snapshot = null; }
  }
  return snapshot;
}
