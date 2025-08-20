"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, GraduationCap, Send, Loader2, AlertCircle, PartyPopper } from "lucide-react"
import { toast } from "sonner"

export function ApplicationForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [applicationSubmitted, setApplicationSubmitted] = useState(false)
    const applyMutation = useMutation(api.tutors.applyToBecomeTutorForPublic)

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            await applyMutation({})
            setApplicationSubmitted(true)
            toast.success("Application submitted successfully! We'll review it within 24 hours.")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit application")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (applicationSubmitted) {
        return (
            <section className="py-20 px-4 bg-gradient-to-br from-green-600 to-blue-700">
                <div className="max-w-3xl mx-auto">
                    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm text-center">
                        <CardContent className="p-12">
                            <div className="mb-6">
                                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
                                    <PartyPopper className="h-12 w-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    Application Submitted! 🎉
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    Thank you for applying to become a tutor with XcelTutors. We&apos;ve received your application and will review it within 24 hours.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-center gap-3 text-sm">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span>Application received and logged</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-sm">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span>Review process initiated</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-sm">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                    <span>You&apos;ll be notified via email once approved</span>
                                </div>
                            </div>

                            <Badge variant="outline" className="text-sm">
                                ⏱️ Expected review time: 24 hours
                            </Badge>
                        </CardContent>
                    </Card>
                </div>
            </section>
        )
    }

    return (
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
            <div className="max-w-3xl mx-auto">
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                    <CardHeader className="text-center pb-8">
                        <div className="mx-auto mb-6 p-4 bg-blue-100 rounded-full w-fit">
                            <GraduationCap className="h-12 w-12 text-blue-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                            Ready to Start Teaching?
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Submit your application to join our community of expert tutors
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-3">What happens next:</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                    <span>Your application will be reviewed by our team</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                    <span>We&apos;ll verify your levels and background</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                    <span>Once approved, you can start accepting students immediately</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-gray-900">Requirements Met</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>Valid account</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>Profile complete</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>Ready to teach</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>Terms accepted</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            size="lg"
                            className="w-full text-lg py-6 bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Submitting Application...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Submit Application
                                </>
                            )}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            By submitting, you agree to our Terms of Service and Privacy Policy
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
