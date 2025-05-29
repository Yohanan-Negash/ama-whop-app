import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionForm from "@/components/question-form"
import AdBanner from "@/components/ad-banner"
import { Shield, MessageCircle, Heart, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {/* <div className="text-6xl mb-6">🕵️</div> */}
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Ask Me Anything</h1>
            <p className="text-xl text-gray-600 mb-8">
              The questions you'd never ask publicly. Completely anonymous. No judgment.
            </p>
          </div>

          {/* What You Can Ask Section */}
          <Card className="mb-8 border-0 shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900">What can you ask?</CardTitle>
              <CardDescription className="text-base">
                This is your safe space to ask anything you've been curious about but never felt comfortable asking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Personal Advice</h3>
                    <p className="text-sm text-gray-600">Relationship, career, life decisions you're struggling with</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <Brain className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Controversial Questions</h3>
                    <p className="text-sm text-gray-600">Hot takes, unpopular opinions, sensitive topics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <Heart className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Vulnerable Moments</h3>
                    <p className="text-sm text-gray-600">Mental health, insecurities, fears you don't share</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Honest Feedback</h3>
                    <p className="text-sm text-gray-600">Roast my decisions, critique my work, brutal honesty</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Form */}
          <Card className="mb-8 shadow-orange border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-gray-900">Ask Your Anonymous Question</CardTitle>
              <CardDescription>
                Your identity is completely protected. No tracking, no data collection, no way to trace it back to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <QuestionForm />
            </CardContent>
          </Card>

          {/* Ad Banner */}
          <div className="mb-8">
            <AdBanner />
          </div>

          {/* Privacy Notice */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg border border-green-100 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                100% Anonymous - No IP tracking, no cookies, no way to identify you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
