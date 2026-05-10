import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export function ResetPasswordPage() {
  return (
    <AuthLayout
      hand="almost done"
      title="Pick a new password"
      tagline="make it something you'll actually remember."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
