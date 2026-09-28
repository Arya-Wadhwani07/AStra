# Screen inventory

Every artboard in the prototype, generated from the page sources in `prototype/pages/`. Desktop boards are 1440px wide and mobile boards 390px. Screenshots are in `screens/desktop` and `screens/mobile`. "State" lists the local UI state each page keeps (with defaults) and "Actions" the buttons that change that state; "Links to" lists the pages it navigates to. Suggested routes are only a starting point.

## Public · landing, sign in and onboarding

### Landing

- **Suggested route:** `/`
- **Desktop** (`prototype/pages/Main.dc.html`, 1440x4820, screenshot `screens/desktop/Main.png`)
  - Components: AuroraText, Chip, CreatorSummary, FeedCard, Logo, MediaFrame, MotionLoop, MotionStage, StatusBadge
  - State: none
  - Actions: none
  - Links to: Admin, CollabCreate, CollabFind, Dashboard, Discover, Feed, Loyalty, Main, Profile, SignIn
- **Mobile** (`prototype/pages/LandingMobile.dc.html`, 390x4700, screenshot `screens/mobile/LandingMobile.png`)
  - Components: AuroraText, Chip, CreatorSummary, FeedCard, Logo, MediaFrame, MotionLoop, MotionStage, StatusBadge
  - State: none
  - Actions: none
  - Links to: AdminMobile, CollabFindMobile, DashboardMobile, FeedMobile, LandingMobile, LoyaltyMobile, ProfileMobile, SignInMobile

### Sign in / join

- **Suggested route:** `/signin`
- **Desktop** (`prototype/pages/SignIn.dc.html`, 1440x960, screenshot `screens/desktop/SignIn.png`)
  - Components: Banner, Button, Checkbox, Icon, Logo, OrbitingCircles, PasswordField, SegmentedControl, Tabs, TextField
  - State: `tab: 'signin', verify: false, role: 'audience'`
  - Actions: "Sign in", "Join", "Creator", "Audience", "Both", "Continue", "Create account", "Resend email", "Continue to my feed", "Set up my creator profile"
  - Links to: Dashboard, Main
- **Mobile** (`prototype/pages/SignInMobile.dc.html`, 390x1300, screenshot `screens/mobile/SignInMobile.png`)
  - Components: Banner, Button, Checkbox, Logo, PasswordField, SegmentedControl, Tabs, TextField
  - State: `tab: 'signin', verify: false, role: 'audience'`
  - Actions: "Sign in", "Join", "Creator", "Audience", "Both", "Continue", "Create account", "Resend email", "Continue to my feed", "Set up my creator profile"
  - Links to: DashboardMobile, LandingMobile, Mobile

### Onboarding · pick favorite creators

- **Suggested route:** `/onboarding`
- **Desktop** (`prototype/pages/Onboarding.dc.html`, 1440x1400, screenshot `screens/desktop/Onboarding.png`)
  - Components: Button, Chip, CreatorSummary, Icon, Logo, MediaFrame, MotionLoop
  - State: `picked: {}, disc: {}`
  - Actions: none
  - Links to: Feed, Main
- **Mobile** (`prototype/pages/OnboardingMobile.dc.html`, 390x1900, screenshot `screens/mobile/OnboardingMobile.png`)
  - Components: Button, Chip, Icon, Logo, MediaFrame, MotionLoop
  - State: `picked: {}, disc: {}`
  - Actions: none
  - Links to: FeedMobile, LandingMobile

## Audience · feed, creator profile, event, discover

### Audience feed

- **Suggested route:** `/feed`
- **Desktop** (`prototype/pages/Feed.dc.html`, 1440x3260, screenshot `screens/desktop/Feed.png`)
  - Components: Chip, CreatorSummary, FeedCard, Loading, PointsBalance, SideNav, Skeleton, TopBar
  - State: `f: 'all'`
  - Actions: none
  - Links to: Discover, Loyalty, Profile
