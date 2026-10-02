import {
  parseReferenceAttachments,
  parseRubric,
  parseStructuredQuestionBank,
} from '../functions/learningPublishParsers'

type UseLearningPublishPreviewSummaryParams = {
  assignmentRubricText: string
  assignmentReferenceLabels: string
  questionBankText: string
}

export default function useLearningPublishPreviewSummary({
  assignmentRubricText,
  assignmentReferenceLabels,
  questionBankText,
}: UseLearningPublishPreviewSummaryParams) {
  const structuredQuestionBank = parseStructuredQuestionBank(questionBankText)

  return {
    assignmentRubricCount: parseRubric(assignmentRubricText).length,
    assignmentReferenceCount: parseReferenceAttachments(assignmentReferenceLabels).length,
    questionBankQuestionCount: structuredQuestionBank.length,
    questionBankTotalPoints: structuredQuestionBank.reduce((sum, question) => sum + question.points, 0),
  }
}
