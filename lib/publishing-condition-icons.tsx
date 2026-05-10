import type { ReactElement } from "react";

export const PUBLISHING_CONDITION_ICON_KEYS = [
  "clipboard",
  "checklist",
  "shield",
  "scale",
  "clock",
  "file",
  "users",
  "edit",
  "alert",
  "globe",
  "book",
  "tag",
] as const;

export type PublishingConditionIconKey =
  (typeof PUBLISHING_CONDITION_ICON_KEYS)[number];

export const PUBLISHING_CONDITION_ICON_LABELS_AR: Record<
  PublishingConditionIconKey,
  string
> = {
  clipboard: "متطلبات",
  checklist: "قائمة تحقق",
  shield: "حقوق ومسؤوليات",
  scale: "تحكيم",
  clock: "مواعيد",
  file: "ملف البحث",
  users: "المؤلفون",
  edit: "أسلوب الكتابة",
  alert: "ملاحظات هامة",
  globe: "اللغة والمراجع",
  book: "المراجع",
  tag: "تصنيف",
};

export function isPublishingConditionIconKey(
  value: string,
): value is PublishingConditionIconKey {
  return (PUBLISHING_CONDITION_ICON_KEYS as readonly string[]).includes(value);
}

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export function PublishingConditionIcon({
  iconKey,
  className,
}: {
  iconKey: PublishingConditionIconKey;
  className?: string;
}): ReactElement {
  switch (iconKey) {
    case "clipboard":
      return (
        <svg {...common} className={className}>
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
          <path d="M9 10h6M9 14h6M9 18h4" />
        </svg>
      );
    case "checklist":
      return (
        <svg {...common} className={className}>
          <path d="M3 6h2l1 1 2-2" />
          <path d="M3 12h2l1 1 2-2" />
          <path d="M3 18h2l1 1 2-2" />
          <path d="M11 6h10M11 12h10M11 18h10" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} className={className}>
          <path d="M12 3 5 6v6c0 4 2.8 7.5 7 9 4.2-1.5 7-5 7-9V6z" />
          <path d="m9.2 12 1.8 1.9 3.8-3.8" />
        </svg>
      );
    case "scale":
      return (
        <svg {...common} className={className}>
          <path d="M12 3v18" />
          <path d="M5 7h14" />
          <path d="M5 7 2.5 13a3.5 3.5 0 0 0 5 0z" />
          <path d="m19 7-2.5 6a3.5 3.5 0 0 0 5 0z" />
          <path d="M8 21h8" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "file":
      return (
        <svg {...common} className={className}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );
    case "users":
      return (
        <svg {...common} className={className}>
          <circle cx="9" cy="9" r="3" />
          <path d="M3.8 19a5.2 5.2 0 0 1 10.4 0" />
          <path d="M15 8.5a2.5 2.5 0 1 1 0 5" />
          <path d="M18.5 18.5a4 4 0 0 0-2.8-3.8" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common} className={className}>
          <path d="M4 20h4l10-10-4-4L4 16z" />
          <path d="m12.5 7.5 4 4" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common} className={className}>
          <path d="M10.3 3.7 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3l-7.7-13.8a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v5M12 17.5h.01" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "book":
      return (
        <svg {...common} className={className}>
          <path d="M5 6.5a2.5 2.5 0 0 1 2.5-2.5H19v15.2a1.8 1.8 0 0 1-1.8 1.8H7.5A2.5 2.5 0 0 1 5 18.5z" />
          <path d="M8.5 4v17" />
          <path d="M11 8h6M11 11.5h6" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common} className={className}>
          <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z" />
          <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
