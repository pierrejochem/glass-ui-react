import * as React from 'react';
import { accentStyle, cx, useControllableState, type Accent } from '../lib/utils';

export interface ModeToggleProps {
  name: React.ReactNode;
  /** Caption under the name. Swaps with `offLabel` depending on state. */
  onLabel?: React.ReactNode;
  offLabel?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: Accent;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  className?: string;
}

/** The signature control: a slab of glass that lights up from the inside. */
export const ModeToggle = React.forwardRef<HTMLButtonElement, ModeToggleProps>(function ModeToggle(
  {
    name,
    onLabel = 'On',
    offLabel = 'Off',
    icon,
    accent = 'sleep',
    pressed,
    defaultPressed = false,
    onPressedChange,
    className,
  },
  ref,
) {
  const [on, setOn] = useControllableState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });
  const [wobble, setWobble] = React.useState(false);

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={on}
      style={accentStyle(accent)}
      className={cx('pill', wobble && 'wob', className)}
      onClick={() => {
        setOn(!on);
        setWobble(false);
        requestAnimationFrame(() => setWobble(true));
      }}
      onAnimationEnd={() => setWobble(false)}
    >
      <span className="bloom" aria-hidden="true" />
      {icon ? <span className="icon">{icon}</span> : null}
      <span className="txt">
        <span className="name">{name}</span>
        <span className="state">{on ? onLabel : offLabel}</span>
      </span>
      <span className="grip" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  );
});

export interface ModeRackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lays the rack flat instead of tilting it back in 3D. */
  flat?: boolean;
}

/** The tilted tray the mode toggles sit on. */
export function ModeRack({ flat = false, className, children, ...rest }: ModeRackProps) {
  return (
    <div className={cx('stage', flat && 'flat', className)} {...rest}>
      <div className="plate">
        <div className="rack">{children}</div>
      </div>
    </div>
  );
}
