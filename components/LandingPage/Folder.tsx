type FolderProps = {
  label: string;
  showText: boolean;
};

export default function Folder({ label, showText }: FolderProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-64 h-48 rounded-lg shadow-2xl overflow-hidden border-2 border-white/30"
        style={{
          background:
            "linear-gradient(135deg, rgba(192,192,192,0.15), rgba(220,220,220,0.2), rgba(200,200,200,0.15))",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="absolute inset-6 flex flex-col gap-3 mt-4">
          <div className="h-2 bg-white/20 rounded w-3/4" />
          <div className="h-2 bg-white/20 rounded w-full" />
          <div className="h-2 bg-white/20 rounded w-5/6" />
          <div className="h-2 bg-white/20 rounded w-2/3" />
        </div>

        <div className="absolute bottom-4 left-6 right-6">
          <p
            className="text-sm font-semibold text-neutral-600 transition-opacity duration-300"
            style={{ opacity: showText ? 1 : 0 }}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}