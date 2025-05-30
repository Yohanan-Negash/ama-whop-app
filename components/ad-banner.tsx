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
      <CardContent className="p-4 flex flex-col items-center justify-center min-h-[120px]">
        <div className="w-full max-w-xs bg-orange-50 border border-orange-200 rounded-lg flex flex-col items-center p-4 gap-2">
          <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-600 text-lg">AD</div>
          <div className="text-sm font-semibold text-orange-700">Sample Brand Headline</div>
          <div className="text-xs text-gray-500 text-center">This is a mock ad. Your brand, product, or service could be featured here with a call to action.</div>
          <button className="mt-2 px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs font-medium">Learn More</button>
        </div>
      </CardContent>
    </Card>
  )
}
