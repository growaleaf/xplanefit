// XPlaneFit data — every number below traces to a source_url a pilot can open and check.
// buttons/axes/hats = physical input slots on the controller, from the manufacturer's own
// technical-specification text, independently fetched and quoted for this build 2026-10-08
// (not reused from CockpitFit/ViperFit/StarHOTAS/StukaFit's Thrustmaster entries without
// re-verifying each one — Principle XXII, read the primary source yourself).
//
// Honeycomb Alpha Flight Controls (yoke) and VKB Gladiator were both researched and dropped:
// neither manufacturer's current live product page states a single consolidated total for
// buttons/hats/axes (Honeycomb's page and FAQ describe features by hand/grip location only,
// VKB's current "NXT EVO" lineup splits grip and base specs with no combined total) — stating a
// number for either would mean summing ambiguous partial lists myself and presenting the guess
// as a manufacturer fact. Logitech X56 was also dropped for the same reason: the "13 axes, 5
// HATS, 31 buttons" figure used by this lane's sibling products (StukaFit, 2026-09-08) is no
// longer on the live logitechg.com page as of 2026-10-08 — the page now states only "189
// programmable controls" with no buttons/axes/hats breakdown, so re-using the old figure would
// mean sourcing a number the current primary source does not say.

const CONTROLLERS = [
  {
    id: "t16000m-fcs",
    name: "Thrustmaster T.16000M FCS",
    note: "joystick only, no throttle",
    buttons: 16,
    axes: 4,
    hats: 1,
    sources: [
      { label: "Thrustmaster — T.16000M FCS product page, fetched 2026-10-08: \"16 ACTION BUTTONS\", \"4 independent axes, including twist rudder\", \"one 8-way Point of View (PoV) hat switch\"", url: "https://www.thrustmaster.com/en-us/products/t-16000m-fcs/" }
    ]
  },
  {
    id: "t16000m-fcs-hotas",
    name: "Thrustmaster T.16000M FCS HOTAS",
    note: "joystick + TWCS Throttle bundle",
    buttons: 30,
    axes: 5,
    hats: 2,
    sources: [
      { label: "Thrustmaster — T.16000M FCS HOTAS product page, fetched 2026-10-08: \"this provides gamers with 5 axes, 30 buttons and two 8-way PoVs\"", url: "https://www.thrustmaster.com/en-us/products/t-16000m-fcs-hotas/" }
    ]
  },
  {
    id: "t-flight-hotas-x",
    name: "Thrustmaster T.Flight HOTAS X",
    note: "joystick + detachable throttle, entry-level. No hat switch stated on the page.",
    buttons: 12,
    axes: 5,
    hats: 0,
    sources: [
      { label: "Thrustmaster — T.Flight HOTAS X product page, fetched 2026-10-08 (en-gb catalog URL): \"12 action buttons and 5 axes\" — no hat switch mentioned anywhere on the page", url: "https://www.thrustmaster.com/en-gb/products/t-flight-hotas-x/" }
    ]
  },
  {
    id: "t16000m-fcs-space-sim-duo",
    name: "Thrustmaster T.16000M FCS Space Sim Duo",
    note: "two ambidextrous joysticks, no dedicated throttle. The bundle's own page states 30 buttons total (not 32 — read directly rather than assumed by doubling the single-stick count) and 2 hats (one per stick). Axes are not totaled on the bundle page, so the 8-axis figure here is this build's own sum of the single-stick page's \"4 independent axes\" x 2 sticks, disclosed as such rather than found pre-summed.",
    buttons: 30,
    axes: 8,
    hats: 2,
    sources: [
      { label: "Thrustmaster — T.16000M FCS Space Sim Duo product page, fetched 2026-10-08: \"30 ACTION BUTTONS\" total; \"A multidirectional point of view hat (8 directions)\" per stick (2 sticks = 2 hats)", url: "https://www.thrustmaster.com/en-us/products/t-16000m-fcs-space-sim-duo/" },
      { label: "Thrustmaster — T.16000M FCS product page (per-stick axis spec, same page cited above for the standalone joystick): \"4 independent axes\" — doubled here for the two-stick bundle", url: "https://www.thrustmaster.com/en-us/products/t-16000m-fcs/" }
    ]
  }
];

