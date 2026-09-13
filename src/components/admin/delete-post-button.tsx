"use client";

export function DeletePostButton() {
  return (
    <button
      type="submit"
      className="text-red-600 hover:text-red-800"
      onClick={(event) => {
        if (!confirm("Slette dette innlegget? Dette kan ikke angres.")) {
          event.preventDefault();
        }
      }}
    >
      Slett
    </button>
  );
}
