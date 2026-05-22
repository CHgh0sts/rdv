import { Suspense } from "react";
import AdminPage from "./AdminPage";

export default function AdminRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 py-16 text-center text-muted">
          Chargement du tableau de bord…
        </div>
      }
    >
      <AdminPage />
    </Suspense>
  );
}
