import { JobListing, Config } from '../types';
import { Scorer } from './agents';

function stripHtml(html: string): string {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (e) {
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }
}

export interface LiveFetchResult {
  jobs: JobListing[];
  sourcesFetched: string[];
  totalFound: number;
}

export class LiveJobService {
  /**
   * Fetches real live jobs from verified public Job Portal APIs:
   * 1. Jobicy Remote Jobs API (Reddit, Automattic, Clover Health, Nebius, etc.)
   * 2. Remotive API (Lemon.io, Coalition, A.Team, Telus, etc.)
   * 3. Arbeitnow Job Board API
   */
  static async fetchLiveJobs(query: string, config: Config): Promise<JobListing[]> {
    const jobs: JobListing[] = [];
    const searchTerm = (query || config.target_role || 'data').trim();
    const cleanSearchLower = searchTerm.toLowerCase();

    // Map common role terms to Jobicy tags
    let jobicyTag = 'data';
    if (cleanSearchLower.includes('python')) jobicyTag = 'python';
    else if (cleanSearchLower.includes('ai') || cleanSearchLower.includes('machine learning')) jobicyTag = 'ai';
    else if (cleanSearchLower.includes('dev') || cleanSearchLower.includes('software')) jobicyTag = 'dev';

    // 1. Fetch from Jobicy API (Real active listings)
    try {
      const jobicyUrl = `https://jobicy.com/api/v2/remote-jobs?count=20&tag=${encodeURIComponent(jobicyTag)}`;
      const res = await fetch(jobicyUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          for (const item of data.jobs) {
            const cleanDesc = stripHtml(item.jobDescription || item.jobExcerpt || '');
            const rawListing: JobListing = {
              id: `jobicy-${item.id}`,
              title: item.jobTitle || 'Data & Analytics Specialist',
              company: item.companyName || 'Technology Enterprise',
              location: item.jobGeo || 'Remote / Worldwide',
              url: item.url || 'https://jobicy.com',
              description: cleanDesc.length > 2500 ? cleanDesc.slice(0, 2500) + '...' : cleanDesc,
              source: 'Jobicy (Live API)',
              posted_at: item.pubDate || new Date().toISOString(),
              fetched_at: new Date().toISOString(),
              fit_score: 0
            };

            const { score, reason } = Scorer.scoreListing(rawListing, config);
            rawListing.fit_score = score;
            rawListing.fit_reason = reason;

            // Only add if not already in list
            if (!jobs.some(j => j.title.toLowerCase() === rawListing.title.toLowerCase() && j.company.toLowerCase() === rawListing.company.toLowerCase())) {
              jobs.push(rawListing);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Jobicy live fetch notice:', err);
    }

    // 2. Fetch from Remotive Public API (Real live tech jobs)
    try {
      const remotiveSearch = cleanSearchLower.includes('data') ? 'data' : (cleanSearchLower.includes('python') ? 'python' : searchTerm);
      const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(remotiveSearch)}&limit=20`;
      const res = await fetch(remotiveUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          for (const item of data.jobs) {
            const cleanDesc = stripHtml(item.description || '');
            const rawListing: JobListing = {
              id: `remotive-${item.id}`,
              title: item.title || 'Data Analyst / Engineer',
              company: item.company_name || 'Global Tech',
              location: item.candidate_required_location || 'Remote',
              url: item.url || 'https://remotive.com',
              description: cleanDesc.length > 2500 ? cleanDesc.slice(0, 2500) + '...' : cleanDesc,
              source: 'Remotive (Live API)',
              posted_at: item.publication_date || new Date().toISOString(),
              fetched_at: new Date().toISOString(),
              fit_score: 0
            };

            const { score, reason } = Scorer.scoreListing(rawListing, config);
            rawListing.fit_score = score;
            rawListing.fit_reason = reason;

            if (!jobs.some(j => j.title.toLowerCase() === rawListing.title.toLowerCase() && j.company.toLowerCase() === rawListing.company.toLowerCase())) {
              jobs.push(rawListing);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Remotive live fetch notice:', err);
    }

    // 3. Fetch from Arbeitnow Public API
    try {
      const arbeitUrl = `https://www.arbeitnow.com/api/job-board-api`;
      const res = await fetch(arbeitUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          const filtered = data.data.filter((item: any) => {
            const t = (item.title || '').toLowerCase();
            const d = (item.description || '').toLowerCase();
            const tags = (item.tags || []).join(' ').toLowerCase();
            return t.includes('data') || t.includes('analyst') || t.includes('python') || tags.includes('data') || d.includes('analytics');
          }).slice(0, 10);

          for (const item of filtered) {
            const cleanDesc = stripHtml(item.description || '');
            const rawListing: JobListing = {
              id: `arbeit-${item.slug || Math.random().toString(36).substring(2, 8)}`,
              title: item.title || 'Data Analyst',
              company: item.company_name || 'Hiring Firm',
              location: item.location || (item.remote ? 'Remote' : 'Hybrid'),
              url: item.url || 'https://www.arbeitnow.com',
              description: cleanDesc.length > 2500 ? cleanDesc.slice(0, 2500) + '...' : cleanDesc,
              source: 'Arbeitnow (Live API)',
              posted_at: item.created_at ? new Date(item.created_at * 1000).toISOString() : new Date().toISOString(),
              fetched_at: new Date().toISOString(),
              fit_score: 0
            };

            const { score, reason } = Scorer.scoreListing(rawListing, config);
            rawListing.fit_score = score;
            rawListing.fit_reason = reason;

            if (!jobs.some(j => j.title.toLowerCase() === rawListing.title.toLowerCase() && j.company.toLowerCase() === rawListing.company.toLowerCase())) {
              jobs.push(rawListing);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Arbeitnow live fetch notice:', err);
    }

    // Sort by fit score descending
    jobs.sort((a, b) => b.fit_score - a.fit_score);
    return jobs;
  }
}
