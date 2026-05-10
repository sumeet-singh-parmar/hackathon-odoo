import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/forms/Input";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import * as authApi from "@/features/auth/api/auth";

const FormSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
type FormValues = z.infer<typeof FormSchema>;

export function ResetPasswordForm() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  if (!token) {
    return (
      <div className="rounded-3xl border-2 border-danger/30 bg-danger/5 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger">
            <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-text">Reset link is broken</p>
            <p className="mt-1 text-sm text-muted">
              The link is missing its token. Request a new one to continue.
            </p>
            <Link
              to="/forgot-password"
              className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
            >
              Request a new link →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await authApi.resetPassword(token!, values.newPassword);
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not reset password");
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border-2 border-success/30 bg-success/5 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-text">Password updated</p>
            <p className="mt-1 text-sm text-muted">
              You can sign in with your new password now.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block rounded-2xl bg-primary px-5 py-2.5 font-display text-base font-semibold text-primary-fg shadow-[0_4px_0_0_rgb(199_72_52)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgb(199_72_52)] active:translate-y-1 active:shadow-[0_1px_0_0_rgb(199_72_52)] transition-all"
            >
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="at least 8 characters"
        leadingIcon={<Lock className="h-5 w-5" />}
        required
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />

      {serverError && <ErrorBanner title="Couldn't reset password" message={serverError} />}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isSubmitting}
        trailingIcon={<ShieldCheck className="h-5 w-5" strokeWidth={2.25} />}
      >
        Update my password
      </Button>
    </form>
  );
}
