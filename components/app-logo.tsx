import { APP_LOGO_ALT, APP_LOGO_SRC } from "@/lib/branding";

type AppLogoSize = "sm" | "md" | "lg";

type AppLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  size?: AppLogoSize;
};

const LOGO_SIZES: Record<
  AppLogoSize,
  { className: string; width: number; height: number }
> = {
  sm: { className: "h-8 w-auto", width: 45, height: 32 },
  md: { className: "h-11 w-auto", width: 62, height: 44 },
  lg: { className: "h-14 w-auto", width: 79, height: 56 },
};

export function AppLogo({
  className,
  width,
  height,
  size = "md",
}: AppLogoProps) {
  const preset = LOGO_SIZES[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG brand mark scales cleanly via img.
    <img
      src={APP_LOGO_SRC}
      alt={APP_LOGO_ALT}
      width={width ?? preset.width}
      height={height ?? preset.height}
      className={className ?? preset.className}
    />
  );
}
