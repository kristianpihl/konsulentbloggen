import type { Metadata } from "next";
import { unsubscribe } from "../actions";

export const metadata: Metadata = {
  title: "Meld deg av nyhetsbrevet",
  robots: { index: false },
};

// Avmeldingen skjer først når knappen trykkes (POST), slik at e-postprogrammer
// som forhåndslaster lenker ikke melder folk av ved en feil.
export default async function UnsubscribePage(props: PageProps<"/nyhetsbrev/avmeld">) {
  const searchParams = await props.searchParams;
  const rawToken = searchParams.token;
  const token = typeof rawToken === "string" ? rawToken : "";
  const done = searchParams.ferdig !== undefined;
  const failed = searchParams.feil !== undefined;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Meld deg av</h1>

        {done ? (
          <p className="mt-3 text-black/70">
            Du er meldt av nyhetsbrevet og får ikke flere e-poster.
          </p>
        ) : failed || !token ? (
          <p className="mt-3 text-black/70">
            Denne avmeldingslenken fungerer ikke. Bruk lenken i nyeste e-post
            fra meg, eller ta kontakt så fjerner jeg deg manuelt.
          </p>
        ) : (
          <form action={unsubscribe} className="mt-4">
            <input type="hidden" name="token" value={token} />
            <p className="text-black/70">
              Vil du slutte å få e-post om nye artikler og maler?
            </p>
            <button
              type="submit"
              className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
            >
              Ja, meld meg av
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
