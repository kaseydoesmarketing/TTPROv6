import Navigation from '@/components/Navigation'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Effective Date: August 26, 2025
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 lg:p-12 space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">1. Acceptance of Terms</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                By accessing and using TitleTesterPro (&quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">2. Description of Service</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                TitleTesterPro is a YouTube title testing and optimization platform that provides:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>A/B testing capabilities for YouTube video titles</li>
                <li>Analytics and performance insights</li>
                <li>Automated title rotation based on performance metrics</li>
                <li>Integration with YouTube Data API</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">3. User Accounts and Responsibilities</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                To access certain features of the Service, you must register for an account using your Google credentials.
              </p>
              <p>
                You are responsible for:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your YouTube content complies with YouTube&apos;s terms</li>
                <li>Using the service in accordance with applicable laws</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">4. Acceptable Use Policy</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Upload malicious content or code</li>
                <li>Abuse or overload our systems</li>
                <li>Circumvent usage limitations</li>
                <li>Share your account credentials with others</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">5. YouTube API Integration</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Our service integrates with YouTube&apos;s Data API. By using our service, you also agree to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>YouTube&apos;s Terms of Service</li>
                <li>Google&apos;s Privacy Policy</li>
                <li>YouTube API Services Terms of Service</li>
              </ul>
              <p>
                You can revoke our access to your YouTube data at any time through your Google Account settings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">6. Data and Privacy</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                We collect and process data as described in our Privacy Policy. By using the Service, you consent to such processing and you warrant that all data provided by you is accurate.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">7. Service Availability</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                We strive to maintain high service availability but do not guarantee uninterrupted access. We may:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Perform scheduled maintenance</li>
                <li>Update features and functionality</li>
                <li>Experience temporary service disruptions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">8. Limitation of Liability</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                TitleTesterPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">9. Termination</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach the Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">10. Changes to Terms</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">11. Contact Information</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Email: legal@titletesterpro.com</p>
                <p className="font-medium">Address: TitleTesterPro Legal Department</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}