"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function AdBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Card className="relative overflow-hidden border border-gray-100 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
        <p className="text-base font-medium mb-3 text-gray-700">Advertisement</p>
        <div className="w-full h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-3 border border-gray-100">
          <p className="text-sm text-gray-400">Your Ad Here</p>
        </div>
        <p className="text-xs text-gray-400 text-center">Sponsored Content</p>
      </CardContent>
    </Card>
  )
}
