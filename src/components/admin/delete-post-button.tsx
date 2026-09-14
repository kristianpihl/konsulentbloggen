"use client";

export function DeletePostButton({
  confirmMessage = "Slette dette innlegget? Dette kan ikke angres.",
}: {
  confirmMessage?: string;
}) {
  return (
    <button
      type="submit"
      className="text-red-600 hover:text-red-800"
      onClick={(event) => {
        if (!confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      Slett
    </button>
  );
}
