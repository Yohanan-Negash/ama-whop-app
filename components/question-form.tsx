"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { submitQuestion } from "@/lib/actions";
import { toast } from "sonner";
import { Send, Shield } from "lucide-react";

export default function QuestionForm({
	experienceId,
}: { experienceId: string }) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [question, setQuestion] = useState("");
	const [charCount, setCharCount] = useState(0);
	const MAX_CHARS = 100;

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setIsSubmitting(true);
		const formData = new FormData();
		formData.append("question", question);

		const result = await submitQuestion(experienceId, formData);
		if (result && "error" in result) {
			toast(`Oops! ${result.error}`);
		} else {
			toast("Anonymous question sent! 🕵️");
			setQuestion("");
			setCharCount(0);
		}
		setIsSubmitting(false);
	}

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const text = e.target.value;
		if (text.length <= MAX_CHARS) {
			setQuestion(text);
			setCharCount(text.length);
		}
	};

	return (
		<div className="space-y-6 mt-2">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-3">
					<Textarea
						id="question"
						name="question"
						value={question}
						onChange={handleTextChange}
						placeholder="Ask anything... relationship advice, controversial opinions, personal struggles, business feedback, or whatever you're curious about but never felt safe asking publicly."
						required
						className="min-h-[140px] w-full text-base border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
					/>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<Shield className="h-4 w-4" />
							<span>Completely anonymous</span>
						</div>
						<span
							className={`text-sm ${charCount > MAX_CHARS * 0.8 ? "text-orange-500" : "text-gray-400"}`}
						>
							{charCount}/{MAX_CHARS}
						</span>
					</div>
				</div>

				<Button
					type="submit"
					disabled={isSubmitting || question.trim() === ""}
					className="w-full bg-orange-500 hover:bg-orange-600 text-white  p-6"
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
	);
}
