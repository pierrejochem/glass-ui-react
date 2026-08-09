import * as React from 'react';
import { cx } from '../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  /** Used for the alt text and to derive the fallback initials. */
  name: string;
  status?: 'online' | 'none';
  accentColor?: string;
}

/** Shows the photo when it loads and the initials when it doesn't. */
export function Avatar({ src, name, status = 'none', accentColor, className, ...rest }: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      {...rest}
      className={cx('ava', className)}
      style={accentColor ? ({ ['--accent' as string]: accentColor } as React.CSSProperties) : undefined}
    >
      {src && !failed ? (
        <img src={src} alt={name} onError={() => setFailed(true)} />
      ) : (
        <span aria-label={name}>{initials}</span>
      )}
      {status === 'online' ? <span className="status" aria-label="Online" /> : null}
    </span>
  );
}

export interface AvatarStackProps {
  people: Array<{ name: string; src?: string; accentColor?: string }>;
  /** Anyone past this count collapses into a +N chip. */
  max?: number;
}

export function AvatarStack({ people, max = 3 }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="ava__stack">
      {shown.map((person) => (
        <Avatar key={person.name} {...person} />
      ))}
      {rest > 0 ? <span className="more">+{rest}</span> : null}
    </div>
  );
}

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** e.g. `16/9`, `1/1`, `9/16`. */
  ratio?: string;
}

export function AspectRatio({ ratio = '16/9', className, style, ...rest }: AspectRatioProps) {
  return (
    <div
      {...rest}
      className={cx('ar', className)}
      style={{ ['--ar']: ratio, ...style } as React.CSSProperties}
    />
  );
}
