import { Link } from "react-router";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { SignupForm } from "@/features/auth/components/SignupForm";

export function SignupPage() {
  return (
    <AuthLayout
      hand="hello, traveller"
      title="Make your free account"
      tagline="and start sketching your next trip in minutes."
      footer={
        <>
          Already have one?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in →
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
