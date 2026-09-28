# ConsentCard

A connected-app card: provider, purpose, permissions, retention, status and connect/disconnect.

**Consumer provides:** `provider`, `purpose`, `permissions` (list), optional `never` (list), `retention`, `status` (`unconnected` | `connected` | `expired` | `denied` | `unavailable` | `disconnected`), `lastSync`, `icon`.

- Permissions are reviewed before connecting; consent is never pre-granted. Disconnecting states that orders, content and points are unaffected.
- Demo providers are generic until a real integration is approved. A connection is not proof that every listen or view can be verified.
- Core feed, commerce and account features remain usable without any connection.
