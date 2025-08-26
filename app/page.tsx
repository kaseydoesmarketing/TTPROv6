import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            TitleTesterPro <span className="text-blue-600">v6</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Optimize your YouTube titles with data-driven A/B testing. 
            Increase your click-through rates and grow your channel.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              🚀 Ready to Optimize Your Titles?
            </h2>
            
            <div className="text-center">
              <Link 
                href="/app" 
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Launch App Dashboard
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 A/B Testing</h3>
              <p className="text-gray-600">
                Test multiple title variations automatically and see which performs best.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Real Analytics</h3>
              <p className="text-gray-600">
                Get detailed insights on click-through rates, views, and engagement.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🔄 Auto Rotation</h3>
              <p className="text-gray-600">
                Set it and forget it. Titles rotate automatically based on performance.
              </p>
            </div>
          </div>
        </div>
        
        <footer className="mt-16 text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}