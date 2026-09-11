/**
 * Type augmentations for @washingtonpost/wpds-ui-kit
 *
 * Several WPDS component interfaces were authored before React 18 removed
 * the implicit `children` prop from component types. This declaration file
 * patches those interfaces so TypeScript accepts `children` on compound
 * sub-components that need it at runtime.
 */

import "@washingtonpost/wpds-ui-kit";

declare module "@washingtonpost/wpds-ui-kit" {
  /* Accordion */
  interface AccordionItemInterface {
    children?: React.ReactNode;
    value?: string;
  }
  interface AccordionContentInterface {
    children?: React.ReactNode;
  }

  /* Tooltip */
  interface TooltipTriggerInterface {
    children?: React.ReactNode;
    asChild?: boolean;
  }
  interface TooltipContentInterface {
    children?: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    density?: "default" | "compact";
    disabled?: boolean;
  }

  /* AlertBanner */
  interface AlertBannerTriggerInterface {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }

  /* Checkbox */
  interface CheckboxInterface {
    variant?: "primary" | "secondary" | "cta";
  }
}
