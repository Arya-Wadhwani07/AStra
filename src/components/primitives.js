"use client";
import React from "react";
import { Icon } from "./icons";
const h = React.createElement;
const Frag = React.Fragment;
function useId(given) {
  const id = React.useId();
  return given || id;
}
function cx() {
  var out = [];
  for (var i = 0; i < arguments.length; i++)
    if (arguments[i]) out.push(arguments[i]);
  return out.join(" ");
}
function money(n, cur) {
  var v = Number(n || 0);
  var s = Math.abs(v).toFixed(2);
  return (v < 0 ? "−" : "") + (cur === "USD" || !cur ? "$" : cur + " ") + s;
}
function pts(n, signed) {
  var v = Number(n || 0);
  var s = Math.abs(v).toLocaleString("en-US");
  if (!signed) return s + " pts";
  return (v > 0 ? "+" : v < 0 ? "−" : "") + s + " pts";
}

/* ---------- AuroraText (port of godui aurora-text) ---------- */
var AURORA_RAINBOW = [
  "#ff2d55",
  "#ff9500",
  "#ffd60a",
  "#34c759",
  "#00c7be",
  "#0a84ff",
  "#5e5ce6",
  "#bf5af2",
];
function AuroraText(p) {
  var colors = p.colors || [
    "var(--aurora-1)",
    "var(--aurora-2)",
    "var(--aurora-3)",
    "var(--aurora-4)",
  ];
  var speed = p.speed || 1;
  var stops = colors.concat([colors[0]]).join(", ");
  var ref = React.useRef(null);
  React.useEffect(function () {
    var el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    var io = new IntersectionObserver(
      function (e) {
        el.style.animationPlayState = e[0].isIntersecting ? "" : "paused";
      },
      { rootMargin: "128px" },
    );
    io.observe(el);
    return function () {
      io.disconnect();
    };
  }, []);
  var Tag = p.as || "span";
  return h(
    Tag,
    {
      "data-slot": "aurora-text",
      className: cx("as-aurora", p.className),
      style: p.style,
    },
    h("span", { className: "as-sr" }, p.children),
    h(
      "span",
      {
        ref: ref,
        "aria-hidden": "true",
        className: "as-aurora__fill",
        style: {
          backgroundImage: "linear-gradient(135deg, " + stops + ")",
          "--aurora-speed": 10 / speed + "s",
        },
      },
      p.children,
    ),
  );
}
AuroraText.RAINBOW = AURORA_RAINBOW;

/* ---------- OrbitingCircles (CSS port of godui orbiting-circles) ---------- */
function OrbitingCircles(p) {
  var radius = p.radius || 100,
    iconSize = p.iconSize || 40,
    duration = p.duration || 24;
  var items = React.Children.toArray(p.children);
  var n = items.length || 1;
  var box = radius * 2 + iconSize;
  var still = !!p.static;
  return h(
    "div",
    {
      "data-slot": "orbiting-circles",
      className: cx(
        "as-orbit",
        still && "as-orbit--static",
        p.reverse && "as-orbit--rev",
        p.className,
      ),
      style: Object.assign(
        { width: box, height: box, "--orbit-dur": duration + "s" },
        p.style,
      ),
      role: p.label ? "img" : undefined,
      "aria-label": p.label,
      "aria-hidden": p.label ? undefined : "true",
    },
    p.showPath === false
      ? null
      : h("div", {
          className: "as-orbit__path",
          style: { width: radius * 2, height: radius * 2 },
        }),
    p.center ? h("div", { className: "as-orbit__center" }, p.center) : null,
    h(
      "div",
      { className: "as-orbit__ring" },
      items.map(function (child, i) {
        var angle = (360 / n) * i;
        return h(
          "div",
          {
            key: i,
            className: "as-orbit__slot",
            style: {
              width: iconSize,
              height: iconSize,
              marginLeft: -iconSize / 2,
              marginTop: -iconSize / 2,
              transform:
                "rotate(" + angle + "deg) translateY(-" + radius + "px)",
            },
          },
          h(
            "div",
            {
              className: "as-orbit__counter",
              style: { "--a": -angle + "deg" },
            },
            child,
          ),
        );
      }),
    ),
  );
}

/* ---------- Actions ---------- */
function Spinner(p) {
  return h(Icon, { name: "spinner-gap", size: p.size || 18, spin: true });
}

function Button(p) {
  var v = p.variant || "primary",
    size = p.size || "md";
  var disabled = p.disabled || p.loading;
  var descId = useId();
  var btn = h(
    "button",
    {
      type: p.type || "button",
      className: cx(
        "as-btn",
        "as-btn--" + v,
        "as-btn--" + size,
        p.fullWidth && "as-btn--full",
        p.loading && "is-loading",
        p.className,
      ),
      disabled: disabled,
      "aria-busy": p.loading ? "true" : undefined,
      onClick: p.onClick,
      "aria-describedby": p.disabledReason && p.disabled ? descId : undefined,
      "data-state": p.state,
    },
    p.loading
      ? h(Spinner, null)
      : p.icon
        ? h(Icon, { name: p.icon, size: size === "sm" ? 16 : 20 })
        : null,
    h("span", null, p.loading && p.loadingText ? p.loadingText : p.children),
    p.iconRight && !p.loading
      ? h(Icon, { name: p.iconRight, size: size === "sm" ? 16 : 20 })
      : null,
  );
  if (p.disabledReason && p.disabled) {
    return h(
      "span",
      { className: cx("as-btn-wrap", p.fullWidth && "as-btn--full") },
      btn,
      h(
        "span",
        { id: descId, className: "as-helper as-helper--muted" },
        h(Icon, { name: "info", size: 14 }),
        p.disabledReason,
      ),
    );
  }
  return btn;
}

