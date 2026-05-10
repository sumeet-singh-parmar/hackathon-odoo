import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck, Send } from "lucide-react";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@hackathon/shared";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/forms/Input";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import * as authApi from "@/features/auth/api/auth";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setServerError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSentTo(values.email);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not send reset link");
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-3xl border-2 border-success/30 bg-success/5 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
            <MailCheck className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-text">Check your inbox</p>
            <p className="mt-1 text-sm text-muted">
              If an account exists for <span className="font-semibold text-text">{sentTo}</span>,
              a reset link is on its way. The link expires in an hour.
            </p>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="mt-3 text-sm font-semibold text-accent hover:underline"
            >
              Send to a different email →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@somewhere.com"
        leadingIcon={<Mail className="h-5 w-5" />}
        required
        error={errors.email?.message}
        {...register("email")}
      />

      {serverError && <ErrorBanner title="Something went wrong" message={serverError} />}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isSubmitting}
        trailingIcon={<Send className="h-5 w-5" strokeWidth={2.25} />}
      >
        Send reset link
      </Button>
    </form>
  );
}
