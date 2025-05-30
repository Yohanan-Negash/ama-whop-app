import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminStats from "@/components/admin/admin-stats";
import PendingQuestions from "@/components/admin/pending-questions";
import ApprovedQuestions from "@/components/admin/approved-questions";
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

	const user = (await whopApi.getUser({ userId })).publicUser;

	const { accessLevel } = await result.hasAccessToExperience;

	if (!accessLevel && accessLevel !== "admin") {
		redirect("/");
	}

	console.log(experienceId);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-1 sm:px-2 py-4 sm:py-6">
				<div className="max-w-4xl mx-auto mb-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Link href={`/experiences/${experienceId}`}>
								<Button
									size="icon"
									className=" bg-amber-600 hover:bg-amber-700"
								>
									<ArrowLeft className="h-5 w-5" />
									<span className="sr-only">Back to home</span>
								</Button>
							</Link>
							<h1 className="text-3xl font-bold text-gray-900">
								Welcome back {user.name}{" "}
							</h1>
						</div>
					</div>
				</div>
				<div className="max-w-full sm:max-w-4xl mx-auto mb-3 sm:mb-4">
					<AdminStats />
				</div>
				<div className="max-w-full sm:max-w-4xl mx-auto">
					<Tabs defaultValue="pending">
						<TabsList className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 bg-card rounded-lg shadow w-full sm:w-fit mx-auto p-0.5 sm:p-1 border border-border overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
							<TabsTrigger
								value="pending"
								className="relative flex-1 min-w-[120px] px-3 sm:px-6 py-2 text-sm sm:text-base font-semibold rounded-md transition-all cursor-pointer data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-b-4 data-[state=active]:border-orange-400 data-[state=inactive]:bg-orange-50 data-[state=inactive]:text-muted-foreground hover:bg-orange-100"
							>
								Pending
							</TabsTrigger>
							<TabsTrigger
								value="approved"
								className="relative flex-1 min-w-[120px] px-3 sm:px-6 py-2 text-sm sm:text-base font-semibold rounded-md transition-all cursor-pointer data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-b-4 data-[state=active]:border-orange-400 data-[state=inactive]:bg-orange-50 data-[state=inactive]:text-muted-foreground hover:bg-orange-100"
							>
								Approved
							</TabsTrigger>
						</TabsList>
						<TabsContent value="pending">
							<ScrollArea className="h-[60vh] min-h-[320px] rounded-md border-none">
								<Card className="border-0 shadow-sm bg-card rounded-md p-1 sm:p-2 w-full">
									<CardHeader className="pb-2">
										<CardTitle className="text-base sm:text-lg text-foreground text-center">
											Pending Anonymous Questions
										</CardTitle>
										<div className="text-center text-xs sm:text-sm text-muted-foreground">
											Review and approve or delete questions submitted by users.
											Only approved questions will be visible to the public.
										</div>
									</CardHeader>
									<CardContent className="p-0">
										<PendingQuestions />
									</CardContent>
								</Card>
							</ScrollArea>
						</TabsContent>
						<TabsContent value="approved">
							<ScrollArea className="h-[60vh] min-h-[320px] rounded-md border-none">
								<Card className="border-0 shadow-sm bg-card rounded-md p-1 sm:p-2 w-full">
									<CardHeader className="pb-2">
										<CardTitle className="text-base sm:text-lg text-foreground text-center">
											Approved Anonymous Questions
										</CardTitle>
										<div className="text-center text-xs sm:text-sm text-muted-foreground">
											These questions have been approved and can be visible to
											your community by creating a forum.
										</div>
									</CardHeader>
									<CardContent className="p-0">
										<ApprovedQuestions />
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
