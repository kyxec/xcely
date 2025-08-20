"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight } from "lucide-react"

export function ApplicationProcess() {
    const steps = [
        {
            step: "01",
            title: "Submit Application",
            description: "Fill out our simple application form with your levels and teaching preferences.",
            duration: "5 minutes",
            status: "Easy"
        },
        {
            step: "02",
            title: "Profile Review",
            description: "Our team reviews your application and verifies your levels and background.",
            duration: "1-2 days",
            status: "Quick"
        },
        {
            step: "03",
            title: "Get Approved",
            description: "Once approved, create your tutor profile and start accepting students immediately.",
            duration: "Instant",
            status: "Ready"
        }
    ]

    return (
        <section className="py-20 px-4 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Simple Application Process
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Get started in just 3 easy steps and begin teaching within days
                    </p>
                </div>

                <div className="relative">
                    {/* Connection line for desktop */}
                    <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md h-full">
                                    <CardHeader className="pb-6">
                                        <div className="relative">
                                            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                {step.step}
                                            </div>
                                            {index < steps.length - 1 && (
                                                <ArrowRight className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
                                            )}
                                        </div>
                                        <Badge variant="outline" className="mx-auto w-fit mb-3">
                                            {step.status}
                                        </Badge>
                                        <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                                        <div className="text-sm text-blue-600 font-medium">
                                            ⏱️ {step.duration}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-center leading-relaxed">
                                            {step.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        <span>Average approval time: 24 hours</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