const CATEGORY_PRIORITY = ["Flight Controls", "Autopilot/FMS"];

// X-Plane 12 does not publish a per-aircraft-class control-count table the way IL-2 Great
// Battles' community spreadsheet or DCS's official module PDF manuals do (see this lane's
// CHARTER.md incumbent check, and this build's own research: the X-Plane 12 Desktop Manual at
// x-plane.com/support/manuals/desktop/ is a single very large page; its "Flying Helicopters"
// section could not be retrieved intact across four fetch attempts on 2026-10-08, which is why
// the helicopter class (Robinson R22 Beta II, X-Plane 12's other default) is NOT shipped this
// pass — CHARTER.md's failure protocol: drop a class that can't be defensibly sourced in budget
// rather than invent one. What DID fetch intact and in full, quoted verbatim below, are: (a) the
// manual's flight-control-axis/button assignment examples (pitch/roll/yaw/throttle/toe
// brakes/flaps — these are the manual's own generic worked examples, not aircraft-specific, so
// they are counted identically for both classes below), and (b) the full "Using the Autopilot"
// section's list of named autopilot modes.
const XP_MANUAL_FLIGHT_CONTROLS_SOURCE = {
  label: "X-Plane 12 Desktop Manual, \"Configuring and Tuning Your X-Plane Installation\" chapter, fetched 2026-10-08 — quotes: \"Move your joystick or yoke forward and back for pitch\", \"Move your joystick/yoke left and right for roll\", \"twist your joystick (if applicable)... set to yaw\" / \"the pedals control the rudder\", \"Move your throttle forward and back\", \"Press the left pedal down with your toes... set to left toe brake\" / \"set that bar to right toe brake\", \"two additional buttons to raise the flaps and lower them\", and (737-800 only) \"one button to raise and lower the landing gear\"",
  url: "https://www.x-plane.com/support/manuals/desktop/"
};
const XP_MANUAL_AUTOPILOT_SOURCE = {
  label: "X-Plane 12 Desktop Manual, \"Using the Autopilot\" section, fetched 2026-10-08 — 11 distinctly named modes/controls: On/Off, Wing Leveler, Pitch Sync, Heading, Altitude, Vertical Speed, Speed/IAS Hold, Flight Level Change, Auto-Throttle, Localizer (LOC), Glide Slope (G/S)",
  url: "https://www.x-plane.com/support/manuals/desktop/"
};
// Cessna 172SP fixed gear / fixed-pitch prop, used to exclude "Landing Gear" from the GA class
// below (the 737-800 has retractable gear, the default 172SP does not):
const C172SP_AIRFRAME_SOURCE_NOTE = "Cessna 172SP fixed-pitch propeller and fixed (\"Tri/Fixed\") landing gear, per the type's published specifications (McCauley 1A170E/JHA7660 fixed-pitch prop; Lycoming IO-360-L2A; no retractable gear) — checked 2026-10-08 so \"Landing Gear\" is correctly excluded from this class below rather than assumed.";

const TIERS = [
  {
    id: "ga-single-engine",
    tier_name: "GA Single-Engine (Cessna 172SP)",
    tier_note: "X-Plane 12's default GA single — fixed-pitch prop and fixed gear, so no prop lever and no retractable-gear control. " + C172SP_AIRFRAME_SOURCE_NOTE,
    core_functions: [
      { category: "Flight Controls", count: 7 }
    ],
    total_functions: 7,
    source_url: XP_MANUAL_FLIGHT_CONTROLS_SOURCE.url,
    source_note: XP_MANUAL_FLIGHT_CONTROLS_SOURCE.label
  },
  {
    id: "airliner-jet",
    tier_name: "Airliner / Jet (Boeing 737-800)",
    tier_note: "X-Plane 12's default airliner — retractable gear plus a full autopilot/FMS mode panel, which a single-engine fixed-gear trainer does not have.",
    core_functions: [
      { category: "Flight Controls", count: 8 },
      { category: "Autopilot/FMS", count: 11 }
    ],
    total_functions: 19,
    source_url: XP_MANUAL_AUTOPILOT_SOURCE.url,
    source_note: XP_MANUAL_FLIGHT_CONTROLS_SOURCE.label + " — Autopilot/FMS category: " + XP_MANUAL_AUTOPILOT_SOURCE.label
  }
];
