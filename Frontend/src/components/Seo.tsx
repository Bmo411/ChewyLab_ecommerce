import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPreloadedData } from '@/lib/preloaded';
import { resolveSeo, DEFAULT_SITE_URL } from '@/lib/seo';
import type { CatalogRow } from '@/lib/catalog';

export function Seo({ product }: { product?: CatalogRow | null }) {
  const { pathname } = useLocation();
  useEffect(() => {
    const snapshot = getPreloadedData();
    const data = product ? { products: [product], categories: [] } : snapshot;
    const seo = resolveSeo(pathname, data, import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL);
    document.title = seo.title;
    const meta = (key: string, content: string, attribute = 'name') => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.appendChild(element); }
      element.content = content;
    };
    meta('description', seo.description); meta('robots', seo.robots);
    meta('og:title', seo.title, 'property'); meta('og:description', seo.description, 'property'); meta('og:type', seo.type, 'property'); meta('og:site_name', 'ChewyLab', 'property'); meta('og:locale', 'es_MX', 'property');
    meta('twitter:card', 'summary_large_image'); meta('twitter:title', seo.title); meta('twitter:description', seo.description);
    if (seo.image) { meta('og:image', seo.image, 'property'); meta('twitter:image', seo.image); }
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (seo.canonical) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = seo.canonical; meta('og:url', seo.canonical, 'property');
    } else { canonical?.remove(); document.head.querySelector('meta[property="og:url"]')?.remove(); }
    document.getElementById('chewylab-structured-data')?.remove();
    if (seo.structuredData) { const script = document.createElement('script'); script.id = 'chewylab-structured-data'; script.type = 'application/ld+json'; script.textContent = JSON.stringify(seo.structuredData); document.head.appendChild(script); }
  }, [pathname, product]);
  return null;
}
