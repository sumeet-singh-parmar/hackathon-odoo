import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Width = "sm" | "md" | "lg" | "xl";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: Width;
}

const widths: Record<Width, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({ width = "lg", className, ...rest }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[width], className)} {...rest} />;
}
