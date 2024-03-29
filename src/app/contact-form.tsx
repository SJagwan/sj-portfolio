"use client";

import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";

export function ContactForm({ userInfo }: { userInfo: any }) {
  const handleClick = () => {
    const subject = "Inquiry from your website";
    const recipientEmail = userInfo?.email;
    window.location.href = `mailto:${recipientEmail}?subject=${subject}`;
  };
  return (
    <section className="px-8 py-8" id="contact">
      <Card
        shadow={false}
        className="container mx-auto border-t border-gray-200 pt-12"
        placeholder={undefined}
      >
        <CardBody
          className="flex flex-col items-center justify-center md:gap-10 p-0"
          placeholder={undefined}
        >
          <div className="container mx-auto mb-10 text-center">
            <Typography
              variant="h1"
              color="blue-gray"
              className="mb-4"
              placeholder={undefined}
            >
              Contact Us
            </Typography>
            <Typography
              variant="lead"
              className="mx-auto w-full !text-gray-500"
              placeholder={undefined}
            >
              Ready to get started? Feel free to reach out through the contact
              form, and let&apos;s embark on a journey of innovation and
              success.
            </Typography>
          </div>
          <div className="w-full col-span-3 rounded-lg h-full py-8 p-4 md:p-8 bg-gray-900 sm:w-3/5 ">
            <Typography
              variant="h4"
              color="white"
              className="mb-2"
              placeholder={undefined}
            >
              Contact Information
            </Typography>
            <Typography
              variant="lead"
              className="mx-auto mb-8 text-base !text-gray-500"
              placeholder={undefined}
            >
              Ready to get started? Click the button below to open your email
              client and send us a message.
            </Typography>
            <div className="flex gap-2 md:gap-5">
              <PhoneIcon className="h-5 w-5 text-white" />
              <Typography variant="h6" color="white" placeholder={undefined}>
                +91 {userInfo?.phoneNumber}
              </Typography>
            </div>
            <div className="flex my-2 gap-2 md:gap-5">
              <EnvelopeIcon className="h-5 w-5 text-white" />
              <Typography variant="h6" color="white" placeholder={undefined}>
                {userInfo?.email}
              </Typography>
            </div>
            <div className="flex items-center gap-5 my-2">
              <a
                href={userInfo?.githubUrl}
                target="_blank"
                className="font-medium transition-colors w-max text-white hover:text-blue-500 underline"
              >
                GitHub
              </a>
              <a
                href={userInfo?.linkedInUrl}
                target="_blank"
                className="font-medium transition-colors text-white hover:text-blue-500 underline"
              >
                LinkedIn
              </a>
            </div>
            <Button
              className="w-full md:w-fit mt-5"
              color="white"
              size="md"
              placeholder={undefined}
              onClick={handleClick}
            >
              Send message
            </Button>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}

export default ContactForm;
