import * as React from 'react';
import { cx } from '../lib/utils';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small caps label along the top edge. Not the HTML `title` attribute. */
  title?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { title, className, children, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={cx('card', className)}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </div>
  );
});

export type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical';
  /** Renders the rule with a word in the middle, e.g. "or". */
  label?: React.ReactNode;
  className?: string;
};

export function Separator({ orientation = 'horizontal', label, className }: SeparatorProps) {
  if (label) {
    return (
      <div className={cx('sep', 'labelled', className)} role="separator" aria-orientation="horizontal">
        {label}
      </div>
    );
  }
  if (orientation === 'vertical') {
    return <span className={cx('sep', 'v', className)} role="separator" aria-orientation="vertical" />;
  }
  return <hr className={cx('sep', className)} />;
}

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** CSS height for the viewport. */
  height?: number | string;
}

export function ScrollArea({ height = 168, className, style, ...rest }: ScrollAreaProps) {
  return <div {...rest} className={cx('scroll', className)} style={{ height, ...style }} />;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Any CSS colour; drives the dot and its glow. */
  color?: string;
}

export function Badge({ color, className, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={cx('badge', className)}>
      {color ? <i style={{ ['--bc' as string]: color } as React.CSSProperties} /> : null}
      {children}
    </span>
  );
}
