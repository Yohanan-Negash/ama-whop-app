"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Trash2 } from "lucide-react"
import { approveQuestion, deleteQuestion } from "@/lib/actions"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data - in a real app, this would come from your database
const mockPendingQuestions = [
  {
    id: "1",
    content: "Your content strategy is honestly pretty basic. Why do you think you deserve the following you have?",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    content: "How much money do you actually make per month? Everyone always asks but you never give real numbers.",
    createdAt: "3 hours ago",
  },
  {
    id: "3",
    content: "Do you ever feel like a fraud? Like everyone thinks you're more successful than you actually are?",
    createdAt: "5 hours ago",
  },
  {
    id: "4",
    content: "Your pricing seems way too high for what you offer. How do you justify charging that much?",
    createdAt: "1 day ago",
  },
  {
    id: "5",
    content: "What's the dumbest business decision you've made that you're too embarrassed to admit publicly?",
    createdAt: "1 day ago",
  },
  {
    id: "6",
    content: "Be honest - how many of your 'success stories' are actually just luck and good timing?",
    createdAt: "2 days ago",
  },
  
]

interface PendingQuestionsProps {
  withScrollArea?: boolean
}

export default function PendingQuestions({ withScrollArea }: PendingQuestionsProps) {
  const [pendingQuestions, setPendingQuestions] = useState(mockPendingQuestions)
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setProcessingIds((prev) => [...prev, id])

    try {
      await approveQuestion(id)
      setPendingQuestions((prev) => prev.filter((q) => q.id !== id))
      toast( "Question approved ✅")
    } catch (error) {
      toast(
       "There was an error approving the question. Please try again.")
    } finally {
      setProcessingIds((prev) => prev.filter((pId) => pId !== id))
    }
  }

  function handleDeleteClick(id: string) {
    setQuestionToDelete(id)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!questionToDelete) return

    setProcessingIds((prev) => [...prev, questionToDelete])

    try {
      await deleteQuestion(questionToDelete)
      setPendingQuestions((prev) => prev.filter((q) => q.id !== questionToDelete))
      toast({
        title: "Question deleted 🗑️",
        description: "The question has been permanently deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => prev.filter((pId) => pId !== questionToDelete))
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  if (pendingQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-gray-600 text-lg">No pending questions to review.</p>
      </div>
    )
  }

  const content = (
    <div className="space-y-3">
      {pendingQuestions.map((question) => (
        <Card key={question.id} className="border bg-card border-orange-200 rounded-lg shadow-sm px-4 py-3 max-w-[700px] mx-auto">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-base mb-1">{question.content}</p>
                <span className="block text-xs text-muted-foreground mt-0.5">{question.createdAt}</span>
              </div>
              <div className="flex gap-1 ml-4 self-center">
                <Button
                  size="icon"
                  onClick={() => handleDeleteClick(question.id)}
                  disabled={processingIds.includes(question.id)}
                  className="border-red-300 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-full p-2 opacity-70 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(question.id)}
                  disabled={processingIds.includes(question.id)}
                  className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-2 text-sm font-medium transition-colors opacity-70 hover:opacity-100"
                >
                  Add to Approved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <>
      {withScrollArea && pendingQuestions.length > 4 ? (
        <ScrollArea className="max-h-[400px] w-full pr-2">{content}</ScrollArea>
      ) : (
        content
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this anonymous question. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-400 hover:bg-gray-500">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleConfirmDelete}>
              Delete Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