function IconButton(p) {
  return h(
    "button",
    {
      type: "button",
      className: cx(
        "as-iconbtn",
        "as-iconbtn--" + (p.variant || "quiet"),
        "as-iconbtn--" + (p.size || "md"),
        p.selected && "is-selected",
        p.className,
      ),
      "aria-label": p.label,
      "aria-pressed": p.toggle ? !!p.selected : undefined,
      disabled: p.disabled,
      onClick: p.onClick,
      title: p.label,
    },
    h(Icon, {
      name: p.icon,
      weight: p.selected ? "fill" : p.weight || "regular",
      size: p.size === "sm" ? 16 : p.size === "lg" ? 24 : 20,
    }),
  );
}

/* ---------- Inputs ---------- */
function Field(p, control, id, describedBy) {
  return h(
    "div",
    {
      className: cx(
        "as-field",
        p.error && "is-error",
        p.success && "is-success",
        p.disabled && "is-disabled",
        p.className,
      ),
    },
    p.label
      ? h(
          "label",
          { className: "as-label", htmlFor: id },
          p.label,
          p.required
            ? h("span", { className: "as-req", "aria-hidden": "true" }, " *")
            : null,
          p.optional ? h("span", { className: "as-opt" }, " (optional)") : null,
        )
      : null,
    control,
    p.error
      ? h(
          "p",
          { id: describedBy, className: "as-helper as-helper--error" },
          h(Icon, { name: "warning-circle", size: 16 }),
          p.error,
        )
      : p.success
        ? h(
            "p",
            { id: describedBy, className: "as-helper as-helper--success" },
            h(Icon, { name: "check-circle", size: 16 }),
            p.success,
          )
        : p.helper
          ? h("p", { id: describedBy, className: "as-helper" }, p.helper)
          : null,
    p.counter ? h("p", { className: "as-counter" }, p.counter) : null,
  );
}

function TextField(p) {
  var id = useId(p.id),
    hid = id + "-h";
  var desc = p.error || p.success || p.helper ? hid : undefined;
  var common = {
    id: id,
    className: "as-input",
    placeholder: p.placeholder,
    value: p.value,
    defaultValue: p.defaultValue,
    disabled: p.disabled,
    readOnly: p.readOnly,
    required: p.required,
    "aria-invalid": p.error ? "true" : undefined,
    "aria-describedby": desc,
    onChange:
      p.onChange || (p.value !== undefined ? function () {} : undefined),
    maxLength: p.maxLength,
    name: p.name,
    autoComplete: p.autoComplete,
  };
  var input = p.multiline
    ? h("textarea", Object.assign({ rows: p.rows || 4 }, common))
    : h("input", Object.assign({ type: p.type || "text" }, common));
  var control = h(
    "div",
    {
      className: cx(
        "as-control",
        p.multiline && "as-control--multi",
        p.size === "sm" && "as-control--sm",
        p.size === "lg" && "as-control--lg",
      ),
    },
    p.icon
      ? h(Icon, { name: p.icon, size: 20, className: "as-control__lead" })
      : null,
    input,
    p.suffix || null,
  );
  return Field(p, control, id, hid);
}

function PasswordField(p) {
  var st = React.useState(!!p.revealed),
    shown = st[0],
    set = st[1];
  return h(
    TextField,
    Object.assign({}, p, {
      type: shown ? "text" : "password",
      suffix: h(
        "button",
        {
          type: "button",
          className: "as-control__btn",
          "aria-label": shown ? "Hide password" : "Show password",
          "aria-pressed": shown,
          onClick: function () {
            set(!shown);
          },
        },
        h(Icon, { name: shown ? "eye-slash" : "eye", size: 20 }),
      ),
    }),
  );
}

function Select(p) {
  var id = useId(p.id),
    hid = id + "-h";
  var control = h(
    "div",
    {
      className: cx(
        "as-control",
        "as-control--select",
        p.size === "sm" && "as-control--sm",
      ),
    },
    h(
      "select",
      {
        id: id,
        className: "as-input",
        value: p.value,
        defaultValue: p.defaultValue,
        disabled: p.disabled,
        "aria-invalid": p.error ? "true" : undefined,
        "aria-describedby": p.error || p.helper ? hid : undefined,
        onChange:
          p.onChange || (p.value !== undefined ? function () {} : undefined),
      },
      (p.options || []).map(function (o) {
        var v = typeof o === "string" ? o : o.value,
          l = typeof o === "string" ? o : o.label;
        return h("option", { key: v, value: v }, l);
      }),
    ),
    h(Icon, { name: "caret-down", size: 16, className: "as-control__caret" }),
  );
  return Field(p, control, id, hid);
}

function Checkbox(p) {
  var id = useId(p.id);
  var ref = React.useRef(null);
  React.useEffect(function () {
    if (ref.current) ref.current.indeterminate = !!p.indeterminate;
  });
  return h(
    "div",
    {
      className: cx(
        "as-check",
        p.disabled && "is-disabled",
        p.error && "is-error",
      ),
    },
    h("input", {
      ref: ref,
      id: id,
      type: "checkbox",
      className: "as-check__input",
      checked: p.checked,
      defaultChecked: p.defaultChecked,
      disabled: p.disabled,
      onChange:
        p.onChange || (p.checked !== undefined ? function () {} : undefined),
      "aria-describedby": p.description ? id + "-d" : undefined,
    }),
    h(
      "span",
      { className: "as-check__box", "aria-hidden": "true" },
      h(Icon, {
        name: p.indeterminate ? "minus" : "check",
        weight: "bold",
        size: 14,
      }),
    ),
    h(
      "label",
      { htmlFor: id, className: "as-check__text" },
      h("span", { className: "as-check__label" }, p.label),
      p.description
        ? h(
            "span",
            { id: id + "-d", className: "as-check__desc" },
            p.description,
          )
        : null,
    ),
  );
}

