'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TitleTesterPro</span>
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">v6</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/app" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/privacy" className="text-primary-600 font-medium">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-medium p-8 lg:p-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">
            Privacy Policy
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-8 text-lg">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                TitleTesterPro v6 collects information to provide and improve our YouTube title testing services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Account Information:</strong> Email address, username, and profile information from Google OAuth</li>
                <li><strong>YouTube Channel Data:</strong> Channel IDs, video metadata, and analytics data necessary for A/B testing</li>
                <li><strong>OAuth Tokens:</strong> Securely stored access tokens to interact with YouTube APIs on your behalf</li>
                <li><strong>Test Data:</strong> Title variants, performance metrics, click-through rates (CTR), and average view duration (AVD)</li>
                <li><strong>Usage Analytics:</strong> Application usage patterns, feature interactions, and error logs for service improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Conduct automated A/B testing on your YouTube video titles</li>
                <li>Provide real-time analytics and performance insights</li>
                <li>Monitor click-through rates and viewer engagement metrics</li>
                <li>Maintain and improve our service functionality</li>
                <li>Ensure security and prevent unauthorized access</li>
                <li>Communicate important service updates and changes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Data Storage and Security</h2>
              <p className="text-gray-700 mb-4">
                Your data security is our priority:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>All data is encrypted both in transit and at rest using industry-standard encryption</li>
                <li>OAuth tokens are securely stored and never exposed in client-side code</li>
                <li>We use secure cloud infrastructure (Vercel/Firebase/Prisma) with regular security updates</li>
                <li>Access to your data is restricted to authorized personnel only</li>
                <li>We implement regular security audits and vulnerability assessments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Data Sharing and Third Parties</h2>
              <p className="text-gray-700 mb-4">
                <strong>We do not sell your personal data to third parties.</strong> We may share information only in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Google APIs:</strong> We interact with YouTube APIs to perform automated title testing as requested by you</li>
                <li><strong>Service Providers:</strong> Trusted third-party services that help us operate (hosting, analytics, database management)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and users&apos; safety</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Your Rights and Controls</h2>
              <p className="text-gray-700 mb-4">You have the following rights regarding your data:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Access:</strong> View all personal data we have collected about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Revoke Access:</strong> Disconnect your YouTube account and revoke OAuth permissions at any time</li>
                <li><strong>Data Portability:</strong> Export your test data and results in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, contact us at <a href="mailto:support@titletesterpro.com" className="text-primary-600 hover:text-primary-700 underline">support@titletesterpro.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your data only as long as necessary to provide our services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Account information is retained while your account is active</li>
                <li>Test data and results are retained to provide historical analytics</li>
                <li>OAuth tokens are automatically refreshed and expire based on Google&apos;s policies</li>
                <li>Upon account deletion, we remove your data within 30 days, except as required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">7. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your data may be processed and stored in the United States and other countries where our service providers operate. 
                We ensure appropriate safeguards are in place to protect your data according to this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Children&apos;s Privacy</h2>
              <p className="text-gray-700 mb-4">
                TitleTesterPro v6 is not intended for use by children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we learn we have collected such information, we will 
                delete it immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice in the application</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:support@titletesterpro.com" className="text-primary-600 hover:text-primary-700 underline">support@titletesterpro.com</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Business Name:</strong> TitleTesterPro
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> Florida, United States
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-primary-600 text-sm font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Terms & Conditions
              </Link>
              <Link href="mailto:support@titletesterpro.com" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Support
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; 2024 TitleTesterPro v6. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}