"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface AnsweredQuestionsProps {
	experienceId: string;
	withScrollArea?: boolean;
}

interface AnsweredQuestion {
	id: string;
	question: string;
	answer: string;
	createdAt: string;
	answeredAt?: string;
	forumPostId?: string;
}

export default function AnsweredQuestions({
	experienceId,
	withScrollArea,
}: AnsweredQuestionsProps) {
	const [answeredQuestions, setAnsweredQuestions] = useState<
		AnsweredQuestion[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processingIds, setProcessingIds] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		async function fetchQuestions() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`/api/questions?experienceId=${experienceId}&status=APPROVED`,
				);
				const result = await res.json();
				if (result?.error) setError(result.error);
				else
					setAnsweredQuestions(
						(
							result as {
								id: string;
								question: string;
								answer?: string;
								createdAt: string | Date;
								answeredAt?: string | Date;
								forumPostId?: string;
							}[]
						).map((q) => ({
							...q,
							answer: q.answer || "No answer provided",
							createdAt:
								typeof q.createdAt === "string"
									? q.createdAt
									: q.createdAt.toISOString(),
							answeredAt: q.answeredAt
								? typeof q.answeredAt === "string"
									? q.answeredAt
									: q.answeredAt.toISOString()
								: undefined,
						})),
					);
			} catch (err) {
				setError("Failed to load answered questions");
			}
			setLoading(false);
		}
		fetchQuestions();
	}, [experienceId]);

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
			setAnsweredQuestions((prev) =>
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

	function handleViewForumPost(forumPostId: string) {
		// Open the forum post in a new tab
		window.open(`/forums/post/${forumPostId}`, "_blank");
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

	if (answeredQuestions.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<p>No answered questions yet.</p>
			</div>
		);
	}

	const content = (
		<div className="space-y-2 sm:space-y-3">
			{answeredQuestions.map((question) => (
				<Card
					key={question.id}
					className="border bg-card border-green-200 rounded-lg shadow-sm px-2 sm:px-4 py-2 sm:py-3 w-full max-w-full sm:max-w-[700px] mx-auto"
				>
					<CardContent className="p-0">
						<div className="space-y-3">
							<div className="flex flex-col sm:flex-row justify-between items-start gap-2">
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-foreground text-sm sm:text-base mb-1 break-words">
										Q: {question.question}
									</p>
									<p className="text-sm text-muted-foreground mb-2 break-words">
										A: {question.answer}
									</p>
									<div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
										<span>
											Asked{" "}
											{formatDistanceToNow(new Date(question.createdAt), {
												addSuffix: true,
											})}
										</span>
										{question.answeredAt && (
											<>
												<span className="hidden sm:inline">•</span>
												<span>
													Answered{" "}
													{formatDistanceToNow(new Date(question.answeredAt), {
														addSuffix: true,
													})}
												</span>
											</>
										)}
									</div>
								</div>
								<div className="flex gap-2 mt-2 sm:mt-0">
									<Button
										size="icon"
										onClick={() => handleDeleteClick(question.id)}
										disabled={processingIds.includes(question.id)}
										className="border-red-300 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-full p-2 h-9 w-9 sm:h-8 sm:w-8 opacity-80 hover:opacity-100"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
							{/* <div className="flex justify-center">
								{question.forumPostId && (
									<Button
										onClick={() =>
											handleViewForumPost(question.forumPostId as string)
										}
										className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium transition-colors opacity-90 hover:opacity-100 flex items-center gap-2"
									>
										<ExternalLink className="h-4 w-4" />
										View Forum Post
									</Button>
								)}
							</div> */}
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
							question and its answer. The forum post will remain.
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
