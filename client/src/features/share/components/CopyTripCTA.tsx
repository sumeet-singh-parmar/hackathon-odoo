import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Copy, PlaneTakeoff } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Button } from "@/components/primitives/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/feedback/Toast";
import { copySharedTrip } from "@/features/share/api/share";

interface CopyTripCTAProps {
  shareToken?: string | null;
}

export function CopyTripCTA({ shareToken }: CopyTripCTAProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleCopy() {
    if (!shareToken) return;
    setBusy(true);
    try {
      const trip = await copySharedTrip(shareToken);
      push({
        variant: "success",
        title: "Copied to your trips",
        message: `Find it as "${trip.name}".`,
      });
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't copy",
        message: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary/8 to-accent/10 p-6 text-center">
      <p className="font-hand text-2xl text-primary">like the look of this?</p>
      <p className="mt-1 font-display text-2xl font-bold text-text">Plan your own version</p>
      <p className="mt-2 text-sm text-muted">
        {user
          ? "Copy this trip into your account — tweak everything from there."
          : "Sign up free and copy this trip into your account."}
      </p>
      <div className="mt-4 flex justify-center">
        {user ? (
          <Button
            onClick={handleCopy}
            disabled={!shareToken}
            loading={busy}
            leadingIcon={<Copy className="h-4 w-4" strokeWidth={2.25} />}
          >
            Copy to my trips
          </Button>
        ) : (
          <Link
            to="/signup"
            className="inline-flex h-12 items-center gap-2.5 rounded-2xl bg-primary px-6 font-display font-semibold text-primary-fg shadow-[0_4px_0_0_rgb(199_72_52)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgb(199_72_52)] active:translate-y-1 active:shadow-[0_1px_0_0_rgb(199_72_52)]"
          >
            Make a free account
            <PlaneTakeoff className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        )}
      </div>
    </Card>
  );
}
