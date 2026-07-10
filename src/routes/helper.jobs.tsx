import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/helper/jobs")({
  head: () => ({ meta: [{ title: "Aufträge · Pflegenah" }] }),
  component: () => <Outlet />,
});

