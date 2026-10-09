export function Field({
  label,
  name,
  error,
  hint,
  ...input
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [error && `${name}-error`, hint && `${name}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-200">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-white outline-none placeholder:text-neutral-600 focus:ring-2 focus:ring-teal-600 aria-[invalid=true]:border-red-500/70"
        {...input}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-neutral-400">{hint}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

export function FormMessage({ status, children }: { status: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={
        status === "error"
          ? "rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          : "rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-sm text-teal-200"
      }
    >
      {children}
    </p>
  );
}
