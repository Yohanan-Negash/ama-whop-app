"use server";

import { prisma } from "@/lib/db";
import { verifyUserToken } from "@/lib/whop-api";
import { headers } from "next/headers";
import { whopApi } from "@/lib/whop-api";

export async function submitQuestion(experienceId: string, formData: FormData) {
	try {
		const headersList = await headers();
		const userToken = await verifyUserToken(headersList);
		if (!userToken) throw new Error("Unauthorized");
		const whopAdminId = userToken.userId;
		const questionText = formData.get("question") as string;
		if (!questionText || questionText.length > 100)
			throw new Error("Invalid question");
		if (!experienceId) throw new Error("Missing experienceId");

		const question = await prisma.question.create({
			data: {
				whopAdminId,
				experienceId,
				question: questionText,
				status: "PENDING",
			},
		});
		return question;
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function approveQuestion(id: string) {
	try {
		const headerList = await headers();
		const userToken = await verifyUserToken(headerList);
		if (!userToken) throw new Error("Unauthorized");
		const question = await prisma.question.findUnique({ where: { id } });
		if (!question) return { error: "Question not found" };

		const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
			userId: userToken.userId,
			experienceId: question.whopAdminId,
		});
	} catch (error) {}
}

export async function deleteQuestion(id: string) {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// In a real app, you would permanently delete the question from the database
	return { success: true };
}

export async function pushToForums(id: string) {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// In a real app, this would call the Whop Forums API to create a new post
	return { success: true };
}
