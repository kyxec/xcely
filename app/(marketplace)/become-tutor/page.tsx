import { ApplicationWrapper } from "./_components/ApplicationWrapper"

export default function BecomeTutorPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Application</h1>
                    <p className="text-gray-600">Check your application status</p>
                </div>
                <ApplicationWrapper />
            </div>
        </div>
    )
}
