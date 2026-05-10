import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, User, Phone, MapPin, Globe2, AtSign } from "lucide-react";
import { UpdateMeSchema, type UpdateMeInput, type AuthUser } from "@hackathon/shared";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Select } from "@/components/forms/Select";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useToast } from "@/components/feedback/Toast";
import { useUpdateProfile } from "@/features/profile/hooks/useProfile";

interface ProfileFormProps {
  user: AuthUser;
}

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
  { value: "hi", label: "हिन्दी" },
];

export function ProfileForm({ user }: ProfileFormProps) {
  const update = useUpdateProfile();
  const { push } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateMeInput>({
    resolver: zodResolver(UpdateMeSchema),
    defaultValues: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      city: user.city,
      country: user.country,
      additionalInfo: user.additionalInfo ?? "",
      language: user.language ?? "en",
    },
  });

  async function onSubmit(values: UpdateMeInput) {
    setServerError(null);
    try {
      await update.mutateAsync(values);
      push({ variant: "success", title: "Profile updated" });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          required
          leadingIcon={<User className="h-5 w-5" />}
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label="Last name"
          required
          leadingIcon={<User className="h-5 w-5" />}
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <Input
        label="Username"
        leadingIcon={<AtSign className="h-5 w-5" />}
        error={errors.username?.message}
        {...register("username")}
      />

      <Input
        label="Phone"
        type="tel"
        leadingIcon={<Phone className="h-5 w-5" />}
        error={errors.phoneNumber?.message}
        {...register("phoneNumber")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="City"
          leadingIcon={<MapPin className="h-5 w-5" />}
          error={errors.city?.message}
          {...register("city")}
        />
        <Input
          label="Country"
          leadingIcon={<Globe2 className="h-5 w-5" />}
          error={errors.country?.message}
          {...register("country")}
        />
      </div>

      <Select
        label="Preferred language"
        options={languageOptions}
        error={errors.language?.message}
        {...register("language")}
      />

      <Textarea
        label="A little about you"
        rows={3}
        error={errors.additionalInfo?.message}
        {...register("additionalInfo")}
      />

      {serverError && <ErrorBanner title="Couldn't save" message={serverError} />}

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
          trailingIcon={<Save className="h-4 w-4" strokeWidth={2.25} />}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
