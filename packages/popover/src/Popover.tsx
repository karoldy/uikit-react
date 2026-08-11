import { usePopover } from './use-popover';
import type { PopoverProps } from './types';
import { PopoverRoot } from './PopoverRoot';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';
import { PopoverClose } from './PopoverClose';

function PopoverComponent({ children, ...options }: PopoverProps) {
  return <>{children(usePopover(options))}</>;
}

// Attach compound components as static properties
PopoverComponent.Root = PopoverRoot;
PopoverComponent.Trigger = PopoverTrigger;
PopoverComponent.Content = PopoverContent;
PopoverComponent.Close = PopoverClose;

export { PopoverComponent as Popover };
export { PopoverRoot } from './PopoverRoot';
export { PopoverTrigger } from './PopoverTrigger';
export { PopoverContent } from './PopoverContent';
export { PopoverClose } from './PopoverClose';
