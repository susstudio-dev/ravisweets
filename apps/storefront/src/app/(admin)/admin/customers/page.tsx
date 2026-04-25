export default function AdminCustomersPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          People
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Customers
        </h1>
      </header>
      <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-10 text-center text-sm text-theme-ink/55">
        Customer list goes live once Supabase <code>customers</code> table is wired.
        Until then, customer data lives in anonymous Supabase auth sessions and
        on-device <code>localStorage</code>.
      </div>
    </div>
  );
}
