// AStra component props (documentation only — not type-checked).
import type * as React from "react";

type Tone = "success" | "warning" | "error" | "info" | "neutral" | "points" | "private" | "accent";
type Discipline = "painter" | "musician" | "writer" | "dancer" | "photographer" | "video" | "streamer" | "educator";
type Criterion = { label: string; kind: "required" | "preferred"; met?: boolean };

/** Phosphor icon. Decorative unless `label` is given. */
export declare function Icon(p: { name: string; weight?: "regular" | "fill" | "bold" | "duotone"; size?: number; label?: string; color?: string; mirrored?: boolean; spin?: boolean; className?: string }): React.ReactElement;
/** Gradient text for display moments; colors default to aurora-1…4. */
export declare function AuroraText(p: { children: React.ReactNode; colors?: string[]; speed?: number; as?: string; className?: string }): React.ReactElement;
/** Decorative orbit of discipline icons; `static` for reduced motion. */
export declare function OrbitingCircles(p: { children: React.ReactNode; radius?: number; iconSize?: number; duration?: number; reverse?: boolean; showPath?: boolean; static?: boolean; center?: React.ReactNode; label?: string }): React.ReactElement;
export declare function Logo(p: { markOnly?: boolean; size?: number }): React.ReactElement;
export declare function Wordmark(p: { children?: React.ReactNode; aurora?: boolean; decorative?: boolean }): React.ReactElement;
export declare function Eyebrow(p: { children: React.ReactNode }): React.ReactElement;

export declare function Button(p: { children: React.ReactNode; variant?: "primary" | "secondary" | "quiet" | "destructive"; size?: "sm" | "md" | "lg"; icon?: string; iconRight?: string; loading?: boolean; loadingText?: string; disabled?: boolean; disabledReason?: string; fullWidth?: boolean; type?: "button" | "submit"; onClick?: () => void }): React.ReactElement;
export declare function IconButton(p: { icon: string; label: string; variant?: "quiet" | "secondary" | "primary"; size?: "sm" | "md" | "lg"; toggle?: boolean; selected?: boolean; disabled?: boolean; onClick?: () => void }): React.ReactElement;

type FieldBase = { label?: string; helper?: string; error?: string; success?: string; required?: boolean; optional?: boolean; disabled?: boolean; id?: string; size?: "sm" | "md" | "lg" };
export declare function TextField(p: FieldBase & { value?: string; defaultValue?: string; onChange?: (e: any) => void; placeholder?: string; type?: string; icon?: string; multiline?: boolean; rows?: number; counter?: string; maxLength?: number; suffix?: React.ReactNode }): React.ReactElement;
export declare function PasswordField(p: FieldBase & { value?: string; placeholder?: string; revealed?: boolean }): React.ReactElement;
export declare function Select(p: FieldBase & { options: (string | { value: string; label: string })[]; value?: string; defaultValue?: string; onChange?: (e: any) => void }): React.ReactElement;
export declare function Checkbox(p: { label: string; description?: string; checked?: boolean; defaultChecked?: boolean; indeterminate?: boolean; disabled?: boolean; error?: boolean; onChange?: (e: any) => void }): React.ReactElement;
export declare function Radio(p: { name: string; value?: string; label: string; description?: string; checked?: boolean; defaultChecked?: boolean; disabled?: boolean }): React.ReactElement;
export declare function Switch(p: { label: string; description?: string; checked?: boolean; defaultChecked?: boolean; disabled?: boolean; onChange?: (on: boolean) => void }): React.ReactElement;
export declare function SegmentedControl(p: { options: { value: any; label: string; icon?: string; note?: string; disabled?: boolean }[]; value?: any; defaultValue?: any; onChange?: (v: any) => void; label?: string; ariaLabel?: string; helper?: string; size?: "sm"; fullWidth?: boolean }): React.ReactElement;
export declare function SearchField(p: { placeholder?: string; value?: string; defaultValue?: string; label?: string; size?: "lg" }): React.ReactElement;
export declare function Chip(p: { children?: React.ReactNode; label?: string; icon?: string; tone?: "neutral" | "required" | "preferred"; met?: boolean; selected?: boolean; interactive?: boolean; onClick?: () => void; onRemove?: () => void; count?: number }): React.ReactElement;
export declare function FileUpload(p: { label?: string; state?: "idle" | "uploading" | "done" | "error"; fileName?: string; progress?: number; helper?: string; error?: string }): React.ReactElement;

