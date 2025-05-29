"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { submitQuestion } from "@/lib/actions"
import { toast } from "sonner"
import { Send, Shield } from "lucide-react"

export default function QuestionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [question, setQuestion] = useState("")
  const [charCount, setCharCount] = useState(0)
  const MAX_CHARS = 500

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("question", question)

      await submitQuestion(formData)
      toast("Anonymous question sent! 🕵️")

      // Reset the form
      setQuestion("")
      setCharCount(0)
    } catch (error) {
      toast("Oops! Something went wrong 😕")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= MAX_CHARS) {
      setQuestion(text)
      setCharCount(text.length)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="question" className="text-base font-medium text-gray-700">
            What would you like to ask?
          </Label>
          <Textarea
            id="question"
            name="question"
            value={question}
            onChange={handleTextChange}
            placeholder="Ask anything... relationship advice, controversial opinions, personal struggles, business feedback, or whatever you're curious about but never felt safe asking publicly."
            required
            className="min-h-[140px] text-base border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Completely anonymous</span>
            </div>
            <span className={`text-sm ${charCount > MAX_CHARS * 0.8 ? "text-orange-500" : "text-gray-400"}`}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || question.trim() === ""}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-medium hover-lift"
        >
          {isSubmitting ? (
            "Sending anonymously..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Anonymous Question
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
