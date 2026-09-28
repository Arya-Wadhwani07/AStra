"use client";
import Link from "next/link";
import {
  useId,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { Icon } from "./icons";
import { useApp } from "./app-context";
export {
  Logo,
  Avatar,
  AuroraText,
  OrbitingCircles,
  MediaFrame,
  CreatorSummary,
  PointsBalance,
  StatusBadge,
  Banner,
  Chip,
  ResponseCounter,
  BriefStatus,
  LedgerRow,
} from "./primitives";
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function Button({
  children,
  icon,
  variant = "primary",
  busy,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  variant?: string;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      aria-busy={busy || undefined}
      className={`as-btn as-btn--${variant} as-btn--md ${props.className || ""}`}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
export function Go({
  href,
  children,
  icon = "arrow-right",
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  icon?: string;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`as-btn as-btn--${secondary ? "secondary" : "primary"} as-btn--md`}
    >
      {children}
      <Icon name={icon} />
    </Link>
  );
}
export function Field({
  label,
  helper,
  multiline,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
  multiline?: boolean;
}) {
  const uid = useId();
  return (
    <div className="as-field">
      <label className="as-label" htmlFor={uid}>
        {label}
        {props.required ? " *" : ""}
      </label>
      <div className={`as-control ${multiline ? "as-control--multi" : ""}`}>
        {multiline ? (
          <textarea
            id={uid}
            className="as-input"
            name={props.name}
            defaultValue={props.defaultValue}
            required={props.required}
            placeholder={props.placeholder}
            rows={4}
            maxLength={props.maxLength}
            aria-describedby={helper ? uid + "-help" : undefined}
          />
        ) : (
          <input
            {...props}
            id={uid}
            className="as-input"
            aria-describedby={helper ? uid + "-help" : undefined}
          />
        )}
      </div>
      {helper && (
        <p id={uid + "-help"} className="as-caption">
          {helper}
        </p>
      )}
    </div>
  );
}
export function SelectField({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const uid = useId();
  return (
    <div className="as-field">
      <label className="as-label" htmlFor={uid}>
        {label}
      </label>
      <select {...props} id={uid} className="as-control native-select">
        {children}
      </select>
    </div>
  );
}
export function Check({
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="check-row">
      <input {...props} type="checkbox" />
      {children}
    </label>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`as-card panel ${className}`}>{children}</section>;
}
export function Heading({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {text && <p className="muted">{text}</p>}
      </div>
      {children}
    </div>
  );
}
export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <Card className="empty">
      <Icon name="sparkle" size={36} />
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      {children}
    </Card>
  );
}
export function Tabs({
  values,
  active,
  change,
}: {
  values: string[];
  active: string;
  change: (s: string) => void;
}) {
  return (
    <div className="filter-row" aria-label="Filter">
      {values.map((v) => (
        <button
          key={v}
          className={`as-chip ${v === active ? "is-selected" : ""}`}
          aria-pressed={v === active}
          onClick={() => change(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
export function Feedback() {
  const { error, notice, clear } = useApp();
  return (
    <>
      {error && (
        <div role="alert" className="feedback error">
          <Icon name="warning-circle" />
          <span>{error}</span>
          <button onClick={clear} aria-label="Dismiss error">
            <Icon name="x" />
          </button>
        </div>
      )}
      {notice && (
        <div role="status" className="feedback success">
          <Icon name="check-circle" />
          <span>{notice}</span>
          <button onClick={clear} aria-label="Dismiss confirmation">
            <Icon name="x" />
          </button>
        </div>
      )}
    </>
  );
}
export function Ambient({
  drift = false,
  quiet = false,
}: {
  drift?: boolean;
  quiet?: boolean;
}) {
  return (
    <div
      className={`as-ambient ${drift ? "as-ambient--drift" : ""} ${quiet ? "as-ambient--quiet" : ""}`}
      aria-hidden="true"
    >
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`as-ambient__blob as-ambient__blob--${n}`} />
      ))}
      <span className="as-ambient__grain" />
    </div>
  );
}
export function Form({
  action,
  children,
  success = "Changes saved.",
  onDone,
  transform,
}: {
  action: string;
  children: ReactNode;
  success?: string;
  onDone?: (result: unknown) => void;
  transform?: (data: Record<string, unknown>) => Record<string, unknown>;
}) {
  const { act, busy } = useApp();
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data: Record<string, unknown> = Object.fromEntries(
          new FormData(form),
        );
        const submitter = (e.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        if (submitter?.name) data[submitter.name] = submitter.value;
        form
          .querySelectorAll<HTMLInputElement>("input[type=checkbox]")
          .forEach((el) => {
            if (el.name) data[el.name] = el.checked;
          });
        form
          .querySelectorAll<HTMLInputElement>("input[type=number]")
          .forEach((el) => {
            if (el.name) data[el.name] = Number(el.value);
          });
        const result = await act(
          action,
          transform ? transform(data) : data,
          success,
        );
        if (result.ok) onDone?.(result.result);
      }}
    >
      <fieldset disabled={busy}>{children}</fieldset>
    </form>
  );
}
export const disciplines = [
  "painter",
  "musician",
  "writer",
  "dancer",
  "photographer",
  "video",
  "streamer",
  "educator",
];
export const disciplineNames: Record<string, string> = {
  painter: "Painter",
  musician: "Musician",
  writer: "Writer",
  dancer: "Dancer",
  photographer: "Photographer",
  video: "Video creator",
  streamer: "Streamer",
  educator: "Educator",
};
