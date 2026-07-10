import type { Job } from "./mock-data";

export const jobThreadId = (jobId: string, helperId?: string) =>
  helperId ? `job-${jobId}--${helperId}` : `job-${jobId}`;

export const isJobThreadId = (id: string) => id.startsWith("job-");

export const jobIdFromThreadId = (id: string) => id.replace(/^job-/, "").split("--")[0];

export const helperIdFromJobThreadId = (id: string) => {
  const [, helperId] = id.replace(/^job-/, "").split("--");
  return helperId || null;
};

export const jobPosterRoleLabel = (postedBy: Job["postedBy"]) =>
  postedBy === "family" ? "Nahestehende Person" : "Hilfesuchende Person";

export const jobPosterInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const jobPosterPhoto = (job: Job) =>
  job.postedByPhoto ?? `https://i.pravatar.cc/240?u=${encodeURIComponent(`job-poster-${job.id}`)}`;

export const jobPosterSummary = (job: Job) =>
  job.postedBy === "family"
    ? `${job.postedByName} organisiert die Betreuung für eine nahestehende Person und sucht verlässliche Unterstützung.`
    : `${job.postedByName} sucht persönlich nach passender Unterstützung im Alltag.`;