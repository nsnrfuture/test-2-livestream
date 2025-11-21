"use client";

import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useState } from "react";

const COMPANY_NAME = "NSNR23 Future Technology PVT LTD";
const PRODUCT_NAME = "TEGO.Live";
const WHATSAPP_NUMBER_DISPLAY = "8826613509";
const WHATSAPP_NUMBER_FULL = "918826613509"; // India code

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleWhatsAppSubmit(e: any) {
    e.preventDefault();

    const text = `New Contact Message for TEGO.Live%0A%0AName: ${name}%0AEmail: ${email}%0AMessage: ${message}%0A%0A(sent from Contact Page)`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER_FULL}?text=${text}`;

    window.open(whatsappUrl, "_blank");
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white px-4 sm:px-6 md:px-10 py-10">

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-[#8B3DFF33] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#22C55E33] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-3 flex items-center gap-2">
            <span className="inline-block h-1 w-6 rounded-full bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E]" />
            Contact Us
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Get in Touch with{" "}
            <span className="bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] bg-clip-text text-transparent">
              {PRODUCT_NAME}
            </span>
          </h1>

          <p className="mt-3 text-white/70 text-sm sm:text-base max-w-2xl">
            We're here to help you! For business enquiries, technical support, or billing issues — reach out anytime.
          </p>
        </header>

        {/* Contact Grid */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">

          {/* LEFT DETAILS */}
          <div className="space-y-6">

            {/* Phone */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-5 w-5 text-[#22C55E]" />
                <h2 className="text-lg font-semibold">Phone Support</h2>
              </div>

              <p className="text-white/70 text-sm">
                Available: <span className="text-white">10AM - 7PM IST</span>.
              </p>

              <div className="mt-3">
                <p className="text-sm">📞 8130096171</p>
                <p className="text-sm">📞 {WHATSAPP_NUMBER_DISPLAY} (WhatsApp)</p>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER_FULL}`}
                target="_blank"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#22C55E] px-4 py-2 text-sm font-semibold text-black shadow hover:bg-[#4ADE80] transition"
              >
                💬 Chat on WhatsApp
              </a>
            </div>

            {/* Email */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-[#8B3DFF]" />
                <h2 className="text-lg font-semibold">Email</h2>
              </div>
              <p className="text-sm text-white/70">For billing, support or partnership:</p>
              <p className="mt-2 text-sm font-medium">📧 support@tego.live</p>
            </div>

            {/* Address */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-[#4F46E5]" />
                <h2 className="text-lg font-semibold">Registered Office</h2>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                {COMPANY_NAME}
                <br />
                Noida, Uttar Pradesh, India
              </p>
            </div>
          </div>

          {/* RIGHT FORM (WHATSAPP SEND) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#22C55E]" />
              Send us a message on WhatsApp
            </h2>

            <form onSubmit={handleWhatsAppSubmit} className="space-y-4">

              <input
                type="text"
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg px-4 py-3 bg-black/30 border border-white/20 text-sm"
              />

              <input
                type="email"
                required
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-4 py-3 bg-black/30 border border-white/20 text-sm"
              />

              <textarea
                required
                placeholder="Your Message..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg px-4 py-3 bg-black/30 border border-white/20 text-sm resize-none"
              ></textarea>

              {/* WHATSAPP SEND BUTTON */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#22C55E] text-black font-semibold shadow-lg hover:scale-[1.02] transition"
              >
                💬 Send via WhatsApp
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
