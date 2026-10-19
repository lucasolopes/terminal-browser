import { shell } from "electron";
import type { ReactNode } from "react";

import { Box, Text } from "./components";
import { setPointerShape } from "./index";
import type { ClickEvent } from "./reconciler-config";
import type { Style } from "./styles";

export interface LinkProps {
  href: string;
  children: ReactNode;
  style?: Style;
  onClick?(event: ClickEvent): void;
}

export function Link({ href, children, style, onClick }: LinkProps) {
  const plain = typeof children === "string" || typeof children === "number";
  return (
    <Box
      style={plain ? undefined : style}
      onClick={(event) => (onClick ? onClick(event) : void shell.openExternal(href))}
      onMouseEnter={() => setPointerShape("pointer")}
      onMouseLeave={() => setPointerShape("default")}
    >
      {plain ? <Text style={{ selectable: false, ...style }}>{children}</Text> : children}
    </Box>
  );
}
