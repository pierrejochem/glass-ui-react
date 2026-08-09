import * as React from 'react';
import { accentStyle, cx, useControllableState, type Accent } from '../lib/utils';

type BaseProps = {
  label: React.ReactNode;
  /** Secondary text on the far side of the row. */
  hint?: React.ReactNode;
  accent?: Accent;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  value?: string;
};

/** A native checkbox in a glass track. Keyboard and form behaviour come for free. */
export const Switch = React.forwardRef<HTMLInputElement, BaseProps>(function Switch(
  { label, hint, accent, checked, defaultChecked = false, onCheckedChange, disabled, className, ...rest },
  ref,
) {
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  return (
    <label className={cx('ctl', className)} style={accentStyle(accent)}>
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        role="switch"
        checked={on}
        disabled={disabled}
        onChange={(event) => setOn(event.target.checked)}
      />
      <span className="lbl">{label}</span>
      {hint ? <span className="sub">{hint}</span> : null}
      <span className="sw" aria-hidden="true" />
    </label>
  );
});

const Tick = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export interface CheckboxProps extends BaseProps {
  /** Neither on nor off — the parent of a partly-ticked group. */
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    hint,
    accent,
    checked,
    defaultChecked = false,
    onCheckedChange,
    indeterminate = false,
    disabled,
    className,
    ...rest
  },
  ref,
) {
  const inner = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  React.useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  return (
    <label className={cx('ctl', className)} style={accentStyle(accent)}>
      <input
        {...rest}
        ref={inner}
        type="checkbox"
        checked={on}
        disabled={disabled}
        onChange={(event) => setOn(event.target.checked)}
      />
      <span className="box" aria-hidden="true">
        <Tick />
      </span>
      <span className="lbl">{label}</span>
      {hint ? <span className="sub">{hint}</span> : null}
    </label>
  );
});

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  accent?: Accent;
  'aria-label': string;
  className?: string;
}

export function RadioGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  accent,
  className,
  ...rest
}: RadioGroupProps) {
  const auto = React.useId();
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? options[0]?.value ?? '',
    onChange: onValueChange,
  });

  return (
    <div className={cx('opts', className)} role="radiogroup" {...rest}>
      {options.map((option) => (
        <label className="ctl" key={option.value} style={accentStyle(accent)}>
          <input
            type="radio"
            name={name ?? auto}
            value={option.value}
            checked={selected === option.value}
            disabled={option.disabled}
            onChange={() => setSelected(option.value)}
          />
          <span className="dot" aria-hidden="true" />
          <span className="lbl">{option.label}</span>
          {option.hint ? <span className="sub">{option.hint}</span> : null}
        </label>
      ))}
    </div>
  );
}
