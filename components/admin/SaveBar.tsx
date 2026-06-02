import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function SaveBar({
  saving,
  message,
  onSave,
  canSave = true,
}: {
  saving: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onSave: () => void;
  canSave?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-8 border-t border-green-100 bg-white/95 px-6 py-4 backdrop-blur">
      {message && (
        <div className="mb-3">
          <Alert type={message.type === "success" ? "success" : "error"}>{message.text}</Alert>
        </div>
      )}
      <Button onClick={onSave} disabled={saving || !canSave}>
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