function Radio(p) {
  var id = useId(p.id);
  return h(
    "div",
    { className: cx("as-check", "as-radio", p.disabled && "is-disabled") },
    h("input", {
      id: id,
      type: "radio",
      name: p.name,
      value: p.value,
      className: "as-check__input",
      checked: p.checked,
      defaultChecked: p.defaultChecked,
      disabled: p.disabled,
      onChange:
        p.onChange || (p.checked !== undefined ? function () {} : undefined),
    }),
    h("span", {
      className: "as-check__box as-radio__box",
      "aria-hidden": "true",
    }),
    h(
      "label",
      { htmlFor: id, className: "as-check__text" },
      h("span", { className: "as-check__label" }, p.label),
      p.description
        ? h("span", { className: "as-check__desc" }, p.description)
        : null,
    ),
  );
}

function Switch(p) {
  var id = useId(p.id);
  var st = React.useState(
      !!(p.checked !== undefined ? p.checked : p.defaultChecked),
    ),
    on = p.checked !== undefined ? p.checked : st[0];
  return h(
    "div",
    { className: cx("as-switch", p.disabled && "is-disabled") },
    h(
      "label",
      { htmlFor: id, className: "as-check__text" },
      h("span", { className: "as-check__label" }, p.label),
      p.description
        ? h("span", { className: "as-check__desc" }, p.description)
        : null,
    ),
    h(
      "button",
      {
        id: id,
        type: "button",
        role: "switch",
        "aria-checked": on,
        disabled: p.disabled,
        className: "as-switch__track",
        onClick: function () {
          st[1](!on);
          if (p.onChange) p.onChange(!on);
        },
      },
      h(
        "span",
        { className: "as-switch__thumb" },
        on ? h(Icon, { name: "check", weight: "bold", size: 12 }) : null,
      ),
    ),
  );
}

function SegmentedControl(p) {
  var st = React.useState(p.value !== undefined ? p.value : p.defaultValue),
    val = p.value !== undefined ? p.value : st[0];
  var gid = useId();
  return h(
    "div",
    { className: cx("as-seg-wrap", p.className) },
    p.label ? h("span", { className: "as-label", id: gid }, p.label) : null,
    h(
      "div",
      {
        className: cx(
          "as-seg",
          p.size === "sm" && "as-seg--sm",
          p.fullWidth && "as-seg--full",
        ),
        role: "radiogroup",
        "aria-labelledby": p.label ? gid : undefined,
        "aria-label": p.label ? undefined : p.ariaLabel,
      },
      (p.options || []).map(function (o) {
        var sel = o.value === val;
        return h(
          "button",
          {
            key: o.value,
            type: "button",
            role: "radio",
            "aria-checked": sel,
            className: cx("as-seg__opt", sel && "is-selected"),
            disabled: o.disabled,
            onClick: function () {
              st[1](o.value);
              if (p.onChange) p.onChange(o.value);
            },
          },
          o.icon
            ? h(Icon, {
                name: o.icon,
                weight: sel ? "fill" : "regular",
                size: 16,
              })
            : null,
          o.label,
          o.note ? h("span", { className: "as-seg__note" }, o.note) : null,
        );
      }),
    ),
    p.helper ? h("p", { className: "as-helper" }, p.helper) : null,
  );
}

function SearchField(p) {
  return h(
    "div",
    { className: cx("as-search", p.className), role: "search" },
    h(TextField, {
      label: p.label,
      icon: "magnifying-glass",
      placeholder: p.placeholder || "Search",
      value: p.value,
      defaultValue: p.defaultValue,
      type: "search",
      size: p.size,
      suffix: p.value
        ? h(
            "button",
            {
              type: "button",
              className: "as-control__btn",
              "aria-label": "Clear search",
            },
            h(Icon, { name: "x", size: 16 }),
          )
        : null,
    }),
  );
}

function Chip(p) {
  var tone = p.tone || "neutral";
  var inner = [
    tone === "required"
      ? h(Icon, {
          key: "i",
          name: p.met === false ? "x-circle" : "lock-simple",
          weight: "fill",
          size: 14,
        })
      : tone === "preferred"
        ? h(Icon, {
            key: "i",
            name: "star-four",
            weight: p.met ? "fill" : "regular",
            size: 14,
          })
        : p.icon
          ? h(Icon, {
              key: "i",
              name: p.icon,
              weight: p.selected ? "fill" : "regular",
              size: 16,
            })
          : null,
    h("span", { key: "l" }, p.children || p.label),
    tone === "required" || tone === "preferred"
      ? h(
          "span",
          { key: "k", className: "as-chip__kind" },
          tone === "required" ? "Required" : "Preferred",
        )
      : null,
    p.count !== undefined
      ? h("span", { key: "c", className: "as-chip__count" }, p.count)
      : null,
    p.onRemove
      ? h(
          "button",
          {
            key: "x",
            type: "button",
            className: "as-chip__x",
            "aria-label": "Remove " + (p.children || p.label),
            onClick: p.onRemove,
          },
          h(Icon, { name: "x", size: 14 }),
        )
      : null,
  ];
  var cls = cx(
    "as-chip",
    "as-chip--" + tone,
    p.selected && "is-selected",
    p.met === true && "is-met",
    p.met === false && "is-unmet",
    p.className,
  );
  if (p.interactive || p.onClick)
    return h(
      "button",
      {
        type: "button",
        className: cls,
        "aria-pressed": !!p.selected,
        onClick: p.onClick,
      },
      inner,
    );
  return h("span", { className: cls }, inner);
}

