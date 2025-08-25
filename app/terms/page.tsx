'use client'

import Link from 'next/link'

export default function TermsConditionsPage() {
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
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-primary-600 font-medium">
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-medium p-8 lg:p-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">
            Terms & Conditions
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-8 text-lg">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using TitleTesterPro v6 (&quot;the Service&quot;), you agree to be bound by these Terms & Conditions 
                (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service. These Terms apply to all 
                users, including browsers, customers, and contributors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                TitleTesterPro v6 is a Software-as-a-Service (SaaS) platform that enables YouTube content creators to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Conduct automated A/B testing on YouTube video titles</li>
                <li>Analyze click-through rates (CTR) and average view duration (AVD) in real-time</li>
                <li>Track video performance metrics and analytics with statistical significance</li>
                <li>Optimize content strategy based on data-driven insights</li>
                <li>Manage multiple YouTube channels and automated campaigns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">3. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                As a user of TitleTesterPro v6, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Lawful Use:</strong> Use the Service only for lawful purposes and in accordance with YouTube&apos;s Terms of Service</li>
                <li><strong>Account Security:</strong> Maintain the confidentiality of your account credentials and notify us immediately of unauthorized access</li>
                <li><strong>Accurate Information:</strong> Provide accurate, current, and complete information when creating your account</li>
                <li><strong>API Compliance:</strong> Comply with Google&apos;s API Terms of Service and usage quotas</li>
                <li><strong>Content Responsibility:</strong> Ensure all video titles and content you test comply with YouTube&apos;s community guidelines</li>
                <li><strong>Prohibited Activities:</strong> Not engage in spam, abuse, manipulation of metrics, or any activity that violates platform policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Account and Subscription</h2>
              <p className="text-gray-700 mb-4">
                Account creation and subscription terms:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>You must provide accurate information when creating an account</li>
                <li>You are responsible for all activities under your account</li>
                <li>Subscription fees are charged in advance and are non-refundable except as required by law</li>
                <li>We may modify subscription plans, pricing, and features with 30 days&apos; notice</li>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Upon cancellation, access continues until the end of your billing period</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Intellectual Property Rights</h2>
              <p className="text-gray-700 mb-4">
                <strong>TitleTesterPro v6 retains all intellectual property rights in the Service, including:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Software, algorithms, and proprietary automation technology</li>
                <li>User interface design, logos, and branding</li>
                <li>Documentation, guides, and educational materials</li>
                <li>Analytics methodologies and statistical analysis algorithms</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>You retain ownership of:</strong> Your video content, titles, and channel data. We only access 
                this data to provide the requested automated testing services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Service Availability and Modifications</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide reliable service, but please note:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>The Service is provided &quot;as is&quot; and may experience downtime for maintenance or updates</li>
                <li>We may modify, suspend, or discontinue features with reasonable notice</li>
                <li>Service availability may be affected by third-party APIs (YouTube, Google) and their limitations</li>
                <li>We reserve the right to impose usage limits to ensure fair access for all users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>TitleTesterPro v6 shall not be liable for any indirect, incidental, special, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim</li>
                <li>We are not responsible for decisions you make based on analytics or recommendations provided by the Service</li>
                <li>We do not guarantee specific results, improvements in video performance, or increases in views/revenue</li>
                <li>You use the automated testing Service at your own risk and are responsible for your content and channel management decisions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold TitleTesterPro v6 harmless from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Your use of the Service in violation of these Terms</li>
                <li>Your violation of any third-party rights or applicable laws</li>
                <li>Content you upload, test, or publish through the Service</li>
                <li>Any breach of your representations or warranties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Termination</h2>
              <p className="text-gray-700 mb-4">
                These Terms remain in effect until terminated:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>By You:</strong> Cancel your account at any time through account settings</li>
                <li><strong>By Us:</strong> We may terminate accounts for violations of these Terms, illegal activity, or abuse of the Service</li>
                <li><strong>Upon Termination:</strong> Your access will cease, but these Terms survive regarding past use of the Service</li>
                <li><strong>Data Retention:</strong> We will delete your data in accordance with our Privacy Policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline"> Privacy Policy</Link>, 
                which is incorporated by reference into these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">11. Governing Law and Disputes</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of the State of Florida, United States, without regard to conflict 
                of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved through:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Initial good faith negotiations between the parties</li>
                <li>If unresolved, binding arbitration in accordance with the rules of the American Arbitration Association</li>
                <li>Arbitration shall take place in Florida, United States</li>
                <li>Each party bears their own costs unless otherwise awarded by the arbitrator</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these Terms periodically. When we do:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>We will post the updated Terms on this page with a new &quot;Last updated&quot; date</li>
                <li>We will notify you via email or in-app notification for material changes</li>
                <li>Continued use of the Service after changes constitute acceptance of the new Terms</li>
                <li>If you disagree with changes, you may terminate your account before they take effect</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">13. Severability and Entire Agreement</h2>
              <p className="text-gray-700 mb-4">
                If any provision of these Terms is found unenforceable, the remaining provisions will remain in effect. 
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and TitleTesterPro v6 
                regarding the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:support@titletesterpro.com" className="text-primary-600 hover:text-primary-700 underline">support@titletesterpro.com</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Business Name:</strong> TitleTesterPro v6
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> Florida, United States
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">15. Acknowledgment</h2>
              <p className="text-gray-700 mb-4">
                By using TitleTesterPro v6, you acknowledge that you have read, understood, and agree to be bound by these 
                Terms & Conditions. If you are using the Service on behalf of an organization, you represent and warrant 
                that you have the authority to bind that organization to these Terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-primary-600 text-sm font-medium">
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