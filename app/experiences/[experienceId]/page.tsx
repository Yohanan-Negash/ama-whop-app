import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";
import QuestionForm from "@/components/question-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AdBanner from "@/components/ad-banner";
import { Shield, MessageCircle, Heart, Brain, ArrowLeft } from "lucide-react";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const headersList = await headers();
	const { experienceId } = await params;
	const { userId } = await verifyUserToken(headersList);
	const result = await whopApi.checkIfUserHasAccessToExperience({
		userId,
		experienceId,
	});
	const user = (await whopApi.getUser({ userId })).publicUser;
	const experience = (await whopApi.getExperience({ experienceId })).experience;
	const { accessLevel } = result.hasAccessToExperience;

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 to-white px-2 sm:px-4">
			<div className="w-full flex flex-col items-center">
				{accessLevel === "admin" && (
					<div className="w-full max-w-2xl flex justify-end mb-2 px-1 sm:px-0">
						<Link href={`/experiences/${experienceId}/admin`}>
							<Button
								size="sm"
								className="text-xs p-2 sm:p-4 m-1 sm:m-2 bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
							>
								Admin: Submitted Questions
							</Button>
						</Link>
					</div>
				)}
				<div className="w-full max-w-2xl flex flex-col gap-3 mt-2 px-1 sm:px-0">
					<div className="text-center">
						<h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
							Ask Me Anything
						</h1>
						<p className="text-sm sm:text-base text-gray-600 mb-2">
							100% anonymous. No judgment. No tracking. Ask what you really want
							to know.
						</p>
					</div>

					<div className="border-0 shadow-sm rounded-lg bg-white">
						<div className="text-center pb-1 pt-3">
							<h2 className="text-base sm:text-lg text-gray-900 font-semibold">
								What can you ask?
							</h2>
							<p className="text-xs sm:text-sm text-gray-600">
								Your safe space for honest, vulnerable, or even controversial
								questions.
							</p>
						</div>
						<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 p-2 sm:p-3">
							<div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
								<MessageCircle className="h-4 w-4 text-orange-500 mt-0.5" />
								<div>
									<h3 className="font-medium text-gray-900 mb-0.5 text-xs sm:text-sm">
										Personal Advice
									</h3>
									<p className="text-[10px] sm:text-xs text-gray-600">
										Life, career, or relationship questions
									</p>
								</div>
							</div>
							<div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
								<Brain className="h-4 w-4 text-orange-500 mt-0.5" />
								<div>
									<h3 className="font-medium text-gray-900 mb-0.5 text-xs sm:text-sm">
										Controversial Topics
									</h3>
									<p className="text-[10px] sm:text-xs text-gray-600">
										Hot takes, unpopular opinions
									</p>
								</div>
							</div>
							<div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
								<Heart className="h-4 w-4 text-orange-500 mt-0.5" />
								<div>
									<h3 className="font-medium text-gray-900 mb-0.5 text-xs sm:text-sm">
										Vulnerable Moments
									</h3>
									<p className="text-[10px] sm:text-xs text-gray-600">
										Mental health, insecurities, fears
									</p>
								</div>
							</div>
							<div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
								<Shield className="h-4 w-4 text-orange-500 mt-0.5" />
								<div>
									<h3 className="font-medium text-gray-900 mb-0.5 text-xs sm:text-sm">
										Honest Feedback
									</h3>
									<p className="text-[10px] sm:text-xs text-gray-600">
										Roast my decisions, critique my work
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="w-full max-w-2xl flex flex-col items-stretch mb-2 px-1 sm:px-0">
					<QuestionForm experienceId={experienceId} />
					<div className="flex justify-center mt-2">
						<AdBanner />
					</div>
				</div>
			</div>
		</div>
	);
}
