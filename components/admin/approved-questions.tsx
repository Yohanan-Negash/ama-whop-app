"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import {
	deleteQuestion,
	pushToForums,
	getApprovedQuestions,
} from "@/lib/actions";
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

// const mockApprovedQuestions = [
// 	{
// 		id: "101",
// 		content:
// 			"Your course is overpriced for the value it provides. Most of the content is just basic stuff you can find on YouTube for free.",
// 		createdAt: "1 day ago",
// 		pushedToForum: false,
// 	},
// ];

interface ApprovedQuestion {
	id: string;
	question: string;
	createdAt: string;
	pushedToForum: boolean;
}

interface ApprovedQuestionsProps {
	experienceId: string;
	withScrollArea?: boolean;
}

export default function ApprovedQuestions({
	experienceId,
	withScrollArea,
}: ApprovedQuestionsProps) {
	const [approvedQuestions, setApprovedQuestions] = useState<
		ApprovedQuestion[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processingIds, setProcessingIds] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

	useEffect(() => {
		async function fetchQuestions() {
			setLoading(true);
			setError(null);
			try {
				const result = await getApprovedQuestions(experienceId);
				if (result && "error" in result) setError(result.error);
				else
					setApprovedQuestions(
						(
							result as {
								id: string;
								question: string;
								createdAt: string | Date;
								pushedToForum: boolean;
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

	function handleDeleteClick(id: string) {
		setQuestionToDelete(id);
		setDeleteDialogOpen(true);
	}

	async function handleConfirmDelete() {
		if (!questionToDelete) return;
		setProcessingIds((prev) => [...prev, questionToDelete]);
		try {
			await deleteQuestion(questionToDelete);
			setApprovedQuestions((prev) =>
				prev.filter((q) => q.id !== questionToDelete),
			);
			toast("Question deleted 🗑️");
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

	async function handlePushToForums(id: string, questionText: string) {
		setProcessingIds((prev) => [...prev, id]);
		try {
			await pushToForums(id, questionText);
			setApprovedQuestions((prev) =>
				prev.map((q) => (q.id === id ? { ...q, pushedToForum: true } : q)),
			);
			toast("The question has been pushed to Whop forums.");
		} catch (error) {
			toast("There was an error pushing to forums. Please try again.");
		} finally {
			setProcessingIds((prev) => prev.filter((pId) => pId !== id));
		}
	}

	if (loading) {
		return <div className="text-center py-12 text-gray-500">Loading...</div>;
	}

	if (error) {
		return <div className="text-center py-12 text-red-500">{error}</div>;
	}

	if (approvedQuestions.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="text-6xl mb-4">✅</div>
				<p className="text-gray-600 text-lg">No approved questions yet.</p>
			</div>
		);
	}

	const content = (
		<div className="space-y-2 sm:space-y-3">
			{approvedQuestions.map((question) => (
				<Card
					key={question.id}
					className="border bg-card border-orange-200 rounded-lg shadow-sm px-2 sm:px-4 py-2 sm:py-3 w-full max-w-full sm:max-w-[700px] mx-auto"
				>
					<CardContent className="p-0">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
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
							<div className="flex gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4 self-end sm:self-center">
								<Button
									size="icon"
									onClick={() => handleDeleteClick(question.id)}
									disabled={processingIds.includes(question.id)}
									className="border-red-300 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-full p-2 h-9 w-9 sm:h-8 sm:w-8 opacity-80 hover:opacity-100"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									onClick={() =>
										handlePushToForums(question.id, question.question)
									}
									disabled={
										processingIds.includes(question.id) ||
										question.pushedToForum
									}
									className={`bg-orange-500 hover:bg-orange-600 text-white rounded px-3 py-2 text-xs sm:text-sm font-medium transition-colors opacity-90 hover:opacity-100 min-w-[110px] ${
										question.pushedToForum
											? "bg-gray-200 text-gray-500 cursor-not-allowed"
											: ""
									}`}
								>
									{question.pushedToForum
										? "Posted to Forums"
										: "Create Forum Post"}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	return (
		<>
			{withScrollArea && approvedQuestions.length > 4 ? (
				<ScrollArea className="max-h-[600px] w-full pr-2">{content}</ScrollArea>
			) : (
				content
			)}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Question?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this anonymous question. This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-500 hover:bg-red-600"
							onClick={handleConfirmDelete}
						>
							Delete Question
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
