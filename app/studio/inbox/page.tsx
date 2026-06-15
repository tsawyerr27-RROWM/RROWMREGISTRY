import { NotificationInboxPanel } from "@/components/notifications/NotificationInboxPanel";

export const metadata = {
  title: "Inbox · Studio",
};

export default function StudioInboxPage() {
  return (
    <div className="ds-page-environment min-h-screen pt-24 pb-16">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <NotificationInboxPanel variant="page" limit={50} />
      </main>
    </div>
  );
}
