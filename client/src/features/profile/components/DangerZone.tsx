import { useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Trash2 } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Button } from "@/components/primitives/Button";
import { Modal } from "@/components/feedback/Modal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/feedback/Toast";
import * as profileApi from "@/features/profile/api/profile";

export function DangerZone() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await profileApi.deleteAccount();
      push({ variant: "success", title: "Account deleted" });
      await logout();
      navigate("/signup", { replace: true });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't delete",
        message: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <Card className="border-danger/30 bg-danger/5 p-5">
      <p className="font-display text-lg font-bold text-danger">Danger zone</p>
      <p className="text-sm text-muted">Sign out everywhere or delete the account permanently.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          leadingIcon={<LogOut className="h-4 w-4" />}
        >
          Sign out
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirming(true)}
          leadingIcon={<Trash2 className="h-4 w-4" />}
        >
          Delete account
        </Button>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete your account?"
        description="This is permanent. Trips, notes, and packing lists will be gone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={busy}>
              Yes, delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-text">
          You can always sign up again later, but the data goes with the account.
        </p>
      </Modal>
    </Card>
  );
}
