import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router";
import { Mail, Lock, PlaneTakeoff } from "lucide-react";
import { LoginSchema, type LoginInput } from "@hackathon/shared";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/forms/Input";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      await login(values);
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not sign in");
    }
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

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="at least 8 characters"
        leadingIcon={<Lock className="h-5 w-5" />}
        required
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex justify-end -mt-1">
        <button
          type="button"
          className="text-sm font-semibold text-accent hover:underline"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </button>
      </div>

      {serverError && <ErrorBanner title="Couldn't sign in" message={serverError} />}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isSubmitting}
        trailingIcon={<PlaneTakeoff className="h-5 w-5" strokeWidth={2.25} />}
      >
        Take me in
      </Button>
    </form>
  );
}
