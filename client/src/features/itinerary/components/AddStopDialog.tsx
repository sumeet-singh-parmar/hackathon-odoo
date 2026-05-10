import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateStopSchema, type CreateStopInput } from "@hackathon/shared";
import { Modal } from "@/components/feedback/Modal";
import { Button } from "@/components/primitives/Button";
import { Select } from "@/components/forms/Select";
import { Textarea } from "@/components/forms/Textarea";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { useCities } from "@/features/cities/hooks/useCities";
import { useAddStop } from "@/features/itinerary/hooks/useItinerary";
import { useToast } from "@/components/feedback/Toast";

interface AddStopDialogProps {
  tripId: number;
  onClose: () => void;
}

export function AddStopDialog({ tripId, onClose }: AddStopDialogProps) {
  const cities = useCities();
  const addStop = useAddStop(tripId);
  const { push } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateStopInput>({
    resolver: zodResolver(CreateStopSchema),
  });

  async function onSubmit(values: CreateStopInput) {
    try {
      await addStop.mutateAsync({
        ...values,
        cityId: Number(values.cityId),
      });
      push({ variant: "success", title: "Stop added" });
      onClose();
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't add stop",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  const cityOptions =
    cities.data?.map((c) => ({ value: String(c.id), label: `${c.name}, ${c.country}` })) ?? [];

  return (
    <Modal open onClose={onClose} title="Add a stop" description="Pick a city and the dates you'll be there.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Select
          label="City"
          placeholder={cities.isLoading ? "Loading…" : "Select a city"}
          options={cityOptions}
          required
          error={errors.cityId?.message}
          {...register("cityId", { setValueAs: (v) => (v ? Number(v) : undefined) })}
        />

        <DateRangePicker
          label="Dates"
          startLabel="Arrival"
          endLabel="Departure"
          required
          startError={errors.startDate?.message}
          endError={errors.endDate?.message}
          startProps={register("startDate")}
          endProps={register("endDate")}
        />

        <Select
          label="How are you getting there?"
          placeholder="Optional"
          options={[
            { value: "FLIGHT", label: "Flight" },
            { value: "TRAIN", label: "Train" },
            { value: "BUS", label: "Bus" },
            { value: "CAR", label: "Car / drive" },
            { value: "OTHER", label: "Other" },
          ]}
          error={errors.transport?.message}
          {...register("transport")}
        />

        <Textarea
          label="Notes"
          placeholder="Hotel name, arrival tips, anything to remember"
          rows={2}
          hint="Optional"
          error={errors.notes?.message}
          {...register("notes")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Add stop
          </Button>
        </div>
      </form>
    </Modal>
  );
}
