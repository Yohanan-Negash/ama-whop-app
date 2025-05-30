import { Card, CardContent } from "@/components/ui/card"

export default function AdminStats() {
  // Mock stats - in a real app, this would come from your database
  const stats = {
    totalQuestions: 127,
    pendingQuestions: 12,
    approvedQuestions: 89,
  }

  return (
    <div className="grid gap-2 md:grid-cols-3">
      <Card className="border border-border bg-card rounded-lg shadow-sm">
        <CardContent className="p-2 text-center">
          <p className="text-4xl font-bold text-foreground mb-0.5">{stats.totalQuestions}</p>
          <p className="text-muted-foreground text-xs">Total Questions</p>
        </CardContent>
      </Card>
      <Card className="border border-border bg-card rounded-lg shadow-sm">
        <CardContent className="p-2 text-center">
          <p className="text-4xl font-bold text-orange-400 mb-0.5">{stats.pendingQuestions}</p>
          <p className="text-muted-foreground text-xs">Pending Review</p>
        </CardContent>
      </Card>
      <Card className="border border-border bg-card rounded-lg shadow-sm">
        <CardContent className="p-2 text-center">
          <p className="text-4xl font-bold text-green-500 mb-0.5">{stats.approvedQuestions}</p>
          <p className="text-muted-foreground text-xs">Approved</p>
        </CardContent>
      </Card>
    </div>
  )
}
