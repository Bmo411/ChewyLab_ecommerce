import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { setPreloadedData } from './lib/preloaded';
import type { CatalogSnapshot } from './lib/catalog';
export { resolveSeo, productPath, cleanText } from './lib/seo';
export { publicEditorialPaths, reviewEditorialPaths, editorialPages } from './lib/editorial';

export function render(path: string, data: CatalogSnapshot) {
  setPreloadedData(data);
  try { return renderToString(<StaticRouter location={path}><App /></StaticRouter>); }
  finally { setPreloadedData(null); }
}
