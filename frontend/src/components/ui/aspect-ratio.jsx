"use client";

import * as AspectRatio from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
