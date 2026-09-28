# DeliveryStatus

Payment, order and confirmation-email status as three separate facts; `Receipt` wraps it with the order header.

**Consumer provides:** `DeliveryStatus` — `payment` (`processing` | `paid` | `declined` | `cancelled` | `checking` | `refunded`), `order` (`confirmed` | `fulfilled` | `shipped` | `none` | `refunded`), `email` (`queued` | `sent` | `delayed` | `failed`). `Receipt` — `id`, `date`, `order`, `email`, children.

- A confirmed order stays confirmed even if the email is delayed or fails; the receipt is always in Orders.
- Paid/confirmed is distinct from shipped/fulfilled. Declined/cancelled shows "No order created" and preserves the cart.
- A timeout shows "Checking status" before any retry so nobody pays twice.
- Never shows full card numbers.
