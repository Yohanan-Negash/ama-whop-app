"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PendingQuestionsProps {
	experienceId: string;
	withScrollArea?: boolean;
}

interface PendingQuestion {
	id: string;
	question: string;
	createdAt: string;
}

export default function PendingQuestions({
	experienceId,
	withScrollArea,
}: PendingQuestionsProps) {
	const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processingIds, setProcessingIds] = useState<string[]>([]);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		async function fetchQuestions() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`/api/questions?experienceId=${experienceId}&status=PENDING`,
				);
				const result = await res.json();
				if (result?.error) setError(result.error);
				else
					setPendingQuestions(
						(
							result as {
								id: string;
								question: string;
								createdAt: string | Date;
							}[]
						).map((q) => ({
							...q,
							createdAt:
								typeof q.createdAt === "string"
									? q.createdAt
									: q.createdAt.toISOString(),
						})),
					);
			} catch (err) {
				setError("Failed to load questions");
			}
			setLoading(false);
		}
		fetchQuestions();
	}, [experienceId]);

	async function handleAnswer(id: string) {
		const answer = answers[id]?.trim();
		if (!answer) {
			toast("Please provide an answer");
			return;
		}

		setProcessingIds((prev) => [...prev, id]);
		try {
			const res = await fetch("/api/questions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "approve", id, answer }),
			});
			const result = await res.json();
			if (result?.error) throw new Error(result.error);
			setPendingQuestions((prev) => prev.filter((q) => q.id !== id));
			setAnswers((prev) => {
				const updated = { ...prev };
				delete updated[id];
				return updated;
			});
			toast("Response shared! Your Q&A is now live in the forum ✨");
			router.refresh();
		} catch (error) {
			console.log("weird error", error);
			toast("There was an error answering the question. Please try again.");
		} finally {
			setProcessingIds((prev) => prev.filter((pId) => pId !== id));
		}
	}

	function handleDeleteClick(id: string) {
		setQuestionToDelete(id);
		setDeleteDialogOpen(true);
	}

	async function confirmDelete() {
		if (!questionToDelete) return;
		setProcessingIds((prev) => [...prev, questionToDelete]);
		try {
			const res = await fetch("/api/questions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "delete", id: questionToDelete }),
			});
			const result = await res.json();
			if (result?.error) throw new Error(result.error);
			setPendingQuestions((prev) =>
				prev.filter((q) => q.id !== questionToDelete),
			);
			toast("Question deleted ✅");
			router.refresh();
		} catch (error) {
			toast("There was an error deleting the question. Please try again.");
		} finally {
			setProcessingIds((prev) =>
				prev.filter((pId) => pId !== questionToDelete),
			);
			setDeleteDialogOpen(false);
			setQuestionToDelete(null);
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8 text-red-600">
				<p>Error: {error}</p>
			</div>
		);
	}

	if (pendingQuestions.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<p>No new questions yet. Your community will start asking soon! 💭</p>
			</div>
		);
	}

	const content = (
		<div className="space-y-2 sm:space-y-3">
			{pendingQuestions.map((question) => (
				<Card
					key={question.id}
					className="border bg-card border-orange-200 rounded-lg shadow-sm px-2 sm:px-4 py-2 sm:py-3 w-full max-w-full sm:max-w-[700px] mx-auto"
				>
					<CardContent className="p-0">
						<div className="space-y-3">
							<div className="flex flex-col sm:flex-row justify-between items-start gap-2">
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-foreground text-sm sm:text-base mb-1 break-words">
										{question.question}
									</p>
									<span className="block text-xs text-muted-foreground mt-0.5">
										{formatDistanceToNow(new Date(question.createdAt), {
											addSuffix: true,
										})}
									</span>
								</div>
								<Button
									size="icon"
									onClick={() => handleDeleteClick(question.id)}
									disabled={processingIds.includes(question.id)}
									className="border-red-300 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-full p-2 h-9 w-9 sm:h-8 sm:w-8 opacity-80 hover:opacity-100"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex flex-col sm:flex-row gap-2">
								<Input
									placeholder="Share your thoughts..."
									value={answers[question.id] || ""}
									onChange={(e) =>
										setAnswers((prev) => ({
											...prev,
											[question.id]: e.target.value,
										}))
									}
									className="flex-1 border border-amber-500"
									disabled={processingIds.includes(question.id)}
								/>
								<Button
									onClick={() => handleAnswer(question.id)}
									disabled={
										processingIds.includes(question.id) ||
										!answers[question.id]?.trim()
									}
									className="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 text-sm font-medium transition-colors opacity-90 hover:opacity-100 flex items-center gap-2 min-w-[100px]"
								>
									<Send className="h-4 w-4" />
									Answer
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	if (withScrollArea) {
		return <ScrollArea className="h-full">{content}</ScrollArea>;
	}

	return (
		<>
			{content}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							question.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="bg-gray-400 hover:bg-gray-500">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-500 hover:bg-red-600"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