- **Mobile** (`prototype/pages/FeedMobile.dc.html`, 390x2240, screenshot `screens/mobile/FeedMobile.png`)
  - Components: BottomNav, Chip, FeedCard, Skeleton, TopBar
  - State: `f: 'all'`
  - Actions: none
  - Links to: LoyaltyMobile

### Creator profile

- **Suggested route:** `/creators/mira-rao`
- **Desktop** (`prototype/pages/Profile.dc.html`, 1440x1700, screenshot `screens/desktop/Profile.png`)
  - Components: CreatorSummary, FeedCard, MediaFrame, SideNav, StatusBadge, Tabs, TopBar
  - State: `tab: 'work'`
  - Actions: "Work", "Events", "Merchandise"
  - Links to: Event
- **Mobile** (`prototype/pages/ProfileMobile.dc.html`, 390x2200, screenshot `screens/mobile/ProfileMobile.png`)
  - Components: BottomNav, CreatorSummary, FeedCard, MediaFrame, StatusBadge, Tabs, TopBar
  - State: `tab: 'work'`
  - Actions: "Work", "Events", "Merch"
  - Links to: EventMobile

### Event detail

- **Suggested route:** `/events/color-after-hours`
- **Desktop** (`prototype/pages/Event.dc.html`, 1440x2080, screenshot `screens/desktop/Event.png`)
  - Components: AvailabilityLabel, CreatorSummary, FeedCard, Icon, MediaFrame, PriceTag, QuantityStepper, SideNav, TopBar
  - State: none
  - Actions: none
  - Links to: Checkout
- **Mobile** (`prototype/pages/EventMobile.dc.html`, 390x1700, screenshot `screens/mobile/EventMobile.png`)
  - Components: AvailabilityLabel, BottomNav, CreatorSummary, Icon, MediaFrame, PriceTag, QuantityStepper, TopBar
  - State: none
  - Actions: none
  - Links to: CheckoutMobile, FeedMobile

### Discover creators

- **Suggested route:** `/discover`
- **Desktop** (`prototype/pages/Discover.dc.html`, 1440x2000, screenshot `screens/desktop/Discover.png`)
  - Components: Avatar, Chip, CreatorSummary, EmptyState, MediaFrame, SearchField, SideNav, StatusBadge, TopBar
  - State: `f: 'all', fav: { mira: true, jonah: true, priya: true, nia: true }`
  - Actions: none
  - Links to: Feed, Profile
- **Mobile** (`prototype/pages/DiscoverMobile.dc.html`, 390x2200, screenshot `screens/mobile/DiscoverMobile.png`)
  - Components: BottomNav, Chip, CreatorSummary, EmptyState, MediaFrame, SearchField, TopBar
  - State: `f: 'all', fav: { mira: true, jonah: true, priya: true, nia: true }`
  - Actions: none
  - Links to: FeedMobile, ProfileMobile

## Collaboration · creators only

### Find opportunities

- **Suggested route:** `/studio/collaborate`
- **Desktop** (`prototype/pages/CollabFind.dc.html`, 1440x1680, screenshot `screens/desktop/CollabFind.png`)
  - Components: Banner, Chip, CreatorSummary, EmptyState, OpportunityCard, SearchField, Select, SideNav, TopBar
  - State: `video: false, remote: false, open: false`
  - Actions: none
  - Links to: CollabCreate, CollabFind, Dashboard
- **Mobile** (`prototype/pages/CollabFindMobile.dc.html`, 390x2800, screenshot `screens/mobile/CollabFindMobile.png`)
  - Components: Banner, BottomNav, Chip, OpportunityCard, SearchField, TopBar
  - State: `video: false, open: false`
  - Actions: none
  - Links to: CollabCreateMobile, CollabFindMobile

### Create opportunity

- **Suggested route:** `/studio/collaborate/new`
- **Desktop** (`prototype/pages/CollabCreate.dc.html`, 1440x1900, screenshot `screens/desktop/CollabCreate.png`)
  - Components: Banner, Button, Chip, OpportunityCard, SegmentedControl, Select, SideNav, TextField, TopBar
  - State: `arr: 'paid', limit: 10`
  - Actions: none
  - Links to: CollabFind
