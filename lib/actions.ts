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
		const questionText = formData.get("question") as string;
		if (!questionText || questionText.length > 100)
			throw new Error("Invalid question");
		if (!experienceId) throw new Error("Missing experienceId");

		const question = await prisma.question.create({
			data: {
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
		if (!question) throw new Error("Question not found");

		const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
			userId: userToken.userId,
			experienceId: question.experienceId,
		});

		if (hasAccess.hasAccessToExperience.accessLevel !== "admin") {
			throw new Error("Not authorized");
		}

		const approvedQuestion = await prisma.question.update({
			where: { id },
			data: { status: "APPROVED" },
		});

		return approvedQuestion;
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function deleteQuestion(id: string) {
	try {
		const headerList = await headers();
		const userToken = await verifyUserToken(headerList);
		if (!userToken) throw new Error("Unauthorized");
		const question = await prisma.question.findUnique({ where: { id } });
		if (!question) throw new Error("Question not found");

		const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
			userId: userToken.userId,
			experienceId: question.experienceId,
		});

		if (hasAccess.hasAccessToExperience.accessLevel !== "admin") {
			throw new Error("Not authorized");
		}
		const deletedQuestion = await prisma.question.delete({ where: { id } });
		return deleteQuestion;
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function getPendingQuestions(experienceId: string) {
	try {
		const headerList = await headers();
		const userToken = await verifyUserToken(headerList);
		if (!userToken) throw new Error("Unauthorized");

		const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
			userId: userToken.userId,
			experienceId,
		});

		if (hasAccess.hasAccessToExperience.accessLevel !== "admin") {
			throw new Error("Not auhtorized");
		}

		const pendingQuestions = await prisma.question.findMany({
			where: {
				status: "PENDING",
				experienceId,
			},
		});

		return pendingQuestions;
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function getApprovedQuestions(experienceId: string) {
	try {
		const headerList = await headers();
		const userToken = await verifyUserToken(headerList);
		if (!userToken) throw new Error("Not authorized");

		const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
			userId: userToken.userId,
			experienceId,
		});

		if (hasAccess.hasAccessToExperience.accessLevel !== "admin") {
			throw new Error("Not authorized");
		}

		const approvedQuestions = await prisma.question.findMany({
			where: {
				status: "APPROVED",
				experienceId,
			},
		});

		return approvedQuestions;
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function pushToForums(id: string, questionText: string) {
	try {
		const headerList = await headers();
		const userToken = await verifyUserToken(headerList);
		if (!userToken) throw new Error("Unauthorized");
		const question = await prisma.question.findUnique({ where: { id } });
		if (!question) throw new Error("Question not found");

		const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
			userId: userToken.userId,
			experienceId: question.experienceId,
		});
		if (hasAccess.hasAccessToExperience.accessLevel !== "admin") {
			throw new Error("Not authorized");
		}

		const forum = await whopApi.withUser(userToken.userId).findOrCreateForum({
			input: {
				experienceId: question.experienceId,
				name: "AMA Forum",
				whoCanPost: "admins",
			},
		});
		const forumId = forum.createForum?.id;
		if (!forumId) throw new Error("Could not create or find forum");

		await whopApi.withUser(userToken.userId).createForumPost({
			input: {
				forumExperienceId: forumId,
				title: "Anonymous AMA Question",
				content: `"${questionText}"`,
			},
		});

		// Update the question to mark as pushed to forum
		await prisma.question.update({
			where: { id },
			data: { pushedToForum: true },
		});

		return { success: true };
	} catch (error) {
		return { error: (error as Error).message };
	}
}