function Logo(p) {
  return h(
    "span",
    {
      className: cx("as-logo", p.className),
      "aria-label": p.decorative ? undefined : "AStra",
    },
    h(
      "span",
      { className: "as-logo__mark", "aria-hidden": "true" },
      h(Icon, { name: "planet", weight: "fill", size: p.size || 22 }),
    ),
    p.markOnly
      ? null
      : h(
          "span",
          { className: "as-logo__word", "aria-hidden": "true" },
          "AStra",
        ),
  );
}

var DISC = {
  painter: ["palette", "Painter"],
  musician: ["music-notes", "Musician"],
  writer: ["pen-nib", "Writer"],
  dancer: ["person-simple-tai-chi", "Dancer"],
  photographer: ["camera", "Photographer"],
  video: ["video-camera", "Video creator"],
  streamer: ["microphone-stage", "Streamer"],
  educator: ["book-open-text", "Educator"],
};
function discIcon(d) {
  return (DISC[d] || ["sparkle"])[0];
}
function discLabel(d) {
  return (DISC[d] || [null, d])[1];
}

function Avatar(p) {
  var size = p.size || 40;
  var initials = (p.name || "?")
    .split(" ")
    .map(function (s) {
      return s[0];
    })
    .slice(0, 2)
    .join("")
    .toUpperCase();
  var hue = 0;
  for (var i = 0; i < (p.name || "").length; i++)
    hue = (hue + p.name.charCodeAt(i) * 7) % 4;
  return h(
    "span",
    {
      className: cx("as-avatar", "as-avatar--t" + hue, p.className),
      style: { width: size, height: size, fontSize: Math.round(size * 0.38) },
    },
    p.src
      ? h("img", { src: p.src, alt: p.alt || "" })
      : h("span", { "aria-hidden": "true" }, initials),
    p.src ? null : h("span", { className: "as-sr" }, p.name),
    p.verified
      ? h(
          "span",
          { className: "as-avatar__badge", title: "Verified creator" },
          h(Icon, {
            name: "seal-check",
            weight: "fill",
            size: Math.max(12, Math.round(size * 0.36)),
            label: "Verified creator",
          }),
        )
      : null,
  );
}

function DisciplineTag(p) {
  return h(
    "span",
    { className: "as-disc" },
    h(Icon, { name: discIcon(p.discipline), size: 14 }),
    discLabel(p.discipline),
  );
}

function FavoriteButton(p) {
  var st = React.useState(!!p.active),
    on = p.active !== undefined && !p.interactive ? p.active : st[0];
  return h(
    "button",
    {
      type: "button",
      className: cx("as-fav", on && "is-on", p.withLabel && "as-fav--label"),
      "aria-pressed": on,
      "aria-label": p.withLabel
        ? undefined
        : (on ? "Remove " : "Add ") +
          (p.name || "creator") +
          (on ? " from favorites" : " to favorites"),
      onClick: function () {
        st[1](!on);
      },
    },
    h(Icon, { name: "heart", weight: on ? "fill" : "regular", size: 20 }),
    p.withLabel ? h("span", null, on ? "Favorited" : "Favorite") : null,
  );
}

function CreatorSummary(p) {
  return h(
    "div",
    {
      className: cx(
        "as-creator",
        p.compact && "as-creator--compact",
        p.card && "as-card",
        p.className,
      ),
    },
    h(Avatar, {
      name: p.name,
      src: p.avatar,
      size: p.compact ? 36 : 56,
      verified: p.verified,
    }),
    h(
      "div",
      { className: "as-creator__text" },
      h("p", { className: "as-creator__name" }, p.name),
      h(
        "p",
        { className: "as-creator__meta" },
        h(DisciplineTag, { discipline: p.discipline }),
        p.location
          ? h("span", null, h(Icon, { name: "map-pin", size: 14 }), p.location)
          : null,
      ),
      p.bio && !p.compact
        ? h("p", { className: "as-creator__bio" }, p.bio)
        : null,
      p.skills && !p.compact
        ? h(
            "div",
            { className: "as-chiprow" },
            p.skills.map(function (s) {
              return h(Chip, { key: s }, s);
            }),
          )
        : null,
    ),
    p.favorite !== undefined
      ? h(FavoriteButton, {
          active: p.favorite,
          name: p.name,
          withLabel: !p.compact,
          interactive: true,
        })
      : p.action || null,
  );
}

var RATIO = {
  "1:1": "1 / 1",
  "4:5": "4 / 5",
  "3:2": "3 / 2",
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "3:4": "3 / 4",
};
function MediaFrame(p) {
  var r = RATIO[p.ratio || "4:5"];
  return h(
    "figure",
    {
      className: cx("as-media", p.phone && "as-media--phone", p.className),
      style: Object.assign({ aspectRatio: r }, p.style),
    },
    p.src
      ? h("img", { src: p.src, alt: p.alt || "", loading: "lazy" })
      : p.art
        ? h("div", {
            className: "as-media__art as-media__art--" + p.art,
            role: p.alt ? "img" : undefined,
            "aria-label": p.alt,
          })
        : h(
            "div",
            { className: "as-media__missing" },
            h(Icon, {
              name: p.discipline ? discIcon(p.discipline) : "image",
              size: 32,
            }),
            h("span", null, p.missingText || "Image unavailable"),
          ),
    p.label ? h("span", { className: "as-media__label" }, p.label) : null,
    p.credit
      ? h("figcaption", { className: "as-media__credit" }, p.credit)
      : null,
    p.children,
  );
}