- **Mobile** (`prototype/pages/CollabCreateMobile.dc.html`, 390x2600, screenshot `screens/mobile/CollabCreateMobile.png`)
  - Components: Banner, BottomNav, Chip, OpportunityCard, SegmentedControl, Select, TextField, TopBar
  - State: `arr: 'paid', limit: 10`
  - Actions: none
  - Links to: CollabFindMobile

### Respond to opportunity

- **Suggested route:** `/studio/collaborate/launch-reel`
- **Desktop** (`prototype/pages/CollabRespond.dc.html`, 1440x1500, screenshot `screens/desktop/CollabRespond.png`)
  - Components: Banner, EligibilityPanel, MessageBubble, OpportunityCard, PrivateMarker, ResponseForm, SideNav, TopBar
  - State: `sent: false`
  - Actions: "Send response"
  - Links to: sidebar and nav only
- **Mobile** (`prototype/pages/CollabRespondMobile.dc.html`, 390x2300, screenshot `screens/mobile/CollabRespondMobile.png`)
  - Components: BottomNav, EligibilityPanel, MessageBubble, OpportunityCard, PrivateMarker, ResponseForm, TopBar
  - State: `sent: false`
  - Actions: "Send response"
  - Links to: CollabFindMobile

## Commerce and loyalty

### Cart & checkout with points

- **Suggested route:** `/cart`
- **Desktop** (`prototype/pages/Checkout.dc.html`, 1440x1200, screenshot `screens/desktop/Checkout.png`)
  - Components: Banner, Button, CartItem, EmptyState, Icon, OrderSummary, Receipt, SegmentedControl, SideNav, StatusBadge, TextField, TopBar
  - State: `pts: 0, step: 'cart'`
  - Actions: "Place demo order", "Start demo checkout again", "Cart", "Remove", "Put the ticket back"
  - Links to: Feed, Loyalty
- **Mobile** (`prototype/pages/CheckoutMobile.dc.html`, 390x1900, screenshot `screens/mobile/CheckoutMobile.png`)
  - Components: Banner, BottomNav, Button, CartItem, EmptyState, Icon, OrderSummary, Receipt, SegmentedControl, StatusBadge, TextField, TopBar
  - State: `pts: 0, step: 'cart'`
  - Actions: "Place demo order", "Start demo checkout again", "Cart", "Remove", "Put the ticket back"
  - Links to: FeedMobile, LoyaltyMobile

### Loyalty history

- **Suggested route:** `/loyalty`
- **Desktop** (`prototype/pages/Loyalty.dc.html`, 1440x1400, screenshot `screens/desktop/Loyalty.png`)
  - Components: Banner, LedgerRow, PointsBalance, SegmentedControl, SideNav, StatusBadge, TopBar
  - State: `f: 'all'`
  - Actions: none
  - Links to: Feed
- **Mobile** (`prototype/pages/LoyaltyMobile.dc.html`, 390x2000, screenshot `screens/mobile/LoyaltyMobile.png`)
  - Components: BottomNav, LedgerRow, PointsBalance, SegmentedControl, TopBar
  - State: `f: 'all'`
  - Actions: none
  - Links to: sidebar and nav only

## Creator dashboard and admin

### Creator dashboard

- **Suggested route:** `/studio`
- **Desktop** (`prototype/pages/Dashboard.dc.html`, 1440x1500, screenshot `screens/desktop/Dashboard.png`)
  - Components: Banner, Button, ParticipantRow, ResponseCounter, SegmentedControl, SideNav, StatusBadge, TopBar, VerificationStatus
  - State: `cap: 20, eli: 'new'`
  - Actions: "Shortlist Eli", "Decline Eli", "Save limit"
  - Links to: CollabCreate, Community, CreatorLoyalty, CreatorOrders, Event, Insights, Messages, MyCollabs, Profile, ProfileEdit, Publish
