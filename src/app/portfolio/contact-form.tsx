"use client";

import { Typography, Button } from "@material-tailwind/react";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { ScrollReveal } from "@/components";


export function ContactForm({ userInfo }: { userInfo: any }) {
  const handleClick = () => {
    const subject = "Inquiry from your website";
    const recipientEmail = userInfo?.email || "shubhanshu1997jagwan@gmail.com";
    window.location.href = `mailto:${recipientEmail}?subject=${subject}`;
  };

  return (
    <section className="px-6 py-20 bg-white" id="contact">
      <div className="container mx-auto">
        <ScrollReveal className="mb-16 text-center max-w-2xl mx-auto">
          <Typography
            className="mb-2 text-indigo-600 font-bold uppercase tracking-widest text-sm"
            placeholder={undefined}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h2"
            className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mb-4"
            placeholder={undefined}
          >
            Let&apos;s Work Together
          </Typography>
          <Typography
            variant="lead"
            className="text-slate-500 font-normal leading-relaxed text-base font-sans"
            placeholder={undefined}
          >
            Have a project in mind? I&apos;d love to hear about it. Drop me a
            message and let&apos;s build something great together.
          </Typography>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="w-full max-w-2xl mx-auto rounded-[2rem] bg-slate-900 border border-slate-800 p-8 md:p-12 shadow-xl shadow-slate-900/10 text-white relative overflow-hidden">
            {/* Subtle decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <Typography
                variant="h4"
                className="text-2xl font-bold font-heading mb-4 text-white"
                placeholder={undefined}
              >
                Contact Information
              </Typography>
              <Typography
                className="mb-8 text-slate-400 font-normal leading-relaxed text-base font-sans"
                placeholder={undefined}
              >
                Click the button below to draft a message in your default email client.
              </Typography>

              <div className="flex flex-col gap-4 mb-8">
                {userInfo?.phoneNumber && (
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/50">
                      <PhoneIcon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <Typography className="font-semibold font-sans text-base" placeholder={undefined}>
                      +91 {userInfo.phoneNumber}
                    </Typography>
                  </div>
                )}
                {userInfo?.email && (
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/50">
                      <EnvelopeIcon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <Typography className="font-semibold font-sans text-base" placeholder={undefined}>
                      {userInfo.email}
                    </Typography>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center mb-8 border-t border-slate-800 pt-6">
                {userInfo?.githubUrl && (
                  <a
                    href={userInfo.githubUrl}
                    target="_blank"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/40 hover:border-slate-600 transition-all duration-200"
                  >
                    GitHub
                  </a>
                )}
                {userInfo?.linkedInUrl && (
                  <a
                    href={userInfo.linkedInUrl}
                    target="_blank"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-200 border border-indigo-500/20 hover:border-indigo-500/30 transition-all duration-200"
                  >
                    LinkedIn
                  </a>
                )}
              </div>

              <Button
                className="w-full sm:w-fit bg-white hover:bg-slate-100 text-slate-900 rounded-full capitalize font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 px-8 py-3"
                placeholder={undefined}
                onClick={handleClick}
              >
                Send Message
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ContactForm;

