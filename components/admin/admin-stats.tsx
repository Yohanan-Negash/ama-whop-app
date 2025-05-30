import { Card, CardContent } from "@/components/ui/card"

export default function AdminStats() {
  // Mock stats - in a real app, this would come from your database
  const stats = {
    pendingQuestions: 12,
    approvedQuestions: 89,
  }

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent justify-center items-center">
      <Card className="border border-border bg-card rounded-lg shadow-sm w-44 h-28 flex-shrink-0 flex flex-col justify-center">
        <CardContent className="p-4 text-center flex flex-col justify-center items-center h-full">
          <p className="text-4xl font-bold text-orange-400 mb-1">{stats.pendingQuestions}</p>
          <p className="text-muted-foreground text-base">Pending Review</p>
        </CardContent>
      </Card>
      <Card className="border border-border bg-card rounded-lg shadow-sm w-44 h-28 flex-shrink-0 flex flex-col justify-center">
        <CardContent className="p-4 text-center flex flex-col justify-center items-center h-full">
          <p className="text-4xl font-bold text-green-500 mb-1">{stats.approvedQuestions}</p>
          <p className="text-muted-foreground text-base">Approved</p>
        </CardContent>
      </Card>
    </div>
  )
}