function PriceTag(p) {
  return h(
    "span",
    { className: cx("as-price", p.size === "lg" && "as-price--lg") },
    p.compare
      ? h(
          "s",
          { className: "as-price__was" },
          h("span", { className: "as-sr" }, "Was "),
          money(p.compare),
        )
      : null,
    h(
      "span",
      null,
      p.compare ? h("span", { className: "as-sr" }, "Now ") : null,
      p.amount === 0 ? "Free" : money(p.amount, p.currency),
    ),
    p.unit ? h("span", { className: "as-price__unit" }, " / " + p.unit) : null,
  );
}

function AvailabilityLabel(p) {
  var s = p.status || "available";
  var m = {
    available: ["check-circle", "Available", "success"],
    low: ["hourglass-medium", (p.count || 3) + " left", "warning"],
    soldout: ["prohibit", "Sold out", "neutral"],
    external: ["arrow-square-out", "Tickets on external site", "info"],
    ended: ["clock", "Event ended", "neutral"],
  }[s];
  return h(StatusBadge, { tone: m[2], icon: m[0] }, p.children || m[1]);
}

var TONE_ICON = {
  success: "check-circle",
  warning: "warning",
  error: "warning-circle",
  info: "info",
  neutral: "info",
  points: "star-four",
  private: "lock-simple",
  accent: "sparkle",
};
function StatusBadge(p) {
  var tone = p.tone || "neutral";
  return h(
    "span",
    {
      className: cx(
        "as-badge",
        "as-badge--" + tone,
        p.solid && "as-badge--solid",
        p.className,
      ),
    },
    p.icon === false
      ? null
      : h(Icon, {
          name: p.icon || TONE_ICON[tone],
          weight: p.icon === "spinner-gap" ? "regular" : "fill",
          size: 14,
          spin: p.icon === "spinner-gap",
        }),
    h("span", null, p.children),
  );
}

function Banner(p) {
  var tone = p.tone || "info";
  return h(
    "div",
    {
      className: cx("as-banner", "as-banner--" + tone, p.className),
      role: tone === "error" ? "alert" : "status",
    },
    h(Icon, {
      name: p.icon || TONE_ICON[tone],
      weight: "fill",
      size: 20,
      className: "as-banner__icon",
    }),
    h(
      "div",
      { className: "as-banner__text" },
      p.title ? h("p", { className: "as-banner__title" }, p.title) : null,
      p.children
        ? h("div", { className: "as-banner__body" }, p.children)
        : null,
    ),
    p.action ? h("div", { className: "as-banner__action" }, p.action) : null,
    p.onDismiss || p.dismissible
      ? h(IconButton, {
          icon: "x",
          label: "Dismiss",
          size: "sm",
          onClick: p.onDismiss,
        })
      : null,
  );
}

function Toast(p) {
  var tone = p.tone || "success";
  return h(
    "div",
    {
      className: cx("as-toast", "as-toast--" + tone),
      role: "status",
      "aria-live": "polite",
    },
    h(Icon, {
      name: TONE_ICON[tone],
      weight: "fill",
      size: 20,
      className: "as-toast__icon",
    }),
    h(
      "div",
      { className: "as-toast__text" },
      h("p", { className: "as-toast__title" }, p.title),
      p.children ? h("p", { className: "as-toast__body" }, p.children) : null,
    ),
    p.action
      ? h("button", { type: "button", className: "as-toast__action" }, p.action)
      : null,
    h(IconButton, { icon: "x", label: "Dismiss notification", size: "sm" }),
  );
}

function Tooltip(p) {
  var id = useId();
  var st = React.useState(!!p.open),
    open = p.open || st[0];
  return h(
    "span",
    {
      className: "as-tip-wrap",
      onMouseEnter: function () {
        st[1](true);
      },
      onMouseLeave: function () {
        st[1](false);
      },
      onFocus: function () {
        st[1](true);
      },
      onBlur: function () {
        st[1](false);
      },
    },
    React.cloneElement(p.children, { "aria-describedby": id }),
    h(
      "span",
      {
        id: id,
        role: "tooltip",
        className: cx(
          "as-tip",
          open && "is-open",
          "as-tip--" + (p.side || "top"),
        ),
      },
      p.text,
    ),
  );
}

function Skeleton(p) {
  var v = p.variant || "text";
  if (v === "card")
    return h(
      "div",
      { className: "as-card as-skel-card", "aria-hidden": "true" },
      h(
        "div",
        { className: "as-skel-row" },
        h("span", { className: "as-skel as-skel--circle" }),
        h("span", {
          className: "as-skel as-skel--line",
          style: { width: "40%" },
        }),
      ),
      h("span", { className: "as-skel as-skel--media" }),
      h("span", {
        className: "as-skel as-skel--line",
        style: { width: "70%" },
      }),
      h("span", {
        className: "as-skel as-skel--line",
        style: { width: "90%" },
      }),
    );
  if (v === "row")
    return h(
      "div",
      { className: "as-skel-row", "aria-hidden": "true" },
      h("span", { className: "as-skel as-skel--circle" }),
      h("span", {
        className: "as-skel as-skel--line",
        style: { width: "60%" },
      }),
      h("span", {
        className: "as-skel as-skel--line",
        style: { width: "15%", marginLeft: "auto" },
      }),
    );
  var lines = [];
  for (var i = 0; i < (p.lines || 3); i++)
    lines.push(
      h("span", {
        key: i,
        className: "as-skel as-skel--line",
        style: { width: i === (p.lines || 3) - 1 ? "60%" : "100%" },
      }),
    );
  return h("div", { className: "as-skel-text", "aria-hidden": "true" }, lines);
}

function Loading(p) {
  return h(
    "div",
    { className: "as-loading", role: "status", "aria-live": "polite" },
    h("span", { className: "as-sr" }, p.label || "Loading"),
    p.children,
  );
}

