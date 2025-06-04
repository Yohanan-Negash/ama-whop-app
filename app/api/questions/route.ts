import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyUserToken } from "@/lib/whop-api";
import { whopApi } from "@/lib/whop-api";

export async function POST(req: NextRequest) {
	const agentUserId = process.env.WHOP_AGENT_USER_ID;
	if (!agentUserId) throw new Error("WHOP_AGENT_USER_ID missing");

	const { action, experienceId, id, question, questionText, answer } =
		await req.json();
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

			try {
				const users = await whopApi.listUsersForExperience({
					experienceId: experienceId,
				});

				const allUsers = users.publicExperience.users?.nodes || [];

				// console.log("Here are all the users", allUsers);

				const adminUsers = [];

				// console.log("All users with access levels:");
				for (const user of allUsers) {
					if (!user) continue;
					const result = await whopApi.checkIfUserHasAccessToExperience({
						userId: user.id,
						experienceId,
					});

					const { accessLevel } = result.hasAccessToExperience;

					// console.log(
					// 	`User ${user.id} (${user.username}) accessLevel: ${accessLevel}${accessLevel === "admin" ? " [ADMIN]" : ""}`,
					// );

					if (accessLevel === "admin") {
						adminUsers.push({
							id: user.id,
							username: user.username,
							accessLevel,
						});
					}
				}

				const notifiedUserIds = adminUsers.map((user) => user.id);

				for (const user of adminUsers) {
					if (user.accessLevel !== "admin") {
						console.warn(
							`WARNING: User ${user.id} (${user.username}) is in adminUsers but does not have admin accessLevel!`,
						);
					}
				}

				await whopApi.sendPushNotification({
					input: {
						experienceId,
						title: "New Anoynomous Question Received! 💭",
						content: "You have a new question waiting in your dashboard",
						userIds: notifiedUserIds,
						isMention: true,
					},
				});
			} catch (error) {
				console.log("there is some error", error);
			}
			return NextResponse.json(created);
		}

		if (action === "approve") {
			if (!id || !answer)
				return NextResponse.json(
					{ error: "Missing id or answer" },
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

			// Create forum post
			const forum = await whopApi.withUser(agentUserId).findOrCreateForum({
				input: {
					experienceId: questionObj.experienceId,
					name: "AMA Forum",
					whoCanPost: "admins",
				},
			});
			const forumId = forum.createForum?.id;
			if (!forumId) {
				return NextResponse.json(
					{ error: "Could not create or find forum" },
					{ status: 500 },
				);
			}

			const forumPost = await whopApi.withUser(agentUserId).createForumPost({
				input: {
					forumExperienceId: forumId,
					title: `Someone asked: ${questionObj.question}`,
					content: `My answer: ${answer}\n\nWhat do you think? 💭`,
					isMention: true,
				},
			});

			const forumPostId = forumPost.createForumPost?.id;

			// Update question with answer
			const approved = await prisma.question.update({
				where: { id },
				data: {
					status: "APPROVED",
					answer,
					forumPostId: forumPostId || null,
					answeredAt: new Date(),
					pushedToForum: true,
				},
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
