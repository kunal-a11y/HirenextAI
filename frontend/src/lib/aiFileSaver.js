import useFilesStore from '../store/useFilesStore';

const RULES = [
  { folderId: 'cover-letters', keywords: ['cover letter', 'dear hiring', 'application letter'] },
  { folderId: 'resumes', keywords: ['resume', 'curriculum vitae', 'work experience', 'professional summary'] },
  { folderId: 'job-descriptions', keywords: ['job description', 'responsibilities:', 'requirements:', 'role overview'] },
];

export function autoSaveFromAIResponse(content, meta = {}) {
  if (!content || typeof content !== 'string' || content.length < 80) return null;

  const lower = content.toLowerCase();
  const rule = RULES.find((r) => r.keywords.some((k) => lower.includes(k)));
  if (!rule) return null;

  const title =
    meta.title ||
    `${rule.folderId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} — ${new Date().toLocaleDateString()}`;

  return useFilesStore.getState().addFile({
    title,
    folderId: rule.folderId,
    content,
    jobTitle: meta.jobTitle || '',
    jobCompany: meta.jobCompany || '',
    mimeType: 'text/plain',
  });
}

export function saveInterviewToFiles({ job, results, mindMapContent }) {
  const { addFile } = useFilesStore.getState();
  const jobLabel = job ? `${job.job_title} at ${job.company}` : 'Practice Session';

  addFile({
    title: `Interview Notes — ${jobLabel}`,
    folderId: 'interview-notes',
    content: results.summaryText,
    jobTitle: job?.job_title || '',
    jobCompany: job?.company || '',
  });

  addFile({
    title: `Mind Map — ${jobLabel}`,
    folderId: 'mind-maps',
    content: mindMapContent,
    jobTitle: job?.job_title || '',
    jobCompany: job?.company || '',
  });
}
