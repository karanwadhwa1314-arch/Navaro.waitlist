'use client'

import { useState } from 'react'

export default function Contact() {
  const [activeTab, setActiveTab] = useState<'message' | 'call'>('message')
  const [agreed, setAgreed] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      alert('Please agree to the Terms and Privacy Policy.')
      return
    }
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' })
    setAgreed(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      {/* Hero Section */}
      <div className="bg-[#FDF8F3] py-16 md:py-24 text-center">
        <div className="max-w-[900px] mx-auto px-4">
          <h1
            className="text-3xl md:text-5xl lg:text-[64px] font-bold leading-[1.1] text-[#1E1E1E] mb-5 whitespace-nowrap"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            LET&apos;S NAVIGATE IT TOGETHER
          </h1>
          <p
            className="text-[#054742] text-sm md:text-base leading-relaxed max-w-[480px] mx-auto"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Have a question about Navaro, need help with a tool, or want to collaborate? Our crew is here to help you move forward.
          </p>
        </div>
      </div>

      <div className="max-w-[1334px] mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14 items-start">

          {/* Left Section */}
          <div className="pt-2">
            <h1
              className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight text-[#1E1E1E] mb-4"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              REACH OUT TO US
            </h1>
            <p
              className="text-[#5A5A5A] text-base leading-relaxed mb-10 max-w-[340px]"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              We&apos;re here to help you navigate the complexities of global trade with confidence.
            </p>

            {/* Contact Cards */}
            <div className="space-y-4">
              {/* General Inquiries */}
              <div className="bg-[#EED25A] rounded-2xl p-5 relative overflow-hidden max-w-[320px]">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(circle, #054742 1.2px, transparent 1.2px)', backgroundSize: '10px 10px' }}
                />
                <h3
                  className="text-[#054742] text-lg font-bold mb-1"
                  style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                >
                  General Inquiries
                </h3>
                <a href="mailto:Hello@Navaro.io" className="text-[#054742] text-sm underline flex items-center gap-1">
                  Hello@Navaro.Io
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="#054742" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>

              {/* Technical Support */}
              <div className="bg-[#3FCBBD] rounded-2xl p-5 relative overflow-hidden max-w-[320px]">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(circle, #054742 1.2px, transparent 1.2px)', backgroundSize: '10px 10px' }}
                />
                <h3
                  className="text-[#054742] text-lg font-bold mb-1"
                  style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                >
                  Technical Support
                </h3>
                <a href="mailto:Support@Navaro.io" className="text-[#054742] text-sm underline flex items-center gap-1">
                  Support@Navaro.Io
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="#054742" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>

              {/* Visit Us */}
              <div className="bg-[#C780ED] rounded-2xl p-5 relative overflow-hidden max-w-[320px]">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(circle, #054742 1.2px, transparent 1.2px)', backgroundSize: '10px 10px' }}
                />
                <h3
                  className="text-[#054742] text-lg font-bold mb-1"
                  style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                >
                  Visit Us
                </h3>
                <a href="#" className="text-[#054742] text-sm underline flex items-center gap-1">
                  Navaro Technologies Pvt. Ltd.402, Orion Park
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H3M11 1V9" stroke="#054742" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Section - Contact Form */}
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-[#E5E5E5]">
            <h2
              className="text-2xl md:text-[28px] font-bold text-[#054742] mb-2"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              Contact Form
            </h2>
            <p
              className="text-[#6B6B6B] text-sm md:text-base mb-6"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Fill out the form and our team will get back to you as soon as possible.
            </p>

            {/* Tabs */}
            <div className="flex items-center gap-0 mb-8 border border-[#E5E5E5] rounded-full w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('message')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'message'
                    ? 'bg-[#054742] text-white'
                    : 'text-[#5A5A5A] hover:text-[#1E1E1E]'
                }`}
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Send Message
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('call')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'call'
                    ? 'bg-[#054742] text-white'
                    : 'text-[#5A5A5A] hover:text-[#1E1E1E]'
                }`}
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Book Call
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Full Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm text-[#5A5A5A] mb-2"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-white focus:ring-2 focus:ring-[#054742]/20 focus:border-[#054742] outline-none transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-[#5A5A5A] mb-2"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-white focus:ring-2 focus:ring-[#054742]/20 focus:border-[#054742] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm text-[#5A5A5A] mb-2"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-white focus:ring-2 focus:ring-[#054742]/20 focus:border-[#054742] outline-none transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm text-[#5A5A5A] mb-2"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-white focus:ring-2 focus:ring-[#054742]/20 focus:border-[#054742] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm text-[#5A5A5A] mb-2"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  Write your message here...
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-white focus:ring-2 focus:ring-[#054742]/20 focus:border-[#054742] outline-none transition-all resize-none"
                />
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#E5E5E5] text-[#054742] focus:ring-[#054742]"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-[#5A5A5A]"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  By submitting, you agree to our{' '}
                  <a href="/terms" className="text-[#054742] underline">Terms</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-[#054742] underline">Privacy Policy</a>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#054742] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-[#043a36] transition-colors"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                {activeTab === 'message' ? 'Send Message' : 'Book a Call'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Call To Action Section */}
      <div className="max-w-[1334px] mx-auto px-4 pb-16 md:pb-20">
        <div className="bg-[#054742] rounded-3xl py-16 md:py-20 px-6 text-center relative overflow-hidden">
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10">
            <h2
              className="text-2xl md:text-4xl lg:text-[42px] font-bold text-white leading-tight mb-4 max-w-[600px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              READY TO BUILD YOUR TRADE OPERATION?
            </h2>
            <p
              className="text-white/70 text-sm md:text-base mb-8 max-w-[500px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Move from scattered learning to structured execution with Navaro.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-[#C780ED] text-black text-sm md:text-base font-medium px-6 py-3 rounded-full no-underline hover:opacity-90 transition-opacity"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Explore our Courses
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M3 7L10 10L17 7" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 18V10" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.27503 2.06706L3.82503 4.53373C2.8167 5.09206 1.9917 6.49206 1.9917 7.64206V12.3504C1.9917 13.5004 2.8167 14.9004 3.82503 15.4587L8.27503 17.9337C9.22503 18.4587 10.7834 18.4587 11.7334 17.9337L16.1834 15.4587C17.1917 14.9004 18.0167 13.5004 18.0167 12.3504V7.64206C18.0167 6.49206 17.1917 5.09206 16.1834 4.53373L11.7334 2.05873C10.775 1.53373 9.22503 1.53373 8.27503 2.06706Z" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 border border-white text-white text-sm md:text-base font-medium px-6 py-3 rounded-full no-underline hover:bg-white hover:text-[#054742] transition-colors"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Explore the Platform
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