- **Mobile** (`prototype/pages/DashboardMobile.dc.html`, 390x1800, screenshot `screens/mobile/DashboardMobile.png`)
  - Components: BottomNav, Button, ParticipantRow, ResponseCounter, SegmentedControl, TopBar, VerificationStatus
  - State: `cap: 20, eli: 'new'`
  - Actions: "Shortlist Eli", "Decline Eli"
  - Links to: CollabCreateMobile, CreatorLoyaltyMobile, CreatorOrdersMobile, InsightsMobile, MessagesMobile, MyCollabsMobile, ProfileEditMobile

### Admin review queue

- **Suggested route:** `/admin`
- **Desktop** (`prototype/pages/Admin.dc.html`, 1440x1200, screenshot `screens/desktop/Admin.png`)
  - Components: AdminCaseRow, AdminTable, AuditRow, Banner, Button, CreatorSummary, SegmentedControl, SideNav, StatusBadge, TextField, TopBar
  - State: `done: false`
  - Actions: "Record decision", "Cancel", "Approve", "Request details", "Reject"
  - Links to: Main
- **Mobile** (`prototype/pages/AdminMobile.dc.html`, 390x1900, screenshot `screens/mobile/AdminMobile.png`)
  - Components: AuditRow, Banner, Button, CreatorSummary, SegmentedControl, StatusBadge, TextField, TopBar
  - State: `done: false`
  - Actions: "Record decision", "Approve", "Request details", "Reject"
  - Links to: LandingMobile

## Account · notifications, settings, orders

### Notifications

- **Suggested route:** `/notifications`
- **Desktop** (`prototype/pages/Notifications.dc.html`, 1440x1100, screenshot `screens/desktop/Notifications.png`)
  - Components: Button, EmptyState, Icon, SideNav, StatusBadge, Tabs, TopBar
  - State: `tab: 'all', read: false`
  - Actions: "Mark all as read", "All", "Unread"
  - Links to: Settings
- **Mobile** (`prototype/pages/NotificationsMobile.dc.html`, 390x1500, screenshot `screens/mobile/NotificationsMobile.png`)
  - Components: BottomNav, Button, EmptyState, Icon, Tabs, TopBar
  - State: `tab: 'all', read: false`
  - Actions: "Mark all as read", "All", "Unread"
  - Links to: EventMobile, FeedMobile, LoyaltyMobile, OrdersMobile, SettingsMobile

### Settings

- **Suggested route:** `/settings`
- **Desktop** (`prototype/pages/Settings.dc.html`, 1440x1610, screenshot `screens/desktop/Settings.png`)
  - Components: Avatar, Banner, Button, ConsentCard, Icon, SideNav, Switch, TextField, TopBar
  - State: `saved: false, requested: false`
  - Actions: "Save changes", "Request account deletion"
  - Links to: Admin, CollabFind, Dashboard, Discover, Loyalty, Main, Notifications, Orders
- **Mobile** (`prototype/pages/SettingsMobile.dc.html`, 390x1900, screenshot `screens/mobile/SettingsMobile.png`)
  - Components: Avatar, Banner, BottomNav, Button, Icon, Switch, TopBar
  - State: `requested: false`
  - Actions: "Request account deletion", "More"
  - Links to: AdminMobile, CollabFindMobile, DashboardMobile, DiscoverMobile, LandingMobile, LoyaltyMobile, NotificationsMobile, OrdersMobile

### Your orders

- **Suggested route:** `/orders`
- **Desktop** (`prototype/pages/Orders.dc.html`, 1440x1200, screenshot `screens/desktop/Orders.png`)
  - Components: Banner, Button, DeliveryStatus, PointsBalance, Receipt, SideNav, StatusBadge, TopBar
  - State: `sel: 'A', helped: false`
  - Actions: "Get help with this order"
  - Links to: Event, Feed, Loyalty, Profile