export declare function Tabs(p: { items: { id: string; label: string; icon?: string; count?: number }[]; value?: string; defaultValue?: string; onChange?: (id: string) => void; variant?: "underline" | "display"; ariaLabel?: string }): React.ReactElement;
export declare function Breadcrumbs(p: { items: string[] }): React.ReactElement;
export declare function Pagination(p: { page: number; pages: number }): React.ReactElement;
export declare function RoleSwitch(p: { role: "creator" | "audience"; onChange?: (r: string) => void }): React.ReactElement;
export declare function SideNav(p: { role: "creator" | "audience" | "admin"; active?: string; user?: string; unread?: number; dual?: boolean; onRoleChange?: (r: string) => void }): React.ReactElement;
export declare function BottomNav(p: { role: "creator" | "audience"; active?: string; cartCount?: number }): React.ReactElement;
export declare function AppShell(p: { role: "creator" | "audience" | "admin"; active?: string; title?: string; crumbs?: string[]; actions?: React.ReactNode; rail?: React.ReactNode; user?: string; unread?: number; dual?: boolean; mobile?: boolean; cartCount?: number; children: React.ReactNode }): React.ReactElement;

export declare function Avatar(p: { name: string; src?: string; alt?: string; size?: number; verified?: boolean }): React.ReactElement;
export declare function CreatorSummary(p: { name: string; discipline: Discipline; location?: string; avatar?: string; verified?: boolean; bio?: string; skills?: string[]; favorite?: boolean; action?: React.ReactNode; compact?: boolean; card?: boolean }): React.ReactElement;
export declare function MediaFrame(p: { ratio?: "4:5" | "16:9" | "1:1" | "9:16" | "3:2" | "3:4"; src?: string; alt?: string; art?: string; credit?: string; label?: string; discipline?: Discipline; missingText?: string; phone?: boolean }): React.ReactElement;
export declare function FeedCard(p: { type: "post" | "event" | "merch"; creator: string; discipline: Discipline; time: string; title: string; body?: string; src?: string; alt?: string; art?: string; credit?: string; ratio?: string; textOnly?: boolean; date?: string; location?: string; price?: number; availability?: "available" | "low" | "soldout" | "external" | "ended"; count?: number; favorite?: boolean; verified?: boolean }): React.ReactElement;
export declare function FavoriteButton(p: { name?: string; active?: boolean; withLabel?: boolean; interactive?: boolean }): React.ReactElement;
export declare function PriceTag(p: { amount: number; currency?: string; compare?: number; unit?: string; size?: "lg" }): React.ReactElement;
export declare function AvailabilityLabel(p: { status: "available" | "low" | "soldout" | "external" | "ended"; count?: number }): React.ReactElement;

export declare function StatusBadge(p: { children: React.ReactNode; tone?: Tone; icon?: string | false }): React.ReactElement;
export declare function Banner(p: { tone?: "info" | "success" | "warning" | "error" | "private" | "points"; title?: string; children?: React.ReactNode; action?: React.ReactNode; dismissible?: boolean; onDismiss?: () => void }): React.ReactElement;
export declare function Toast(p: { tone?: "success" | "error" | "info" | "points"; title: string; children?: React.ReactNode; action?: string }): React.ReactElement;
export declare function Tooltip(p: { text: string; children: React.ReactElement; side?: "top" | "bottom" | "end"; open?: boolean }): React.ReactElement;
export declare function Skeleton(p: { variant?: "text" | "card" | "row"; lines?: number }): React.ReactElement;
export declare function Loading(p: { label?: string; children: React.ReactNode }): React.ReactElement;
export declare function EmptyState(p: { tone?: "empty" | "noresults" | "error"; title: string; body?: string; action?: React.ReactNode; secondary?: React.ReactNode; icon?: string; compact?: boolean }): React.ReactElement;
export declare function Dialog(p: { title: string; children: React.ReactNode; footer?: React.ReactNode; tone?: "default" | "destructive"; drawer?: boolean; onClose?: () => void; inline?: boolean }): React.ReactElement;
export declare function VerificationStatus(p: { status: "not_submitted" | "pending" | "verified" | "action_needed"; gatedAction?: string; body?: string }): React.ReactElement;
export declare function ConsentCard(p: { provider: string; purpose: string; permissions: string[]; never?: string[]; retention?: string; status: "unconnected" | "connected" | "expired" | "denied" | "unavailable" | "disconnected"; lastSync?: string; icon?: string }): React.ReactElement;

