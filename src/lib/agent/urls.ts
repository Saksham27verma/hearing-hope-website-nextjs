export function originOf(settingsUrl: string) {
  return settingsUrl.replace(/\/$/, "");
}

export function absoluteUrl(origin: string, path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${originOf(origin)}${normalized}`;
}

export function normalizeAgentPath(pathname: string) {
  let path = pathname.trim() || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.endsWith(".md")) {
    path = path.slice(0, -3) || "/";
    if (path.endsWith("/index")) path = path.slice(0, -6) || "/";
  }
  return path || "/";
}
