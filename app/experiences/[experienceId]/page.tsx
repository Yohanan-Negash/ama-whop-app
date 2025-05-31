import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";
import QuestionForm from "@/components/question-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AdBanner from "@/components/ad-banner";
import { Shield, MessageCircle, Heart, Brain } from "lucide-react";

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
		<div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
			{/* Admin Panel */}
			{accessLevel === "admin" && (
				<div className="bg-white border-b border-orange-100">
					<div className="max-w-2xl mx-auto px-4 py-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-700">
								Admin Panel
							</span>
							<Link href={`/experiences/${experienceId}/admin`}>
								<Button
									size="sm"
									className="text-xs bg-amber-600 hover:bg-amber-700"
								>
									<Shield className="h-3 w-3 mr-1" />
									View Questions
								</Button>
							</Link>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-2xl mx-auto px-4 py-6">
				{/* Header */}
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Ask Me Anything
					</h1>
					<p className="text-sm text-gray-600">
						100% anonymous. Ask what you really want to know.
					</p>
				</div>

				{/* Categories */}
				<div className="bg-white rounded-lg border border-orange-100 mb-6">
					<div className="p-4">
						<div className="grid gap-3 grid-cols-2">
							<div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
								<MessageCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
								<div>
									<h3 className="text-xs font-semibold text-gray-900">
										Personal Advice
									</h3>
									<p className="text-[10px] text-gray-500">
										Life, career, relationships
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
								<Brain className="h-4 w-4 text-orange-500 flex-shrink-0" />
								<div>
									<h3 className="text-xs font-semibold text-gray-900">
										Hot Takes
									</h3>
									<p className="text-[10px] text-gray-500">
										Controversial opinions
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
								<Heart className="h-4 w-4 text-orange-500 flex-shrink-0" />
								<div>
									<h3 className="text-xs font-semibold text-gray-900">
										Vulnerable
									</h3>
									<p className="text-[10px] text-gray-500">
										Mental health, fears
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
								<Shield className="h-4 w-4 text-orange-500 flex-shrink-0" />
								<div>
									<h3 className="text-xs font-semibold text-gray-900">
										Honest Feedback
									</h3>
									<p className="text-[10px] text-gray-500">
										Critique my work/decisions
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Question Form */}
				<div className="bg-white rounded-lg border border-orange-100 mb-6">
					<div className="p-4">
						<QuestionForm experienceId={experienceId} />
					</div>
				</div>

				{/* Ad Banner */}
				<div className="flex justify-center">
					<AdBanner />
				</div>
			</div>
		</div>
	);
}
