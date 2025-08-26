export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600">
              TitleTesterPro collects information necessary to provide YouTube title testing services:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600">
              <li>Google account information (email, name) for authentication</li>
              <li>YouTube channel data and video metadata for title testing</li>
              <li>Performance analytics to optimize your titles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600">
              We use your information solely to:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600">
              <li>Authenticate your account</li>
              <li>Access your YouTube videos for title testing</li>
              <li>Provide analytics and insights</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
            <p className="text-gray-600">
              We implement industry-standard security measures to protect your data. 
              We use Firebase Authentication for secure login and do not store passwords.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="text-gray-600">
              We use the following third-party services:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600">
              <li>Google Firebase for authentication</li>
              <li>YouTube Data API for video management</li>
              <li>Vercel for hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-600">
              You have the right to:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600">
              <li>Access your personal data</li>
              <li>Request data deletion</li>
              <li>Revoke YouTube access at any time</li>
              <li>Opt-out of our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="text-gray-600">
              For privacy concerns or questions, contact us at:
              <br />
              Email: privacy@titletesterpro.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Updates</h2>
            <p className="text-gray-600">
              This privacy policy was last updated on August 26, 2025. 
              We may update this policy periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}