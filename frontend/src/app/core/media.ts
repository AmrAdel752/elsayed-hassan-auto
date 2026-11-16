import { environment } from '../../environments/environment';

/** Full address of an uploaded image: "/uploads/2026/11/x.webp" lives on the API host; absolute URLs pass through. */
export const imgUrl = (path?: string | null) =>
  !path ? '' : path.startsWith('/uploads/') ? environment.apiUrl + path : path;
