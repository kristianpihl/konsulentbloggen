import { CopyEmailsButton } from "@/components/admin/copy-emails-button";
import { SubscriberChart } from "@/components/admin/subscriber-chart";
import { buildTrend, countNewSubscribers, getSubscribersForAdmin } from "@/lib/newsletter";
import { formatDate } from "@/lib/slugify";

export const revalidate = 0;

const NEW_WINDOW_DAYS = 30;

export default async function AdminNewsletterPage() {
  const subscribers = await getSubscribersForAdmin();
  const active = subscribers.filter((s) => s.status === "active");
  const unsubscribed = subscribers.length - active.length;
  const newRecently = countNewSubscribers(subscribers, NEW_WINDOW_DAYS);
  const trend = buildTrend(subscribers);

  const cards = [
    { label: "Aktive abonnenter", value: active.length },
    { label: `Nye siste ${NEW_WINDOW_DAYS} dager`, value: newRecently },
    { label: "Vil ha artikler", value: active.filter((s) => s.wants_posts).length },
    { label: "Vil ha maler og verktøy", value: active.filter((s) => s.wants_resources).length },
    { label: "Avmeldte", value: unsubscribed },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold">Nyhetsbrev</h1>
      <p className="mt-1 text-sm text-black/60">
        Alle som har meldt seg på via kristianpihl.no/nyhetsbrev.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-black/10 bg-white p-4">
            <p className="text-sm text-black/50">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Abonnenter over tid</h2>
      <p className="mt-1 text-sm text-black/50">
        Antall aktive abonnenter per dag, siste 90 dager.
      </p>
      <div className="mt-4 rounded-lg border border-black/10 bg-white p-4">
        <SubscriberChart data={trend} />
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Abonnenter</h2>
        <CopyEmailsButton emails={active.map((s) => s.email)} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-black/50">
              <th className="px-4 py-3 font-medium">E-post</th>
              <th className="px-4 py-3 font-medium">Vil ha</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Meldt på</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-black/50">
                  Ingen har meldt seg på ennå.
                </td>
              </tr>
            )}
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-black/5 last:border-b-0">
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-black/70">
                  {[s.wants_posts && "Artikler", s.wants_resources && "Maler og verktøy"]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  {s.status === "active" ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-800">
                      Aktiv
                    </span>
                  ) : (
                    <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-black/60">
                      Avmeldt {s.unsubscribed_at ? formatDate(s.unsubscribed_at) : ""}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-black/70">{formatDate(s.subscribed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
