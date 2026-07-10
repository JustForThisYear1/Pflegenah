import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, MessageCircle } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { isJobThreadId, jobIdFromThreadId, jobPosterPhoto, jobPosterRoleLabel } from "@/lib/job-utils";

export const Route = createFileRoute("/helper/messages/")({
  head: () => ({ meta: [{ title: "Nachrichten · Pflegenah" }] }),
  component: HelperMessages,
});

function HelperMessages() {
  const { helperSelf, helpers, messages, jobs } = useStore();

  // A helper's conversations are all messages whose match_id equals their helper id.
  // (match_id is deterministic = helperId, so both sides share the same thread.)
  const helperId = helperSelf?.id ?? helpers[0]?.id;
  const helper = helpers.find((h) => h.id === helperId) ?? helpers[0];

  const thread = messages.filter((m) => m.matchId === helperId);
  const last = thread[thread.length - 1];
  const jobThreadIds = Array.from(new Set(messages.filter((m) => isJobThreadId(m.matchId)).map((m) => m.matchId)));
  const jobConversations = jobThreadIds
    .map((matchId) => {
      const job = jobs.find((j) => j.id === jobIdFromThreadId(matchId));
      const msgs = messages.filter((m) => m.matchId === matchId);
      return { matchId, job, last: msgs[msgs.length - 1] };
    })
    .filter((c) => c.job);
  const hasHelperChat = !!helper && thread.length > 0;

  return (
    <AppLayout variant="helper">
      <ScreenHeader title="Nachrichten" back="/helper/dashboard" />
      {!hasHelperChat && jobConversations.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-card">
          <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Deine Chats mit Familien werden hier live erscheinen. Sobald eine Familie dich anschreibt,
            findest du hier den Chat.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobConversations.map(({ matchId, job, last: jobLast }) => (
            <Link
              key={matchId}
              to="/helper/messages/$id"
              params={{ id: matchId }}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <img src={jobPosterPhoto(job!)} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{job!.postedByName}</div>
                <div className="truncate text-xs text-muted-foreground">
                  <Briefcase className="mr-1 inline h-3.5 w-3.5" /> {job!.title} · {jobPosterRoleLabel(job!.postedBy)}
                </div>
                <div className="truncate text-xs text-muted-foreground">{jobLast?.content ?? "Auftrags-Chat"}</div>
              </div>
            </Link>
          ))}
          {hasHelperChat && (
            <Link
              to="/helper/messages/$id"
              params={{ id: helper!.id }}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <img src={helper!.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">Familie · Chat</div>
                <div className="truncate text-xs text-muted-foreground">
                  {last?.content ?? "Neue Anfrage"}
                </div>
              </div>
            </Link>
          )}
        </div>
      )}
    </AppLayout>
  );
}
