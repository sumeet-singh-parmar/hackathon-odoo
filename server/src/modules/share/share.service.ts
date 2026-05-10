// Share module — wraps the share/unshare/public-by-slug/copy methods on the trip service.
// Kept as a thin re-export so routing stays separated from the trip CRUD module.
export {
  share,
  unshare,
  getPublicBySlug,
  copyFromSlug,
} from "@/modules/trips/trip/trip.service";
