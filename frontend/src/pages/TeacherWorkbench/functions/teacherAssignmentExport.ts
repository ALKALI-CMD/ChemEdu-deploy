import JSZip from 'jszip'
import type { Assignment } from '@/objects/course/learning/Assignment'

function csvEscape(cell: string) {
  return `"${cell.replaceAll('"', '""')}"`
}

function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n')
}

function getAttachmentFileExtension(blob: Blob) {
  if (blob.type.includes('pdf')) return '.pdf'
  if (blob.type.includes('zip')) return '.zip'
  if (blob.type.includes('json')) return '.json'
  if (blob.type.startsWith('image/')) return `.${blob.type.split('/')[1] ?? 'png'}`
  return '.bin'
}

function getSafeAttachmentLabel(label: string, fallback: string) {
  return String(label || fallback).replace(/[\\/:*?"<>|]/g, '-')
}

async function appendAttachment(
  folder: JSZip | null,
  attachment: Assignment['submissionAttachments'][number],
  attachmentIndex: number,
  prefix: 'submission' | 'review',
) {
  const safeLabel = getSafeAttachmentLabel(attachment.label, `${prefix}-attachment-${attachmentIndex + 1}`)
  const fallbackText = `label: ${attachment.label}\nurl: ${attachment.url}\nuploadedAt: ${attachment.uploadedAt ?? ''}`

  if (!attachment.url) {
    folder?.file(`${prefix}-attachment-${attachmentIndex + 1}-${safeLabel}.txt`, fallbackText)
    return
  }

  try {
    const response = await fetch(attachment.url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const blob = await response.blob()
    folder?.file(`${prefix}-attachment-${attachmentIndex + 1}-${safeLabel}${getAttachmentFileExtension(blob)}`, blob)
  } catch {
    folder?.file(`${prefix}-attachment-${attachmentIndex + 1}-${safeLabel}.txt`, fallbackText)
  }
}

function buildAssignmentSummaryRows(assignments: Assignment[]) {
  return [
    [
      'courseId',
      'title',
      'submissionStatus',
      'rawScore',
      'finalScore',
      'submittedAt',
      'attemptCount',
      'resubmissionCount',
      'lateSubmitted',
      'latePenaltyAppliedPercent',
      'submissionAttachmentCount',
      'reviewAttachmentCount',
    ],
    ...assignments.map((assignment) => [
      String(assignment.courseId),
      String(assignment.title),
      String(assignment.submissionStatus),
      String(assignment.rawScore ?? ''),
      String(assignment.score ?? ''),
      String(assignment.submittedAt ?? ''),
      String(assignment.attemptCount),
      String(assignment.resubmissionCount),
      String(assignment.lateSubmitted),
      String(assignment.latePenaltyAppliedPercent),
      String(assignment.submissionAttachments.length),
      String(assignment.reviewAttachments.length),
    ]),
  ]
}

function appendAssignmentMetadata(folder: JSZip | null, assignment: Assignment) {
  folder?.file(
    'metadata.json',
    JSON.stringify(
      {
        courseId: assignment.courseId,
        title: assignment.title,
        submissionStatus: assignment.submissionStatus,
        score: assignment.score,
        rawScore: assignment.rawScore,
        submittedAt: assignment.submittedAt,
        attemptCount: assignment.attemptCount,
        resubmissionCount: assignment.resubmissionCount,
        maxAttempts: assignment.maxAttempts,
        lateSubmitted: assignment.lateSubmitted,
        allowMakeUpSubmission: assignment.allowMakeUpSubmission,
        lateSubmissionDeadline: assignment.lateSubmissionDeadline,
        latePenaltyPercentPerDay: assignment.latePenaltyPercentPerDay,
        latePenaltyCapPercent: assignment.latePenaltyCapPercent,
        latePenaltyAppliedPercent: assignment.latePenaltyAppliedPercent,
        allowLateSubmission: assignment.allowLateSubmission,
        allowResubmission: assignment.allowResubmission,
        submissionContent: assignment.submissionContent,
        submissionNote: assignment.submissionNote,
        submissionAttachments: assignment.submissionAttachments,
        reviewAttachments: assignment.reviewAttachments,
        rubricScores: assignment.rubricScores,
        rubric: assignment.rubric,
        teacherAnnotations: assignment.teacherAnnotations,
        submissionHistory: assignment.submissionHistory,
        reviewHistory: assignment.reviewHistory,
      },
      null,
      2,
    ),
  )
}

function appendAssignmentHistory(folder: JSZip | null, assignment: Assignment) {
  const reviewHistoryRows = [
    ['reviewNumber', 'rawScore', 'finalScore', 'latePenaltyAppliedPercent', 'latePenaltyAppliedPoints', 'reviewerName', 'reviewedAt', 'feedback'],
    ...assignment.reviewHistory.map((record) => [
      String(record.reviewNumber),
      String(record.rawScore),
      String(record.finalScore),
      String(record.latePenaltyAppliedPercent),
      String(record.latePenaltyAppliedPoints),
      String(record.reviewerName),
      String(record.reviewedAt),
      String(record.feedback ?? ''),
    ]),
  ]
  folder?.file('review-history.csv', toCsv(reviewHistoryRows))

  const submissionHistoryRows = [
    ['attemptNumber', 'submittedAt', 'lateSubmitted', 'attachmentCount', 'submissionNote', 'submissionContentPreview'],
    ...assignment.submissionHistory.map((record) => [
      String(record.attemptNumber),
      String(record.submittedAt),
      String(record.lateSubmitted),
      String(record.attachmentCount),
      String(record.submissionNote ?? ''),
      String(record.submissionContentPreview ?? ''),
    ]),
  ]
  folder?.file('submission-history.csv', toCsv(submissionHistoryRows))
}

async function appendAssignmentFolder(zip: JSZip, assignment: Assignment, index: number) {
  const folder = zip.folder(`assignment-${index + 1}-${String(assignment.id)}`)
  appendAssignmentMetadata(folder, assignment)
  appendAssignmentHistory(folder, assignment)

  await Promise.all(
    assignment.submissionAttachments.map((attachment, attachmentIndex) =>
      appendAttachment(folder, attachment, attachmentIndex, 'submission'),
    ),
  )
  await Promise.all(
    assignment.reviewAttachments.map((attachment, attachmentIndex) =>
      appendAttachment(folder, attachment, attachmentIndex, 'review'),
    ),
  )
}

export async function exportAssignmentSubmissions(assignments: Assignment[]) {
  const zip = new JSZip()
  zip.file('summary.csv', toCsv(buildAssignmentSummaryRows(assignments)))

  for (const [index, assignment] of assignments.entries()) {
    await appendAssignmentFolder(zip, assignment, index)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'assignment-submissions.zip'
  link.click()
  URL.revokeObjectURL(url)
}
