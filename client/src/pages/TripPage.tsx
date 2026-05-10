import { useParams } from "react-router";

export function TripPage() {
  const { id } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Trip {id}</h1>
    </div>
  );
}
