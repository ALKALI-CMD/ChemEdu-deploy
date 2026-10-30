import OfficialShell from './components/OfficialShell'
import { brand, subjectAreas } from '@/content/siteContent'

export default function FacultyPage() {
  return (
    <OfficialShell>
      <section className="mx-auto w-full max-w-5xl px-4 py-20 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{brand.name} · {brand.tagline}</h1>
        <div className="mt-10 grid gap-6 border-t border-slate-100 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {subjectAreas.map((subject) => <p key={subject} className="text-sm text-slate-600">{subject}</p>)}
        </div>
      </section>
    </OfficialShell>
  )
}
