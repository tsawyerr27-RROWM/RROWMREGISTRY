import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact | RROWM Registry",
  description:
    "Contact RROWM for general enquiries, partnerships, institutional matters, and privacy or data rights requests.",
};

export default function ContactPage() {
  return (
    <div className="ds-page-environment min-h-screen pt-24 pb-28 text-neutral-900 md:pt-32 md:pb-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ContactPageContent />
      </div>
    </div>
  );
}
