import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import AdminHeader from "@/components/admin/admin-header"
import AdminStats from "@/components/admin/admin-stats"
import PendingQuestions from "@/components/admin/pending-questions"
import ApprovedQuestions from "@/components/admin/approved-questions"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 py-6">
        <AdminHeader />
        <div className="max-w-4xl mx-auto mb-4">
          <AdminStats />
        </div>
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="pending">
            <TabsList className="flex gap-2 mb-4 bg-card rounded-lg shadow w-fit mx-auto p-1 border border-border">
              <TabsTrigger
                value="pending"
                className="relative flex-1 px-6 py-2 font-semibold rounded-md transition-all cursor-pointer data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-b-4 data-[state=active]:border-orange-400 data-[state=inactive]:bg-orange-50 data-[state=inactive]:text-muted-foreground hover:bg-orange-100"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="relative flex-1 px-6 py-2 font-semibold rounded-md transition-all cursor-pointer data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-b-4 data-[state=active]:border-orange-400 data-[state=inactive]:bg-orange-50 data-[state=inactive]:text-muted-foreground hover:bg-orange-100"
              >
                Approved
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <ScrollArea className="h-[540px] rounded-md border-none">
                <Card className="border-0 shadow-sm bg-card rounded-md p-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground text-center">Pending Anonymous Questions</CardTitle>
                    <div className="text-center text-sm text-muted-foreground">Review and approve or delete questions submitted by users. Only approved questions will be visible to the public.</div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <PendingQuestions />
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="approved">
              <ScrollArea className="h-[540px] rounded-md border-none">
                <Card className="border-0 shadow-sm bg-card rounded-md p-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground text-center">Approved Anonymous Questions</CardTitle>
                    <div className="text-center text-sm text-muted-foreground">These questions have been approved and can be visible to your community by creating a forum.</div>
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
  )
}
