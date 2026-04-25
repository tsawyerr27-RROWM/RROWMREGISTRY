"use client";

import { useState } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "Search..."
}: {
  onSearch: (value: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="relative w-full max-w-md">
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl focus:outline-none focus:border-white/30 transition"
      />
    </div>
  );
}
