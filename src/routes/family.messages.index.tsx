import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Briefcase } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { helperIdFromJobThreadId, jobIdFromThreadId } from "@/lib/job-utils";

const fallbackPhoto = (seed: string) => `https://i.pravatar.cc/240?u=${encodeURIComponent(seed)}`;

export const Route = createFileRoute("/family/messages/")({
  head: () => ({ meta: [{ title: "Nachrichten · Pflegenah" }] }),
  component: MessagesList,
});

function MessagesList() {
  const { matches, helpers, helperSelf, messages, jobs, applications } = useStore();

  const helperConversations = matches
    .map((m) => {
      const helper = helpers.find((h) => h.id === m.helperId);
      const msgs = messages.filter((x) => x.matchId === m.id);
      const last = msgs[msgs.length - 1];
      return { key: m.id, helper, last };
    })
    .filter((c) => c.helper);

  // Job-based threads (matchId = "job-<jobId>" or "job-<jobId>--<helperId>")
  const jobThreadIds = Array.from(
    new Set(messages.filter((m) => m.matchId.startsWith("job-")).map((m) => m.matchId)),
  );
  const jobConversations = jobThreadIds
    .map((matchId) => {
      const jobId = jobIdFromThreadId(matchId);
      const helperId = helperIdFromJobThreadId(matchId);
      const job = jobs.find((j) => j.id === jobId);
      const msgs = messages.filter((m) => m.matchId === matchId);
      const last = msgs[msgs.length - 1];

      // Resolve the helper: prefer id from thread, else the first inbound sender.
      const inbound = msgs.find((m) => m.senderId !== "me");
      const resolvedHelperId = helperId ?? inbound?.senderId ?? null;
      const helper = resolvedHelperId
        ? helpers.find((h) => h.id === resolvedHelperId) ??
          (helperSelf?.id === resolvedHelperId ? (helperSelf as { name?: string; photo?: string }) : undefined)
        : undefined;
      const application = jobId
        ? applications.find((a) => a.jobId === jobId && (!resolvedHelperId || a.helperId === resolvedHelperId))
        : undefined;
      const helperName = helper?.name ?? application?.helperName ?? "Helfer:in";
      const helperPhoto = helper?.photo ?? fallbackPhoto(resolvedHelperId ?? application?.helperId ?? matchId);

      return { key: matchId, matchId, job, last, helperName, helperPhoto };
    })
    .filter((c) => c.job);

  const empty = helperConversations.length === 0 && jobConversations.length === 0;

  return (
    <AppLayout variant="family">
      <ScreenHeader title="Nachrichten" back="/family/dashboard" />
      {empty ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-card">
          <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Noch keine Chats. Starten Sie einen Chat aus der Helfer:innen-Liste oder warten Sie auf Anfragen zu Ihren Aufträgen.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobConversations.map(({ key, matchId, job, last, helperName, helperPhoto }) => (
            <Link
              key={key}
              to="/family/messages/$id"
              params={{ id: matchId }}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <img src={helperPhoto} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{helperName}</div>
                <div className="truncate text-xs text-muted-foreground">
                  <Briefcase className="mr-1 inline h-3.5 w-3.5" />
                  {job!.title}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {last ? last.content : "Neue Konversation"}
                </div>
              </div>
            </Link>
          ))}

          {helperConversations.map(({ key, helper, last }) => (
            <Link
              key={key}
              to="/family/messages/$id"
              params={{ id: helper!.id }}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <img src={helper!.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{helper!.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {last ? last.content : "Jetzt Nachricht senden…"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
