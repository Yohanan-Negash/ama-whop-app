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
			// Send push notification to admin
			// try {
			// 	// Get experience details to find admin
			// 	const experience = await whopApi.getExperience({ experienceId });

			// 	// Try to get company information from the experience
			// 	let adminUserId: string | null = null;

			// 	if (experience.experience?.company?.id) {
			// 		// If we have company ID, we could potentially find the owner/admin
			// 		// For now, let's use getCurrentUser to see if we can identify the admin
			// 		try {
			// 			const currentUser = await whopApi.getCurrentUser();
			// 			if (currentUser.viewer?.user?.id) {
			// 				// Check if current user has admin access to this experience
			// 				const accessCheck =
			// 					await whopApi.checkIfUserHasAccessToExperience({
			// 						userId: currentUser.viewer?.user?.id,
			// 						experienceId,
			// 					});

			// 				if (accessCheck.hasAccessToExperience.accessLevel === "admin") {
			// 					adminUserId = currentUser.viewer?.user?.id;
			// 				}
			// 			}
			// 		} catch (userError) {
			// 			console.log("Could not get current user for admin identification");
			// 		}
			// 	}
			// 	// Verify the admin user has access before sending notification
			// 	const result = await whopApi.checkIfUserHasAccessToExperience({
			// 		userId: adminUserId,
			// 		experienceId,
			// 	});

			// 	const { accessLevel } = result.hasAccessToExperience;
			// 	if (accessLevel === "admin") {
			// 		const appUrl = `/experiences/${experienceId}/admin`;
			// 		if (adminUserId) {
			// 			await whopApi.sendNotification({
			// 				input: {
			// 					experienceId,
			// 					title: "New Anoynomous Question Received! 💭",
			// 					content: `"${question.length > 50 ? `${question.substring(0, 50)}...` : question}"`,
			// 					userIds: [adminUserId],
			// 					isMention: true,
			// 					link: appUrl,
			// 				},
			// 			});
			// 		} else {
			// 			console.log("Admin user ID could not be found for experience");
			// 		}
			// 	}
			// } catch (notificationError) {
			// 	// Don't fail the question creation if notification fails
			// 	console.error("Failed to send notification:", notificationError);
			// }
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
