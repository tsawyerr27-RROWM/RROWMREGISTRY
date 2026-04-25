"use client";

export default function OwnershipTimeline() {
  const events = [
    { year: "2024", label: "Artwork Created" },
    { year: "2025", label: "Registered on RROWM" },
    { year: "2025", label: "Certificate recorded" },
    { year: "Future", label: "Ownership Transfer" },
  ];

  return (
    <div className="relative border-l border-white/20 pl-12 space-y-16">
      {events.map((event, index) => (
        <div key={index} className="relative">
          <div className="absolute -left-3 top-2 w-4 h-4 bg-white rounded-full" />
          <p className="text-sm text-white/40">{event.year}</p>
          <h4 className="text-xl font-medium">{event.label}</h4>
        </div>
      ))}
    </div>
  );
}
