"use client"

import Link from "next/link"
import { GraduationCap, Facebook, Twitter, Instagram, Mail } from "lucide-react"

export function MarketplaceFooter() {
    return (
        <footer className="bg-gray-900 text-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">XcelTutors</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Connecting students with expert tutors for personalized learning experiences.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">For Students</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Find Tutors</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Browse Subjects</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">How it Works</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">For Tutors</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/become-tutor" className="hover:text-white transition-colors">Become a Tutor</Link></li>
                            <li><Link href="/become-tutor" className="hover:text-white transition-colors">Benefits</Link></li>
                            <li><Link href="/become-tutor" className="hover:text-white transition-colors">Resources</Link></li>
                            <li><Link href="/become-tutor" className="hover:text-white transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <div className="flex gap-4 mb-4">
                            <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            <Mail className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                        </div>
                        <p className="text-sm text-gray-400">
                            hello@xceltutors.com
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; 2025 XcelTutors. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
