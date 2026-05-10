import { useState } from "react";
import { Check, Copy, Globe, Lock, Share2 } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { Button } from "@/components/primitives/Button";
import { useShareTrip, useUnshareTrip } from "@/features/trips/hooks/useTrips";
import { useToast } from "@/components/feedback/Toast";

interface TripShareCardProps {
  trip: Trip;
}

// `navigator.clipboard` is gated on a secure context, so it's undefined when
// the dev server is reached over a LAN IP (e.g. testing from another device).
// Fall back to the legacy textarea + execCommand("copy") path for that case.
async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.pointerEvents = "none";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function TripShareCard({ trip }: TripShareCardProps) {
  const share = useShareTrip(trip.id);
  const unshare = useUnshareTrip(trip.id);
  const { push } = useToast();
  const [justCopied, setJustCopied] = useState(false);

  const isPublic = trip.visibility === "PUBLIC" && !!trip.shareToken;
  const shareUrl = trip.shareToken
    ? `${window.location.origin}/share/${trip.shareToken}`
    : null;

  async function handleMakePublic() {
    try {
      await share.mutateAsync();
      push({
        variant: "success",
        title: "Trip is now public",
        message: "Hit Copy link to share it.",
      });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't share",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  async function handleMakePrivate() {
    if (!confirm("Make this trip private? The share link will stop working.")) return;
    try {
      await unshare.mutateAsync();
      push({ variant: "info", title: "Trip is now private" });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't make private",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  async function handleCopy(url: string) {
    const ok = await copyText(url);
    if (ok) {
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1800);
      push({ variant: "success", title: "Link copied", message: url });
    } else {
      push({
        variant: "danger",
        title: "Couldn't copy",
        message: "Tap the link, select all, and press ⌘/Ctrl+C.",
      });
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
            isPublic ? "bg-success/15 text-success" : "bg-bg text-muted"
          }`}
        >
          {isPublic ? (
            <Globe className="h-5 w-5" strokeWidth={2.25} />
          ) : (
            <Lock className="h-5 w-5" strokeWidth={2.25} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-text">
            {isPublic ? "This trip is public" : "This trip is private"}
          </p>
          <p className="text-sm text-muted">
            {isPublic
              ? "Anyone with the link below can view your itinerary, budget, and notes."
              : "Only you can see this trip. Share it to let others view a read-only copy."}
          </p>
        </div>

        <div className="flex w-full flex-shrink-0 sm:w-auto">
          {isPublic ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMakePrivate}
              loading={unshare.isPending}
              leadingIcon={<Lock className="h-4 w-4" strokeWidth={2.25} />}
            >
              Make private
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleMakePublic}
              loading={share.isPending}
              leadingIcon={<Share2 className="h-4 w-4" strokeWidth={2.25} />}
            >
              Make public
            </Button>
          )}
        </div>
      </div>

      {isPublic && shareUrl && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border-2 border-dashed border-border bg-bg/40 px-3 py-2">
            <Share2 className="h-4 w-4 flex-shrink-0 text-muted" strokeWidth={2.25} />
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 truncate bg-transparent text-sm text-text focus:outline-none"
              aria-label="Public share link"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCopy(shareUrl)}
            leadingIcon={
              justCopied ? (
                <Check className="h-4 w-4 text-success" strokeWidth={2.5} />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={2.25} />
              )
            }
          >
            {justCopied ? "Copied" : "Copy link"}
          </Button>
        </div>
      )}
    </Card>
  );
}
