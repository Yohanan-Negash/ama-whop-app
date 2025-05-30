import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionForm from "@/components/question-form"
import AdBanner from "@/components/ad-banner"
import { Shield, MessageCircle, Heart, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ask Me Anything</h1>
            <p className="text-base text-gray-600 mb-4">
              100% anonymous. No judgment. No tracking. Ask what you really want to know.
            </p>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg text-gray-900">What can you ask?</CardTitle>
              <CardDescription className="text-sm">
                Your safe space for honest, vulnerable, or even controversial questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                <MessageCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Personal Advice</h3>
                  <p className="text-xs text-gray-600">Life, career, or relationship questions</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                <Brain className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Controversial Topics</h3>
                  <p className="text-xs text-gray-600">Hot takes, unpopular opinions</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                <Heart className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Vulnerable Moments</h3>
                  <p className="text-xs text-gray-600">Mental health, insecurities, fears</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Honest Feedback</h3>
                  <p className="text-xs text-gray-600">Roast my decisions, critique my work</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-orange border-0">
            <CardContent className="p-6">
              <QuestionForm />
            </CardContent>
          </Card>

          <AdBanner />

          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
            <Shield className="h-5 w-5 text-green-600" />
            <p className="text-xs text-green-700 font-medium">
              100% Anonymous - No IP tracking, no cookies, no way to identify you
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
