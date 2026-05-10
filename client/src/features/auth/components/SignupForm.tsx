import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import {
  Mail,
  Lock,
  User,
  AtSign,
  Phone,
  MapPin,
  Globe2,
  PlaneTakeoff,
} from "lucide-react";
import { RegisterSchema, type RegisterInput } from "@hackathon/shared";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { AvatarPicker } from "@/components/forms/AvatarPicker";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function SignupForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== "") formData.append(k, String(v));
      });
      if (avatar) formData.append("avatar", avatar);
      await registerUser(formData);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not create account");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          placeholder="Sumeet"
          autoComplete="given-name"
          leadingIcon={<User className="h-5 w-5" />}
          required
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label="Last name"
          placeholder="Kumar"
          autoComplete="family-name"
          leadingIcon={<User className="h-5 w-5" />}
          required
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <Input
        label="Username"
        placeholder="sumeet_k"
        autoComplete="username"
        leadingIcon={<AtSign className="h-5 w-5" />}
        hint="Lowercase letters, numbers, underscores"
        required
        error={errors.username?.message}
        {...register("username")}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@somewhere.com"
        autoComplete="email"
        leadingIcon={<Mail className="h-5 w-5" />}
        required
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Phone"
        type="tel"
        placeholder="+1 555 0100"
        autoComplete="tel"
        leadingIcon={<Phone className="h-5 w-5" />}
        required
        error={errors.phoneNumber?.message}
        {...register("phoneNumber")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="City"
          placeholder="Bengaluru"
          autoComplete="address-level2"
          leadingIcon={<MapPin className="h-5 w-5" />}
          required
          error={errors.city?.message}
          {...register("city")}
        />
        <Input
          label="Country"
          placeholder="India"
          autoComplete="country-name"
          leadingIcon={<Globe2 className="h-5 w-5" />}
          required
          error={errors.country?.message}
          {...register("country")}
        />
      </div>

      <Input
        label="Password"
        type="password"
        placeholder="at least 8 characters"
        autoComplete="new-password"
        leadingIcon={<Lock className="h-5 w-5" />}
        required
        error={errors.password?.message}
        {...register("password")}
      />

      <AvatarPicker
        label="Profile photo"
        value={avatar}
        onChange={setAvatar}
      />

      <Textarea
        label="A little about you"
        placeholder="Where do you love going? Anything we should know?"
        rows={3}
        hint="Optional"
        error={errors.additionalInfo?.message}
        {...register("additionalInfo")}
      />

      {serverError && <ErrorBanner title="Couldn't sign up" message={serverError} />}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isSubmitting}
        trailingIcon={<PlaneTakeoff className="h-5 w-5" strokeWidth={2.25} />}
      >
        Plan my first trip
      </Button>
    </form>
  );
}
