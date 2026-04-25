type PageHeaderProps = {
  title?: string;
  description?: string;
  className?: string;
  variant?: "light" | "dark";
};

export default function PageHeader({
  title,
  description,
  className = "",
  variant = "light",
}: PageHeaderProps) {
  const isDark = variant === "dark";

  return (
    <div className={`mb-16 max-w-3xl ${className}`}>
      {title && (
        <h2
          className={`text-4xl md:text-5xl font-semibold leading-tight mb-6 ${
            isDark ? "text-white" : ""
          }`}
        >
          {title}
        </h2>
      )}

      {description && (
        <p
          className={`text-lg leading-relaxed ${
            isDark ? "text-white/60" : "text-neutral-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
