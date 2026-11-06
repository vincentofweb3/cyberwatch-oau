import {
  BookOpenCheck,
  KeyRound,
  Link2Off,
  MessagesSquare,
  ShieldAlert,
  Smartphone,
} from "lucide-react";

export const awarenessGuides = [
  {
    slug: "spot-phishing",
    title: "Spot a phishing message",
    summary: "Pause when a message creates urgency, fear, secrecy, or an unusual reward.",
    icon: ShieldAlert,
    points: [
      "Check the full sender address, not only the display name.",
      "Open official portals from a saved address instead of a message link.",
      "Treat requests for passwords, OTPs, recovery codes, or payment as hostile.",
    ],
  },
  {
    slug: "verify-identity",
    title: "Verify an identity",
    summary: "A familiar photograph, name, or title does not prove who controls an account.",
    icon: MessagesSquare,
    points: [
      "Contact the person using a number or channel you already trust.",
      "Do not use the contact details supplied in the suspicious message.",
      "Ask a question an impersonator is unlikely to answer correctly.",
    ],
  },
  {
    slug: "protect-account",
    title: "Protect a compromised account",
    summary: "Act quickly from a trusted device when credentials may have been exposed.",
    icon: KeyRound,
    points: [
      "Change the password and any reused passwords.",
      "Enable multi-factor authentication and save recovery codes safely.",
      "Review active sessions, recovery details, and recent forwarding rules.",
    ],
  },
  {
    slug: "handle-links",
    title: "Handle suspicious links safely",
    summary: "Do not turn the reporting platform into a link-testing sandbox.",
    icon: Link2Off,
    points: [
      "Do not visit the link again just to capture evidence.",
      "Copy only the visible text or destination if it can be done safely.",
      "Never upload malware or forward a malicious attachment to other people.",
    ],
  },
  {
    slug: "secure-device",
    title: "Contain an affected device",
    summary: "Reduce spread while preserving the information a responder may need.",
    icon: Smartphone,
    points: [
      "Disconnect from networks if malware or active compromise is suspected.",
      "Do not wipe or reinstall the device before receiving qualified guidance.",
      "Record the time, warning message, and actions immediately before the issue.",
    ],
  },
  {
    slug: "preserve-evidence",
    title: "Preserve useful evidence",
    summary: "Good evidence helps responders understand impact without collecting excess data.",
    icon: BookOpenCheck,
    points: [
      "Keep the original message, sender details, date, and visible destination.",
      "Redact unrelated personal conversations before sharing screenshots.",
      "Never include passwords, OTPs, recovery codes, or full payment-card details.",
    ],
  },
];
