import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyUserToken } from "@/lib/whop-api";
import { whopApi } from "@/lib/whop-api";

export async function POST(req: NextRequest) {
	const agentUserId = process.env.WHOP_AGENT_USER_ID;
	if (!agentUserId) throw new Error("WHOP_AGENT_USER_ID missing");

	const { action, experienceId, id, question, questionText } = await req.json();
	try {
		const headersList = req.headers;
		const userToken = await verifyUserToken(headersList);
		if (!userToken)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		if (action === "submit") {
			if (!question || question.length > 100)
				return NextResponse.json(
					{ error: "Invalid question" },
					{ status: 400 },
				);
			if (!experienceId)
				return NextResponse.json(
					{ error: "Missing experienceId" },
					{ status: 400 },
				);
			const created = await prisma.question.create({
				data: { experienceId, question, status: "PENDING" },
			});
			return NextResponse.json(created);
		}

		if (action === "approve") {
			if (!id)
				return NextResponse.json({ error: "Missing id" }, { status: 400 });
			const questionObj = await prisma.question.findUnique({ where: { id } });
			if (!questionObj)
				return NextResponse.json(
					{ error: "Question not found" },
					{ status: 404 },
				);
			const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
				userId: userToken.userId,
				experienceId: questionObj.experienceId,
			});
			if (hasAccess.hasAccessToExperience.accessLevel !== "admin")
				return NextResponse.json({ error: "Not authorized" }, { status: 403 });
			const approved = await prisma.question.update({
				where: { id },
				data: { status: "APPROVED" },
			});
			return NextResponse.json(approved);
		}

		if (action === "delete") {
			if (!id)
				return NextResponse.json({ error: "Missing id" }, { status: 400 });
			const questionObj = await prisma.question.findUnique({ where: { id } });
			if (!questionObj)
				return NextResponse.json(
					{ error: "Question not found" },
					{ status: 404 },
				);
			const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
				userId: userToken.userId,
				experienceId: questionObj.experienceId,
			});
			if (hasAccess.hasAccessToExperience.accessLevel !== "admin")
				return NextResponse.json({ error: "Not authorized" }, { status: 403 });
			await prisma.question.delete({ where: { id } });
			return NextResponse.json({ success: true });
		}

		if (action === "pushToForums") {
			if (!id || !questionText)
				return NextResponse.json(
					{ error: "Missing id or questionText" },
					{ status: 400 },
				);
			const questionObj = await prisma.question.findUnique({ where: { id } });
			if (!questionObj)
				return NextResponse.json(
					{ error: "Question not found" },
					{ status: 404 },
				);
			const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
				userId: userToken.userId,
				experienceId: questionObj.experienceId,
			});
			if (hasAccess.hasAccessToExperience.accessLevel !== "admin")
				return NextResponse.json({ error: "Not authorized" }, { status: 403 });
			const forum = await whopApi.withUser(agentUserId).findOrCreateForum({
				input: {
					experienceId: questionObj.experienceId,
					name: "AMA Forum",
					whoCanPost: "admins",
				},
			});
			const forumId = forum.createForum?.id;
			if (!forumId) {
				console.log("No forum ID");
				return NextResponse.json(
					{ error: "Could not create or find forum" },
					{ status: 500 },
				);
			}
			await whopApi.withUser(agentUserId).createForumPost({
				input: {
					forumExperienceId: forumId,
					title: "Somebody asked:",
					content: `"${questionText}"`,
					isMention: true,
				},
			});
			await prisma.question.update({
				where: { id },
				data: { pushedToForum: true },
			});
			return NextResponse.json({ success: true });
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (error) {
		console.log("Error", error);
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const experienceId = searchParams.get("experienceId");
	const status = searchParams.get("status");
	try {
		const headersList = req.headers;
		const userToken = await verifyUserToken(headersList);
		if (!userToken)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (!experienceId)
			return NextResponse.json(
				{ error: "Missing experienceId" },
				{ status: 400 },
			);
		const hasAccess = await whopApi.checkIfUserHasAccessToExperience({
			userId: userToken.userId,
			experienceId,
		});
		if (hasAccess.hasAccessToExperience.accessLevel !== "admin")
			return NextResponse.json({ error: "Not authorized" }, { status: 403 });
		if (status === "PENDING") {
			const pendingQuestions = await prisma.question.findMany({
				where: { status: "PENDING", experienceId },
			});
			return NextResponse.json(pendingQuestions);
		}
		if (status === "APPROVED") {
			const approvedQuestions = await prisma.question.findMany({
				where: { status: "APPROVED", experienceId },
			});
			return NextResponse.json(approvedQuestions);
		}
		return NextResponse.json({ error: "Invalid status" }, { status: 400 });
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
