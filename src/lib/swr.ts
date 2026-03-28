import useSWR, { mutate } from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useEmployee(id?: string) {
  return useSWR(id ? `/api/employees/${id}` : null, fetcher);
}

export function useEmployees() {
  return useSWR("/api/employees", fetcher);
}

export function useRequests() {
  return useSWR("/api/requests", fetcher);
}

export function useApprovals() {
  return useSWR("/api/requests?status=pending&role=manager", fetcher);
}

export function useEntitlements(employeeId?: string) {
  return useSWR(
    employeeId ? `/api/entitlements?employee_id=${employeeId}` : "/api/entitlements",
    fetcher
  );
}

export function useSettings() {
  return useSWR("/api/settings", fetcher);
}

export function useTeam() {
  return useSWR("/api/employees?include_entitlements=true", fetcher);
}

export function useAuditLog(page: number = 1) {
  return useSWR(`/api/audit-log?page=${page}`, fetcher);
}

export function useCurrentUser() {
  return useSWR("/api/auth/me", fetcher);
}

export function clearSWRCache() {
  mutate(() => true, undefined, { revalidate: false });
}

export function revalidateAllSWR() {
  mutate(() => true);
}