- **Mobile** (`prototype/pages/OrdersMobile.dc.html`, 390x1700, screenshot `screens/mobile/OrdersMobile.png`)
  - Components: Banner, BottomNav, Button, DeliveryStatus, Receipt, StatusBadge, TopBar
  - State: `sel: 'A', helped: false`
  - Actions: "Get help with this order"
  - Links to: EventMobile

## Creator workspace · setup, publish, insights, loyalty, community, collaborations

### Creator setup and verification

- **Suggested route:** `/studio/setup`
- **Desktop** (`prototype/pages/CreatorSetup.dc.html`, 1440x1180, screenshot `screens/desktop/CreatorSetup.png`)
  - Components: Banner, Button, FileUpload, Icon, Logo, MediaFrame, SegmentedControl, Select, StatusBadge, TextField, VerificationStatus
  - State: `step: 1, vs: 'not_submitted'`
  - Actions: "Continue", "Back", "Skip for now", "Start verification", "Finish setup"
  - Links to: Main, Publish
- **Mobile** (`prototype/pages/CreatorSetupMobile.dc.html`, 390x1720, screenshot `screens/mobile/CreatorSetupMobile.png`)
  - Components: Banner, Button, FileUpload, Icon, Logo, MediaFrame, SegmentedControl, Select, StatusBadge, TextField, VerificationStatus
  - State: `step: 1, vs: 'not_submitted'`
  - Actions: "Continue", "Back", "Skip for now", "Start verification", "Finish setup"
  - Links to: LandingMobile, PublishMobile

### Edit creator profile

- **Suggested route:** `/studio/profile`
- **Desktop** (`prototype/pages/ProfileEdit.dc.html`, 1440x2060, screenshot `screens/desktop/ProfileEdit.png`)
  - Components: Banner, Button, Chip, CreatorSummary, FileUpload, Icon, MediaFrame, SideNav, StatusBadge, Switch, TextField, TopBar, VerificationStatus
  - State: none
  - Actions: "Save changes", "Discard changes", "Add discipline", "Add skill"
  - Links to: Profile
- **Mobile** (`prototype/pages/ProfileEditMobile.dc.html`, 390x2760, screenshot `screens/mobile/ProfileEditMobile.png`)
  - Components: Banner, BottomNav, Button, Chip, FileUpload, Icon, MediaFrame, StatusBadge, Switch, TextField, TopBar, VerificationStatus
  - State: none
  - Actions: "Save changes", "Discard changes", "Add discipline", "Add skill"
  - Links to: ProfileMobile

### Publish post, event or merchandise

- **Suggested route:** `/studio/publish`
- **Desktop** (`prototype/pages/Publish.dc.html`, 1440x2000, screenshot `screens/desktop/Publish.png`)
  - Components: AvailabilityLabel, Banner, Button, Dialog, EmptyState, FeedCard, FileUpload, Icon, MediaFrame, SegmentedControl, Select, SideNav, StatusBadge, Switch, TextField, Toast, TopBar
  - State: `type: 'post', aud: 'everyone', pts: true, soldOut: false, rights: false, ver: 'verified', life: 'editing', saved: false, dialog: false, err: false`
  - Actions: "Save draft", "Unpublish", "Delete", "Keep it", "Delete draft", "Start a new post", "Show rights and credits", "Hide rights and credits", "Show validation example", "Hide validation example"
  - Links to: CreatorSetup, Feed
- **Mobile** (`prototype/pages/PublishMobile.dc.html`, 390x3500, screenshot `screens/mobile/PublishMobile.png`)
  - Components: AvailabilityLabel, Banner, BottomNav, Button, Dialog, EmptyState, FeedCard, FileUpload, Icon, MediaFrame, SegmentedControl, Select, StatusBadge, Switch, TextField, Toast, TopBar
  - State: `type: 'post', aud: 'everyone', pts: true, soldOut: false, rights: false, ver: 'verified', life: 'editing', saved: false, dialog: false, err: false`
  - Actions: "Save draft", "Unpublish", "Delete", "Keep it", "Delete draft", "Start a new post", "Show rights and credits", "Hide rights and credits", "Show validation example", "Hide validation example"
  - Links to: CreatorSetupMobile, FeedMobile

