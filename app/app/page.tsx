import { Suspense } from 'react'

export default function AppDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TitleTesterPro Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your YouTube title A/B tests and campaigns
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🔐 Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in with Google to access your dashboard and start testing your titles.
            </p>
            
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Sign In with Google
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Campaigns</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
            <p className="text-sm text-gray-600">No active tests running</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Total Tests</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">0</p>
            <p className="text-sm text-gray-600">Tests completed</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Avg. CTR Improvement</h3>
            <p className="text-3xl font-bold text-purple-600 mb-2">--</p>
            <p className="text-sm text-gray-600">Start testing to see results</p>
          </div>
        </div>
      </div>
    </div>
  )
}