function EmptyState(p) {
  var tone = p.tone || "empty";
  var icon =
    p.icon ||
    {
      empty: "sparkle",
      noresults: "magnifying-glass",
      error: "plugs-connected",
    }[tone];
  return h(
    "div",
    {
      className: cx(
        "as-empty",
        "as-empty--" + tone,
        p.compact && "as-empty--compact",
      ),
      role: tone === "error" ? "alert" : undefined,
    },
    h(
      "span",
      { className: "as-empty__icon" },
      h(Icon, { name: icon, size: p.compact ? 28 : 40 }),
    ),
    h("h3", { className: "as-empty__title" }, p.title),
    p.body ? h("p", { className: "as-empty__body" }, p.body) : null,
    p.action || p.secondary
      ? h(
          "div",
          { className: "as-empty__actions" },
          p.action || null,
          p.secondary || null,
        )
      : null,
  );
}

function PrivateMarker(p) {
  return h(
    "span",
    { className: cx("as-badge", "as-badge--private", p.className) },
    h(Icon, { name: "lock-simple", weight: "fill", size: 14 }),
    h("span", null, p.children || "Visible to creators only"),
  );
}

function ResponseCounter(p) {
  var c = p.count || 0,
    l = p.limit || 10,
    full = c >= l;
  return h(
    "div",
    { className: cx("as-rcount", full && "is-full") },
    h(
      "div",
      { className: "as-rcount__row" },
      h(
        "span",
        { className: "as-rcount__num" },
        h("strong", null, c),
        " / " + l,
        h("span", { className: "as-rcount__lbl" }, " responses"),
      ),
      full
        ? h(
            StatusBadge,
            { tone: "warning", icon: "hourglass-medium" },
            "Paused at limit",
          )
        : h(
            "span",
            { className: "as-caption" },
            l - c + (l - c === 1 ? " spot left" : " spots left"),
          ),
    ),
    h(
      "div",
      {
        className: "as-meter",
        role: "meter",
        "aria-valuenow": c,
        "aria-valuemin": 0,
        "aria-valuemax": l,
        "aria-label": c + " of " + l + " responses",
      },
      h("span", { style: { width: Math.min(100, (c / l) * 100) + "%" } }),
    ),
  );
}

var ARR = {
  paid: ["credit-card", "Paid"],
  exchange: ["arrows-left-right", "Skill exchange"],
  revenue: ["chart-line-up", "Revenue sharing"],
  unpaid: ["heart", "Unpaid"],
  open: ["chat-circle-text", "Open to discussion"],
};
var OPP_STATUS = {
  open: ["success", "check-circle", "Open"],
  paused: ["warning", "hourglass-medium", "Paused: limit reached"],
  closed: ["neutral", "prohibit", "Closed"],
  draft: ["neutral", "pencil-simple", "Draft"],
};

function OpportunityCard(p) {
  var st = OPP_STATUS[p.status || "open"],
    arr = ARR[p.arrangement || "paid"];
  return h(
    "article",
    {
      className: cx(
        "as-card",
        "as-opp",
        p.detail && "as-opp--detail",
        p.selected && "is-selected",
      ),
    },
    h(
      "div",
      { className: "as-opp__top" },
      h(PrivateMarker, null, "Creators only"),
      h(StatusBadge, { tone: st[0], icon: st[1] }, st[2]),
    ),
    h(
      p.detail ? "h2" : "h3",
      {
        className: p.detail
          ? "as-opp__title as-opp__title--lg"
          : "as-opp__title",
      },
      p.title,
    ),
    h(CreatorSummary, {
      name: p.poster,
      discipline: p.posterDiscipline,
      compact: true,
      verified: p.verified,
    }),
    p.detail && p.description
      ? h("p", { className: "as-opp__desc" }, p.description)
      : null,
    h(
      "dl",
      { className: "as-opp__facts" },
      h(
        "div",
        null,
        h("dt", null, "Looking for"),
        h("dd", null, h(DisciplineTag, { discipline: p.discipline })),
      ),
      h(
        "div",
        null,
        h("dt", null, "Deliverable"),
        h("dd", null, p.deliverable),
      ),
      h(
        "div",
        null,
        h("dt", null, "Timing"),
        h("dd", null, h(Icon, { name: "clock", size: 16 }), p.timing),
      ),
      h(
        "div",
        null,
        h("dt", null, "Where"),
        h(
          "dd",
          null,
          h(Icon, { name: p.remote ? "globe-simple" : "map-pin", size: 16 }),
          p.remote ? "Remote" : p.location,
        ),
      ),
      h(
        "div",
        null,
        h("dt", null, "Arrangement"),
        h(
          "dd",
          null,
          h(Icon, { name: arr[0], size: 16 }),
          arr[1] + (p.budget ? " · " + p.budget : ""),
        ),
      ),
    ),
    p.criteria
      ? h(
          "div",
          { className: "as-opp__criteria" },
          h("p", { className: "as-label" }, "Criteria"),
          h(
            "div",
            { className: "as-chiprow" },
            p.criteria.map(function (c, i) {
              return h(Chip, { key: i, tone: c.kind, met: c.met }, c.label);
            }),
          ),
        )
      : null,
    h(ResponseCounter, { count: p.responses, limit: p.limit }),
    p.detail
      ? null
      : h(
          "div",
          { className: "as-opp__foot" },
          h(
            Button,
            { variant: "secondary", size: "sm", iconRight: "arrow-right" },
            "View opportunity",
          ),
        ),
  );
}

