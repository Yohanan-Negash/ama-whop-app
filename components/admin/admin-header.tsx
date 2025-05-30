import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AdminHeader() {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              size="icon"
              className=" bg-amber-600 hover:bg-amber-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to home</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back X</h1>
        </div>
      </div>
    </div>
  )
}
