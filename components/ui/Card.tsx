export function Card({
  title,
  description,
  children,
  actions,
  className = "",
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-green-100 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between border-b border-green-50 px-6 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-green-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
