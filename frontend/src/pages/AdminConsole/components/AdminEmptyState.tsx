export default function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
      {message}
    </div>
  )
}
