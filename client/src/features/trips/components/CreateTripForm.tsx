import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { MapPin, FileText, Wallet, PlaneTakeoff } from "lucide-react";
import { CreateTripSchema, type CreateTripInput } from "@hackathon/shared";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Select } from "@/components/forms/Select";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { TripCoverPicker } from "@/components/forms/TripCoverPicker";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useToast } from "@/components/feedback/Toast";
import { useCreateTrip } from "@/features/trips/hooks/useTrips";

const currencyOptions = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — Pound" },
  { value: "INR", label: "INR — Rupee" },
  { value: "JPY", label: "JPY — Yen" },
];

const visibilityOptions = [
  { value: "PRIVATE", label: "Private — only me" },
  { value: "PUBLIC", label: "Public — anyone with the link" },
];

interface CreateTripFormProps {
  defaults?: Partial<CreateTripInput>;
}

export function CreateTripForm({ defaults }: CreateTripFormProps = {}) {
  const navigate = useNavigate();
  const { push } = useToast();
  const create = useCreateTrip();
  const [serverError, setServerError] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTripInput>({
    resolver: zodResolver(CreateTripSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      currency: "USD",
      visibility: "PRIVATE",
      ...defaults,
    },
  });

  async function onSubmit(values: CreateTripInput) {
    setServerError(null);
    try {
      const trip = await create.mutateAsync({
        input: {
          ...values,
          budget: values.budget ? Number(values.budget) : undefined,
          // if no new file picked, fall back to the suggestion's cover url
          coverUrl: cover ? undefined : (defaults?.coverUrl ?? values.coverUrl ?? undefined),
        },
        cover,
      });
      push({ variant: "success", title: "Trip created", message: trip.name });
      navigate(`/trips/${trip.id}`, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not create trip");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <TripCoverPicker
        label="Cover photo"
        value={cover}
        onChange={setCover}
        initialUrl={defaults?.coverUrl ?? null}
        hint="Optional — set the vibe with a photo from the road."
      />

      <Input
        label="Trip name"
        placeholder="Cherry blossom in Japan"
        leadingIcon={<MapPin className="h-5 w-5" />}
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <DateRangePicker
        label="When are you going?"
        required
        startError={errors.startDate?.message}
        endError={errors.endDate?.message}
        startProps={register("startDate")}
        endProps={register("endDate")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Budget"
          type="number"
          inputMode="numeric"
          placeholder="3000"
          leadingIcon={<Wallet className="h-5 w-5" />}
          error={errors.budget?.message}
          {...register("budget", { valueAsNumber: true })}
        />
        <Select
          label="Currency"
          options={currencyOptions}
          error={errors.currency?.message}
          {...register("currency")}
        />
      </div>

      <Select
        label="Visibility"
        options={visibilityOptions}
        error={errors.visibility?.message}
        {...register("visibility")}
      />

      <Textarea
        label="A line about it"
        placeholder="Two weeks weaving through Tokyo, Kyoto, and Osaka…"
        leadingIcon={<FileText className="h-5 w-5" />}
        rows={3}
        hint="Optional — you can edit this later."
        error={errors.description?.message}
        {...register("description")}
      />

      {serverError && <ErrorBanner title="Couldn't create trip" message={serverError} />}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          trailingIcon={<PlaneTakeoff className="h-5 w-5" strokeWidth={2.25} />}
        >
          Start the trip
        </Button>
      </div>
    </form>
  );
}
