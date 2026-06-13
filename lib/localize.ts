import type { SiteConfig, Honor, Project, CVSection } from "@/types";
import type { Lang } from "@/lib/i18n";

interface CNEntry {
  title?: string;
  subtitle?: string;
  institution?: string;
  date_range?: string;
  description?: string;
  bullets?: string[];
}

interface ContentCN {
  title?: string;
  tagline?: string;
  about?: string;
  location?: string;
  institution?: string;
  honors?: { title: string; issuer: string; year: string; description?: string }[];
  projects?: { title: string; description: string; tech_stack?: string }[];
  cvSections?: CNEntry[];
}

interface Localized {
  config: Partial<SiteConfig>;
  honors: Honor[];
  projects: Project[];
  cvSections: CVSection[];
}

/**
 * Merge the Chinese overlay (config.content_cn JSON) over the English data
 * when lang === "cn". Arrays are matched by index. Falls back to English for
 * anything the overlay doesn't cover.
 */
export function localize(
  lang: Lang,
  config: Partial<SiteConfig>,
  honors: Honor[],
  projects: Project[],
  cvSections: CVSection[]
): Localized {
  if (lang !== "cn" || !config.content_cn) {
    return { config, honors, projects, cvSections };
  }

  let cn: ContentCN;
  try {
    cn = JSON.parse(config.content_cn) as ContentCN;
  } catch {
    return { config, honors, projects, cvSections };
  }

  const localizedConfig: Partial<SiteConfig> = {
    ...config,
    title: cn.title ?? config.title,
    tagline: cn.tagline ?? config.tagline,
    about: cn.about ?? config.about,
    location: cn.location ?? config.location,
    institution: cn.institution ?? config.institution,
  };

  const localizedHonors = honors.map((h, i) => {
    const o = cn.honors?.[i];
    return o ? { ...h, title: o.title, issuer: o.issuer, year: o.year, description: o.description ?? h.description } : h;
  });

  const localizedProjects = projects.map((p, i) => {
    const o = cn.projects?.[i];
    return o ? { ...p, title: o.title, description: o.description, tech_stack: o.tech_stack ?? p.tech_stack } : p;
  });

  const localizedCV = cvSections.map((s, i) => {
    const o = cn.cvSections?.[i];
    if (!o) return s;
    return { ...s, content_json: JSON.stringify(o) };
  });

  return {
    config: localizedConfig,
    honors: localizedHonors,
    projects: localizedProjects,
    cvSections: localizedCV,
  };
}
