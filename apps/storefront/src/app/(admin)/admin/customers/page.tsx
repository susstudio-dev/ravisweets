export default function AdminCustomersPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
          People
        </p>
        <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">Customers</h1>
      </header>
      <div className="text-theme-ink/55 rounded-2xl border border-dashed border-[color:var(--color-border)] p-10 text-center text-sm">
        Customer list goes live once Supabase <code>customers</code> table is wired. Until then,
        customer data lives in anonymous Supabase auth sessions and on-device{' '}
        <code>localStorage</code>.
      </div>
    </div>
  );
}
