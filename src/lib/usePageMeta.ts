import { useEffect } from 'react';

type MetaOptions = {
  title: string;
  description: string;
  canonicalPath?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const DEFAULT_TITLE = 'JobOnlink Resume Builder';

export function usePageMeta({ title, description, canonicalPath, structuredData }: MetaOptions) {
  useEffect(() => {
    document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', description);

    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', 'index, follow');

    if (canonicalPath) {
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', `https://www.jobonlink.com${canonicalPath}`);
    }

    let structuredDataTag = document.getElementById('jobonlink-structured-data');
    if (!structuredDataTag && structuredData) {
      structuredDataTag = document.createElement('script');
      structuredDataTag.id = 'jobonlink-structured-data';
      structuredDataTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataTag);
    }

    if (structuredDataTag) {
      structuredDataTag.textContent = structuredData ? JSON.stringify(structuredData) : '';
    }

    return () => {
      if (structuredDataTag && structuredData) {
        structuredDataTag.remove();
      }
    };
  }, [title, description, canonicalPath, structuredData]);
}