### Creator menu

- **Suggested route:** `/studio/menu (mobile only)`
- **Mobile** (`prototype/pages/CreatorMenuMobile.dc.html`, 390x1520, screenshot `screens/mobile/CreatorMenuMobile.png`)
  - Components: BottomNav, CreatorSummary, Icon, RoleSwitch, StatusBadge, TopBar
  - State: none
  - Actions: "More"
  - Links to: LandingMobile, ProfileEditMobile, ProfileMobile

### Audience insights

- **Suggested route:** `/studio/insights`
- **Desktop** (`prototype/pages/Insights.dc.html`, 1440x1400, screenshot `screens/desktop/Insights.png`)
  - Components: Banner, Button, EmptyState, Icon, SegmentedControl, SideNav, Skeleton, TopBar
  - State: `period: '30', demo: 'loaded'`
  - Actions: "Try again"
  - Links to: CreatorOrders, Publish
- **Mobile** (`prototype/pages/InsightsMobile.dc.html`, 390x2440, screenshot `screens/mobile/InsightsMobile.png`)
  - Components: Banner, BottomNav, Button, EmptyState, Icon, SegmentedControl, Skeleton, TopBar
  - State: `period: '30', demo: 'loaded'`
  - Actions: "Try again"
  - Links to: CreatorOrdersMobile

### Creator orders

- **Suggested route:** `/studio/orders`
- **Desktop** (`prototype/pages/CreatorOrders.dc.html`, 1440x1240, screenshot `screens/desktop/CreatorOrders.png`)
  - Components: Banner, Button, Chip, DeliveryStatus, EmptyState, Icon, SideNav, StatusBadge, TextField, TopBar
  - State: `filter: 'all', sel: 'AST-24809', shipped: false, open: ''`
  - Actions: "Mark as shipped", "Show all orders"
  - Links to: Insights
- **Mobile** (`prototype/pages/CreatorOrdersMobile.dc.html`, 390x2400, screenshot `screens/mobile/CreatorOrdersMobile.png`)
  - Components: Banner, BottomNav, Button, Chip, DeliveryStatus, EmptyState, Icon, StatusBadge, TextField, TopBar
  - State: `filter: 'all', sel: 'AST-24809', shipped: false, open: 'AST-24809'`
  - Actions: "Mark as shipped", "Show all orders"
  - Links to: sidebar and nav only

### Creator loyalty settings

- **Suggested route:** `/studio/loyalty`
- **Desktop** (`prototype/pages/CreatorLoyalty.dc.html`, 1440x1960, screenshot `screens/desktop/CreatorLoyalty.png`)
  - Components: Banner, Button, Checkbox, Icon, LedgerRow, SegmentedControl, Select, SideNav, StatusBadge, TextField, TopBar
  - State: `cap: 20, tix: true, merch: true, saved: false, draftSaved: false, submitted: false`
  - Actions: "Save limit", "Save draft", "Submit for review"
  - Links to: sidebar and nav only
- **Mobile** (`prototype/pages/CreatorLoyaltyMobile.dc.html`, 390x3500, screenshot `screens/mobile/CreatorLoyaltyMobile.png`)
  - Components: Banner, BottomNav, Button, Checkbox, Icon, LedgerRow, SegmentedControl, Select, StatusBadge, TextField, TopBar
  - State: `cap: 20, tix: true, merch: true, saved: false, draftSaved: false, submitted: false`
  - Actions: "Save limit", "Save draft", "Submit for review"
  - Links to: sidebar and nav only

### Creator community

- **Suggested route:** `/studio/community`
- **Desktop** (`prototype/pages/Community.dc.html`, 1440x2550, screenshot `screens/desktop/Community.png`)
  - Components: Avatar, Banner, Button, Chip, CreatorSummary, Icon, MediaFrame, OpportunityCard, PrivateMarker, SideNav, StatusBadge, TextField, TopBar
  - State: `filter: 'all', posted: false, reported: false`
  - Actions: "All", "Work in progress", "Opportunities", "Events", "Post to community", "Report", "Message Jonah", "Message Eli", "Message"
  - Links to: CollabCreate, MyCollabs