function EligibilityPanel(p) {
  var s = p.state || "eligible";
  var m = {
    eligible: [
      "success",
      "check-circle",
      "You can respond",
      "You meet every required criterion.",
    ],
    missing: [
      "warning",
      "warning",
      "Add missing profile details",
      "We can’t check one required criterion because your profile is missing it.",
    ],
    ineligible: [
      "error",
      "prohibit",
      "You can’t respond to this one",
      "This opportunity requires a skill that isn’t on your profile.",
    ],
    responded: [
      "success",
      "paper-plane-tilt",
      "Response sent",
      "You’ve responded once. Continue in the conversation.",
    ],
    paused: [
      "warning",
      "hourglass-medium",
      "Responses paused",
      "This opportunity reached its response limit. The owner may reopen it.",
    ],
    closed: [
      "neutral",
      "prohibit",
      "Closed",
      "The owner closed this opportunity. It no longer accepts responses.",
    ],
  }[s];
  return h(
    "section",
    {
      className: cx("as-card", "as-elig", "as-elig--" + s),
      "aria-labelledby": "elig-" + s,
    },
    h(
      "div",
      { className: "as-elig__head" },
      h(
        "span",
        { className: "as-elig__icon" },
        h(Icon, { name: m[1], weight: "fill", size: 22 }),
      ),
      h(
        "div",
        null,
        h(
          "h3",
          { id: "elig-" + s, className: "as-elig__title" },
          p.title || m[2],
        ),
        h("p", { className: "as-elig__body" }, p.body || m[3]),
      ),
    ),
    p.criteria
      ? h(
          "ul",
          { className: "as-elig__list" },
          p.criteria.map(function (c, i) {
            var icon =
              c.met === true
                ? "check-circle"
                : c.met === false
                  ? "x-circle"
                  : "question";
            return h(
              "li",
              {
                key: i,
                className: cx(
                  c.met === true && "is-met",
                  c.met === false && "is-unmet",
                  c.met === undefined && "is-unknown",
                ),
              },
              h(Icon, {
                name:
                  c.met === true
                    ? "check-circle"
                    : c.met === false
                      ? "x-circle"
                      : "warning-circle",
                weight: "fill",
                size: 18,
              }),
              h("span", { className: "as-elig__crit" }, c.label),
              h(
                "span",
                { className: "as-elig__kind" },
                c.kind === "required" ? "Required" : "Preferred",
              ),
              h(
                "span",
                { className: "as-elig__state" },
                c.met === true
                  ? "Matches"
                  : c.met === false
                    ? c.kind === "required"
                      ? "Not on your profile"
                      : "Not a match, still eligible"
                    : "Missing from profile",
              ),
            );
          }),
        )
      : null,
    p.action ? h("div", { className: "as-elig__action" }, p.action) : null,
  );
}

var CAND = {
  new: ["info", "sparkle", "New"],
  shortlisted: ["points", "star-four", "Shortlisted"],
  declined: ["neutral", "x-circle", "Declined"],
  accepted: ["success", "check-circle", "Accepted"],
  changes: ["warning", "pencil-simple", "Changes requested"],
  confirmed: ["success", "check-circle", "Confirmed v"],
  awaiting: ["warning", "hourglass-medium", "Awaiting confirmation"],
};
function ParticipantRow(p) {
  var s = CAND[p.status || "new"];
  return h(
    "div",
    { className: cx("as-prow", p.compact && "as-prow--compact") },
    h(Avatar, { name: p.name, size: 40, verified: p.verified }),
    h(
      "div",
      { className: "as-prow__text" },
      h(
        "p",
        { className: "as-prow__name" },
        p.name,
        p.role
          ? h("span", { className: "as-prow__role" }, " · " + p.role)
          : null,
      ),
      h(
        "p",
        { className: "as-prow__meta" },
        h(DisciplineTag, { discipline: p.discipline }),
        p.match ? h("span", null, p.match) : null,
      ),
      p.message
        ? h("p", { className: "as-prow__msg" }, "“" + p.message + "”")
        : null,
    ),
    h(
      StatusBadge,
      { tone: s[0], icon: s[1] },
      s[2] +
        (p.status === "confirmed" && p.version
          ? p.version
          : p.status === "confirmed"
            ? ""
            : ""),
    ),
    p.actions ? h("div", { className: "as-prow__actions" }, p.actions) : null,
  );
}

function MessageBubble(p) {
  var s = p.status;
  return h(
    "div",
    {
      className: cx(
        "as-msg",
        p.own && "as-msg--own",
        s === "failed" && "is-failed",
        p.system && "as-msg--system",
      ),
    },
    p.system
      ? h(
          "p",
          { className: "as-msg__system" },
          h(Icon, { name: p.icon || "info", size: 16 }),
          p.children,
        )
      : h(
          Frag,
          null,
          p.own ? null : h(Avatar, { name: p.author, size: 32 }),
          h(
            "div",
            { className: "as-msg__col" },
            p.own ? null : h("p", { className: "as-msg__author" }, p.author),
            h("div", { className: "as-msg__bubble" }, p.children),
            h(
              "p",
              { className: "as-msg__meta" },
              s === "sending"
                ? h(
                    Frag,
                    null,
                    h(Icon, { name: "spinner-gap", size: 14, spin: true }),
                    "Sending…",
                  )
                : s === "failed"
                  ? h(
                      Frag,
                      null,
                      h(Icon, {
                        name: "warning-circle",
                        weight: "fill",
                        size: 14,
                      }),
                      "Not sent. ",
                      h(
                        "button",
                        { type: "button", className: "as-linkbtn" },
                        "Retry",
                      ),
                    )
                  : h(
                      Frag,
                      null,
                      p.time,
                      s === "sent" ? h(Frag, null, " · Sent") : null,
                    ),
            ),
          ),
        ),
  );
}

