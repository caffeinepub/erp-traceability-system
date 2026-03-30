import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import LabelHistoryPage from "./pages/LabelHistoryPage";
import LoginPage from "./pages/LoginPage";
import MaterialEntryPage from "./pages/MaterialEntryPage";
import PrintPage from "./pages/PrintPage";
import MaterialMasterPage from "./pages/admin/MaterialMasterPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: DashboardPage,
});

const adminMaterialsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin/materials",
  component: MaterialMasterPage,
});

const entryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/entry",
  component: MaterialEntryPage,
});

const printRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/print",
  component: PrintPage,
});

const historyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/history",
  component: LabelHistoryPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute,
    adminMaterialsRoute,
    entryRoute,
    historyRoute,
  ]),
  printRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
