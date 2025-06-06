import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminStats } from "@/components/admin/admin-stats";
import PendingQuestions from "@/components/admin/pending-questions";
import AnsweredQuestions from "@/components/admin/approved-questions";
import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AdminPage({
	params,
}: { params: Promise<{ experienceId: string }> }) {
	const { experienceId } = await params;

	const headerList = await headers();
	const { userId } = await verifyUserToken(headerList);

	const result = await whopApi.checkIfUserHasAccessToExperience({
		userId,
		experienceId,
	});

	const user = await whopApi.getUser({ userId: userId });

	const { accessLevel } = await result.hasAccessToExperience;

	if (!accessLevel && accessLevel !== "admin") {
		redirect(`experiences/${experienceId}`);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-1 sm:px-2 py-4 sm:py-6">
				<div className="max-w-4xl mx-auto mb-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						<div className="flex items-center gap-2 sm:gap-3 w-full">
							<Link href={`/experiences/${experienceId}`}>
								<Button size="icon" className="bg-amber-600 hover:bg-amber-700">
									<ArrowLeft className="h-5 w-5" />
									<span className="sr-only">Back to home</span>
								</Button>
							</Link>
							<span className="text-base sm:text-3xl font-bold text-gray-900 truncate w-full sm:w-auto">
								Welcome back {user.publicUser.name}
							</span>
						</div>
					</div>
				</div>
				<div className="max-w-full sm:max-w-4xl mx-auto mb-3 sm:mb-4">
					<AdminStats experienceId={experienceId} />
				</div>
				<div className="max-w-full sm:max-w-4xl mx-auto">
					<Tabs defaultValue="pending">
						<TabsList className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 bg-card rounded-lg shadow w-full sm:w-fit mx-auto p-0.5 sm:p-1 border border-border overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
							<TabsTrigger
								value="pending"
								className="relative flex-1 min-w-[100px] sm:min-w-[120px] px-2 sm:px-6 py-2 text-xs sm:text-base font-semibold rounded-md transition-all cursor-pointer data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-b-4 data-[state=active]:border-orange-400 data-[state=inactive]:bg-orange-50 data-[state=inactive]:text-muted-foreground hover:bg-orange-100"
							>
								Pending
							</TabsTrigger>
							<TabsTrigger
								value="answered"
								className="relative flex-1 min-w-[100px] sm:min-w-[120px] px-2 sm:px-6 py-2 text-xs sm:text-base font-semibold rounded-md transition-all cursor-pointer data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-b-4 data-[state=active]:border-orange-400 data-[state=inactive]:bg-orange-50 data-[state=inactive]:text-muted-foreground hover:bg-orange-100"
							>
								Answered
							</TabsTrigger>
						</TabsList>
						<TabsContent value="pending">
							<ScrollArea className="h-[65vh] min-h-[400px] rounded-md border-none">
								<Card className="border-0 shadow-sm bg-card rounded-md p-1 sm:p-2 w-full">
									<CardHeader className="pb-2">
										<CardTitle className="text-sm sm:text-lg text-foreground text-center">
											Questions from your community
										</CardTitle>
										<div className="text-center text-xs sm:text-sm text-muted-foreground">
											Answer questions from your community. Your responses will
											automatically create engaging forum posts for discussion.
										</div>
									</CardHeader>
									<CardContent className="p-0">
										<PendingQuestions experienceId={experienceId} />
									</CardContent>
								</Card>
							</ScrollArea>
						</TabsContent>
						<TabsContent value="answered">
							<ScrollArea className="h-[65vh] min-h-[400px] rounded-md border-none">
								<Card className="border-0 shadow-sm bg-card rounded-md p-1 sm:p-2 w-full">
									<CardHeader className="pb-2">
										<CardTitle className="text-sm sm:text-lg text-foreground text-center">
											Your Q&A responses
										</CardTitle>
										<div className="text-center text-xs sm:text-sm text-muted-foreground">
											Your answered questions and the forum discussions they've
											sparked in your community.
										</div>
									</CardHeader>
									<CardContent className="p-0">
										<AnsweredQuestions experienceId={experienceId} />
									</CardContent>
								</Card>
							</ScrollArea>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