- **Mobile** (`prototype/pages/CommunityMobile.dc.html`, 390x3500, screenshot `screens/mobile/CommunityMobile.png`)
  - Components: Banner, BottomNav, Button, Chip, CreatorSummary, Icon, MediaFrame, OpportunityCard, PrivateMarker, StatusBadge, TextField, TopBar
  - State: `filter: 'all', posted: false, reported: false`
  - Actions: "All", "Work in progress", "Opportunities", "Events", "Post to community", "Report", "Message Jonah", "Message Eli", "Message"
  - Links to: CollabCreateMobile, MyCollabsMobile

### My collaborations

- **Suggested route:** `/studio/collaborations`
- **Desktop** (`prototype/pages/MyCollabs.dc.html`, 1440x1480, screenshot `screens/desktop/MyCollabs.png`)
  - Components: Banner, BriefStatus, Button, Checkbox, Icon, ParticipantRow, ResponseCounter, SegmentedControl, SideNav, StatusBadge, TopBar
  - State: `stage: 'responses', eli: 'new', rae: 'new', ver: 1, miraOk: false, eliOk: false, edited: false, withdrawn: false, reported: false, m1: true, m2: false, m3: false`
  - Actions: "Shortlist Eli", "Decline Rae", "Open conversation", "Draft brief", "Confirm as Mira", "Demo: confirm as Eli", "Edit brief", "Go to active project", "Withdraw from project", "Reset demo", "Report a problem"
  - Links to: CollabCreate, CollabFind, CollabRespond, MyCollabs
- **Mobile** (`prototype/pages/MyCollabsMobile.dc.html`, 390x2350, screenshot `screens/mobile/MyCollabsMobile.png`)
  - Components: Banner, BottomNav, BriefStatus, Button, Checkbox, Icon, ParticipantRow, ResponseCounter, SegmentedControl, StatusBadge, TopBar
  - State: `stage: 'responses', eli: 'new', rae: 'new', ver: 1, miraOk: false, eliOk: false, edited: false, withdrawn: false, reported: false, m1: true, m2: false, m3: false`
  - Actions: "Shortlist Eli", "Decline Rae", "Open conversation", "Draft brief", "Confirm as Mira", "Demo: confirm as Eli", "Edit brief", "Go to active project", "Withdraw from project", "Reset demo", "Report a problem"
  - Links to: CollabCreateMobile, CollabFindMobile, CollabRespondMobile, MyCollabsMobile

### Messages

- **Suggested route:** `/studio/messages`
- **Desktop** (`prototype/pages/Messages.dc.html`, 1440x1040, screenshot `screens/desktop/Messages.png`)
  - Components: Avatar, Banner, Button, CreatorSummary, Icon, MessageBubble, SideNav, TextField, TopBar
  - State: `open: 'eli', view: 'list', draft: '', err: false, extra: { eli: [], jonah: [], priya: [] }, seen: {}, reported: '', blocked: ''`
  - Actions: "Eli Chen", "Jonah Lee", "Priya Nair", "Back to messages", "Send", "Report", "Block", "Unblock"
  - Links to: MyCollabs
- **Mobile** (`prototype/pages/MessagesMobile.dc.html`, 390x1500, screenshot `screens/mobile/MessagesMobile.png`)
  - Components: Avatar, Banner, BottomNav, Button, CreatorSummary, Icon, MessageBubble, TextField, TopBar
  - State: `open: 'eli', view: 'list', draft: '', err: false, extra: { eli: [], jonah: [], priya: [] }, seen: {}, reported: '', blocked: ''`
  - Actions: "Eli Chen", "Jonah Lee", "Priya Nair", "Back to messages", "Send", "Report", "Block", "Unblock"
  - Links to: MyCollabsMobile