function BriefStatus(p) {
  var parts = p.participants || [],
    ok = parts.filter(function (x) {
      return x.confirmed;
    }).length;
  var active = p.state === "active";
  return h(
    "section",
    { className: cx("as-card", "as-brief") },
    h(
      "div",
      { className: "as-brief__head" },
      h(
        "div",
        null,
        h("p", { className: "as-eyebrow-sm" }, "Shared plan · not a contract"),
        h("h3", { className: "as-section-title" }, p.title || "Project brief"),
      ),
      h(
        StatusBadge,
        {
          tone: active ? "success" : "warning",
          icon: active ? "check-circle" : "hourglass-medium",
        },
        active
          ? "Active project"
          : "Awaiting " +
              (parts.length - ok) +
              " confirmation" +
              (parts.length - ok === 1 ? "" : "s"),
      ),
    ),
    h(
      "p",
      { className: "as-brief__ver" },
      h(Icon, { name: "file-text", size: 16 }),
      "Version " + (p.version || 1) + " · edited " + (p.edited || "today"),
    ),
    p.changed
      ? h(
          Banner,
          { tone: "info", title: "Brief updated to version " + p.version },
          "Everyone needs to confirm the latest version before the project becomes active.",
        )
      : null,
    h(
      "ul",
      { className: "as-brief__list" },
      parts.map(function (x) {
        return h(
          "li",
          { key: x.name },
          h(Avatar, { name: x.name, size: 28 }),
          h(
            "span",
            null,
            x.name,
            h("span", { className: "as-caption" }, " · " + x.role),
          ),
          x.confirmed
            ? h(
                StatusBadge,
                { tone: "success" },
                "Confirmed v" + (p.version || 1),
              )
            : h(
                StatusBadge,
                { tone: "warning", icon: "hourglass-medium" },
                "Not yet confirmed",
              ),
        );
      }),
    ),
    p.action || null,
  );
}

/* ---------- Commerce & loyalty ---------- */

function PointsBalance(p) {
  return h(
    "section",
    {
      className: cx("as-card", "as-points", p.compact && "as-points--compact"),
      "aria-label": "Loyalty points",
    },
    h(
      "div",
      { className: "as-points__head" },
      h(
        "span",
        { className: "as-points__icon" },
        h(Icon, { name: "star-four", weight: "fill", size: 20 }),
      ),
      h("p", { className: "as-label" }, "Loyalty points"),
      h(
        Tooltip,
        {
          side: "end",
          text: "Points are non-cash loyalty units. They can’t be transferred or withdrawn.",
        },
        h(
          "button",
          {
            type: "button",
            className: "as-iconbtn as-iconbtn--quiet as-iconbtn--sm",
            "aria-label": "About points",
          },
          h(Icon, { name: "info", size: 16 }),
        ),
      ),
    ),
    h(
      "p",
      { className: "as-points__num" },
      (p.available || 0).toLocaleString("en-US"),
      h("span", null, " available"),
    ),
    h(
      "dl",
      { className: "as-points__split" },
      h(
        "div",
        null,
        h("dt", null, "Pending"),
        h(
          "dd",
          null,
          pts(p.pending || 0),
          h("span", { className: "as-caption" }, " · not spendable yet"),
        ),
      ),
      p.rule
        ? h("div", null, h("dt", null, "Active benefit"), h("dd", null, p.rule))
        : null,
    ),
    p.action || null,
    h(
      "p",
      { className: "as-caption" },
      "Points aren’t money and can’t be cashed out.",
    ),
  );
}

var LEDGER = {
  pending: ["info", "hourglass-medium", "Pending"],
  approved: ["success", "check-circle", "Approved"],
  rejected: ["error", "x-circle", "Rejected"],
  reversed: ["warning", "arrow-counter-clockwise", "Reversed"],
  redeemed: ["points", "star-four", "Redeemed"],
  restored: ["success", "arrow-counter-clockwise", "Restored"],
};
function LedgerRow(p) {
  var s = LEDGER[p.status || "approved"];
  var v = Number(p.change || 0);
  return h(
    "div",
    {
      className: cx("as-ledger", "as-ledger--" + (p.status || "approved")),
      role: "row",
    },
    h(
      "div",
      { className: "as-ledger__main", role: "cell" },
      h("p", { className: "as-ledger__act" }, p.activity),
      h("p", { className: "as-caption" }, p.source + " · " + p.date),
      p.reason
        ? h(
            "p",
            { className: "as-ledger__reason" },
            h(Icon, { name: "info", size: 14 }),
            p.reason,
          )
        : null,
    ),
    h(
      "span",
      { role: "cell" },
      h(StatusBadge, { tone: s[0], icon: s[1] }, s[2]),
    ),
    h(
      "span",
      {
        role: "cell",
        className: cx(
          "as-ledger__chg",
          v < 0 && "is-neg",
          (p.status === "rejected" || p.status === "pending") && "is-muted",
        ),
      },
      pts(v, true),
    ),
  );
}

function Eyebrow(p) {
  return h(
    "p",
    { className: cx("as-eyebrow", p.className) },
    h("span", { className: "as-eyebrow__sq", "aria-hidden": "true" }),
    p.children,
  );
}

export {
  AuroraText,
  OrbitingCircles,
  Spinner,
  Button,
  IconButton,
  Field,
  TextField,
  PasswordField,
  Select,
  Checkbox,
  Radio,
  Switch,
  SegmentedControl,
  SearchField,
  Chip,
  Logo,
  Avatar,
  DisciplineTag,
  FavoriteButton,
  CreatorSummary,
  MediaFrame,
  PriceTag,
  AvailabilityLabel,
  StatusBadge,
  Banner,
  Toast,
  Tooltip,
  Skeleton,
  Loading,
  EmptyState,
  PrivateMarker,
  ResponseCounter,
  OpportunityCard,
  EligibilityPanel,
  ParticipantRow,
  MessageBubble,
  BriefStatus,
  PointsBalance,
  LedgerRow,
  Eyebrow,
};
