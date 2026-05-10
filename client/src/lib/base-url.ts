// fall back to the host the page was loaded from so iPad / phone hits the same machine
export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:4000`;
