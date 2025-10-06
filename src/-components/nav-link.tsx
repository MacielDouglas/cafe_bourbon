import { createLink, type LinkComponent } from "@tanstack/react-router";
import type React from "react";
import { cn } from "../lib/utils";

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref: React.Ref<HTMLAnchorElement>;
};

const BasicLinkComponent = ({ className, ref, ...props }: BasicLinkProps) => {
  return (
    <a
      ref={ref}
      {...props}
      className={cn("text-red-500 font-mediu", className)}
    />
  );
};

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const NavLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return (
    <CreatedLinkComponent
      activeProps={{ className: "text-blue-500 font-bold" }}
      {...props}
    />
  );
};
