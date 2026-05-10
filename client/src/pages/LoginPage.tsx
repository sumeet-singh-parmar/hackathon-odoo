import { Link } from "react-router";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout
      hand="welcome back"
      title="Pick up where you left off"
      tagline="sign in and finish planning the next one."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Make an account →
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
