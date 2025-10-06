import { Outlet, createRootRoute } from "@tanstack/react-router";
import Header from "../-components/home/Header";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}
