import { JobListing, Config } from '../types';
import { Scorer } from './agents';

function stripHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export class LiveJobService {
  /**
   * Fetches real live jobs from public APIs (Remotive, Arbeitnow)
   */
  static async fetchLiveJobs(query: string, config: Config): Promise<JobListing[]> {
    const jobs: JobListing[] = [];
    const searchTerm = (query || config.target_role || 'developer').trim();

    // 1. Try Remotive Public API
    try {
      const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchTerm)}&limit=15`;
      const res = await fetch(remotiveUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          for (const item of data.jobs.slice(0, 12)) {
            const cleanDesc = stripHtml(item.description || '');
            const rawListing: JobListing = {
              id: `remotive-${item.id}`,
              title: item.title || 'Software Professional',
              company: item.company_name || 'Tech Company',
              location: item.candidate_required_location || 'Remote',
              url: item.url || 'https://remotive.com',
              description: cleanDesc.length > 2000 ? cleanDesc.slice(0, 2000) + '...' : cleanDesc,
              source: 'Remotive (Live)',
              posted_at: item.publication_date || new Date().toISOString(),
              fetched_at: new Date().toISOString(),
              fit_score: 0
            };

            const { score, reason } = Scorer.scoreListing(rawListing, config);
            rawListing.fit_score = score;
            rawListing.fit_reason = reason;
            jobs.push(rawListing);
          }
        }
      }
    } catch (err) {
      console.warn('Remotive fetch notice:', err);
    }

    // 2. Try Arbeitnow Public API
    try {
      const arbeitUrl = `https://www.arbeitnow.com/api/job-board-api`;
      const res = await fetch(arbeitUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          const lowerQuery = searchTerm.toLowerCase();
          const filtered = data.data.filter((item: any) => {
            const t = (item.title || '').toLowerCase();
            const d = (item.description || '').toLowerCase();
            const tags = (item.tags || []).join(' ').toLowerCase();
            return t.includes(lowerQuery) || d.includes(lowerQuery) || tags.includes(lowerQuery);
          }).slice(0, 8);

          for (const item of filtered) {
            const cleanDesc = stripHtml(item.description || '');
            const rawListing: JobListing = {
              id: `arbeit-${item.slug || Math.random().toString(36).substring(2, 8)}`,
              title: item.title || 'Engineering Role',
              company: item.company_name || 'Hiring Company',
              location: item.location || (item.remote ? 'Remote' : 'Hybrid'),
              url: item.url || 'https://www.arbeitnow.com',
              description: cleanDesc.length > 2000 ? cleanDesc.slice(0, 2000) + '...' : cleanDesc,
              source: 'Arbeitnow (Live)',
              posted_at: new Date(item.created_at * 1000).toISOString(),
              fetched_at: new Date().toISOString(),
              fit_score: 0
            };

            const { score, reason } = Scorer.scoreListing(rawListing, config);
            rawListing.fit_score = score;
            rawListing.fit_reason = reason;
            
            // Avoid duplicate entries
            if (!jobs.some(j => j.title.toLowerCase() === rawListing.title.toLowerCase() && j.company.toLowerCase() === rawListing.company.toLowerCase())) {
              jobs.push(rawListing);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Arbeitnow fetch notice:', err);
    }

    // Sort by fit score
    jobs.sort((a, b) => b.fit_score - a.fit_score);
    return jobs;
  }
}