export declare function PrivateMarker(p: { children?: React.ReactNode }): React.ReactElement;
export declare function OpportunityCard(p: { title: string; poster: string; posterDiscipline: Discipline; discipline: Discipline; deliverable: string; timing: string; remote?: boolean; location?: string; arrangement: "paid" | "exchange" | "revenue" | "unpaid" | "open"; budget?: string; criteria?: Criterion[]; responses: number; limit: 5 | 10 | 20; status?: "open" | "paused" | "closed" | "draft"; verified?: boolean; detail?: boolean; description?: string; selected?: boolean }): React.ReactElement;
export declare function ResponseCounter(p: { count: number; limit: 5 | 10 | 20 }): React.ReactElement;
export declare function EligibilityPanel(p: { state: "eligible" | "missing" | "ineligible" | "responded" | "paused" | "closed"; criteria?: Criterion[]; title?: string; body?: string; action?: React.ReactNode }): React.ReactElement;
export declare function ResponseForm(p: { profile?: string; value?: string; max?: number; state?: "idle" | "sending" | "failed" }): React.ReactElement;
export declare function ParticipantRow(p: { name: string; discipline: Discipline; role?: string; match?: string; message?: string; status?: "new" | "shortlisted" | "declined" | "accepted" | "changes" | "awaiting" | "confirmed"; version?: number; verified?: boolean; actions?: React.ReactNode }): React.ReactElement;
export declare function MessageBubble(p: { children: React.ReactNode; author?: string; time?: string; own?: boolean; status?: "sending" | "sent" | "failed"; system?: boolean; icon?: string }): React.ReactElement;
export declare function BriefStatus(p: { title?: string; version: number; edited?: string; participants: { name: string; role: string; confirmed: boolean }[]; state?: "active"; changed?: boolean; action?: React.ReactNode }): React.ReactElement;

export declare function QuantityStepper(p: { value: number; min?: number; max?: number; item?: string; disabled?: boolean; interactive?: boolean }): React.ReactElement;
export declare function CartItem(p: { title: string; type: "event" | "merch"; creator: string; detail?: string; art?: string; discipline?: Discipline; price: number; qty?: number; max?: number; compare?: number; changed?: string; unavailable?: string; pointsEligible?: boolean }): React.ReactElement;
export declare function OrderSummary(p: { items?: number; subtotal: number; pointsUsed?: number; discount?: number; fees?: number | null; feesNote?: string; total: number; remaining?: number; pending?: number; rule?: string; state?: "ready" | "processing" | "blocked"; cta?: string | false; notice?: React.ReactNode }): React.ReactElement;
export declare function PointsBalance(p: { available: number; pending?: number; rule?: string; action?: React.ReactNode; compact?: boolean }): React.ReactElement;
export declare function LedgerRow(p: { activity: string; source: string; date: string; change: number; status: "pending" | "approved" | "rejected" | "reversed" | "redeemed" | "restored"; reason?: string }): React.ReactElement;
export declare function DeliveryStatus(p: { payment?: "processing" | "paid" | "declined" | "cancelled" | "checking" | "refunded"; order?: "confirmed" | "fulfilled" | "shipped" | "none" | "refunded"; email?: "queued" | "sent" | "delayed" | "failed" }): React.ReactElement;
export declare function Receipt(p: { id: string; date: string; order?: string; email?: string; children?: React.ReactNode }): React.ReactElement;

export declare function AdminTable(p: { title?: string; tools?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode }): React.ReactElement;
export declare function AdminCaseRow(p: { id: string; type: string; icon?: string; subject: string; detail?: string; status: "pending" | "held" | "decided" | "appealed"; age: string; selected?: boolean }): React.ReactElement;
export declare function AuditRow(p: { action: string; record: string; actor: string; time: string; reason?: string; notice?: string }): React.ReactElement;

// Cinematic motion (Cinema theme)
export interface MotionMedia { src?: string; webm?: string; poster?: string; mobileSrc?: string | null; mobileWebm?: string; mobilePoster?: string; focus?: string; label?: string; still?: boolean; hideControl?: boolean; preload?: "none" | "metadata" | "auto"; className?: string; style?: React.CSSProperties }
/** Pre-rendered ambient loop: muted, pauses off-screen, pause control, poster under reduced motion / Save-Data / error. */
export declare function MotionLoop(p: MotionMedia): React.ReactElement;
/** Cinema-theme section: media → scrim → editable copy/actions → pause control. */
export declare function MotionStage(p: { media: MotionMedia; title: React.ReactNode; eyebrow?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; nav?: React.ReactNode; footnote?: React.ReactNode; textSide?: "left" | "right"; compact?: boolean; theme?: string; id?: string; className?: string; style?: React.CSSProperties; children?: React.ReactNode }): React.ReactElement;
