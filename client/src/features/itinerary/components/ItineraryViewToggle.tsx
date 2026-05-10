import { CalendarDays, List } from "lucide-react";
import { Tabs } from "@/components/navigation/Tabs";

export type ItineraryView = "list" | "calendar";

interface Props {
  value: ItineraryView;
  onChange: (v: ItineraryView) => void;
}

export function ItineraryViewToggle({ value, onChange }: Props) {
  return (
    <Tabs<ItineraryView>
      value={value}
      onChange={onChange}
      items={[
        { value: "list", label: "List", icon: <List className="h-4 w-4" /> },
        { value: "calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" /> },
      ]}
    />
  );
}
