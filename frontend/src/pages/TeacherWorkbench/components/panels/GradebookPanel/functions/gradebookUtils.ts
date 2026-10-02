export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function parsePercent(value: string) {
  return Number(String(value).replace('%', '')) || 0
}

export function calculateGradebookOverview(distributions: Array<{ averageScore: number; passRate: string; excellentRate: string }>) {
  return {
    overallCourseAverage:
      distributions.length > 0
        ? (distributions.reduce((sum, item) => sum + item.averageScore, 0) / distributions.length).toFixed(1)
        : '0.0',
    overallPassRate:
      distributions.length > 0
        ? `${Math.round(distributions.reduce((sum, item) => sum + parsePercent(item.passRate), 0) / distributions.length)}%`
        : '0%',
    overallExcellentRate:
      distributions.length > 0
        ? `${Math.round(distributions.reduce((sum, item) => sum + parsePercent(item.excellentRate), 0) / distributions.length)}%`
        : '0%',
  }
}

export function distributionTone(value: number) {
  if (value >= 85) return 'bg-emerald-50 text-emerald-700'
  if (value >= 70) return 'bg-sky-50 text-sky-700'
  if (value >= 60) return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
}
