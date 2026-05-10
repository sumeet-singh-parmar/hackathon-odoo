import { useParams } from "react-router";

export function PublicTripPage() {
  const { token } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Shared trip</h1>
      <p className="text-muted">Token: {token}</p>
    </div>
  );
}
