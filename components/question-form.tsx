"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
		const res = await fetch("/api/questions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: "submit", experienceId, question }),
		});
		const result = await res.json();
		if (result?.error) {
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
		<div className="space-y-4 mt-2">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Textarea
						id="question"
						name="question"
						value={question}
						onChange={handleTextChange}
						placeholder="Ask anything..."
						required
						className="min-h-[80px] w-full text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
					/>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<Shield className="h-3 w-3" />
							<span>Completely anonymous</span>
						</div>
						<span
							className={`text-xs ${charCount > MAX_CHARS * 0.8 ? "text-orange-500" : "text-gray-400"}`}
						>
							{charCount}/{MAX_CHARS}
						</span>
					</div>
				</div>

				<Button
					type="submit"
					disabled={isSubmitting || question.trim() === ""}
					className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 text-sm"
				>
					{isSubmitting ? (
						"Sending anonymously..."
					) : (
						<>
							<Send className="h-3 w-3 mr-2" />
							Send Anonymous Question
						</>
					)}
				</Button>
			</form>
		</div>
	);
}
