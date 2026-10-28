import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Icon>
);

export const TargetIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.4-3.5 4.3-5.5 7.5-5.5s6.1 2 7.5 5.5" />
  </Icon>
);

export const BriefcaseIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="7.5" width="18" height="12" rx="1.8" />
    <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
    <path d="M3 12.5h18" />
  </Icon>
);

export const BuildingIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="3" width="11" height="18" rx="1" />
    <rect x="15" y="9" width="5" height="12" rx="1" />
    <path d="M7.5 7h1M11 7h1M7.5 10.5h1M11 10.5h1M7.5 14h1M11 14h1" />
  </Icon>
);

export const Building2Icon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="7" width="8" height="14" rx="1" />
    <rect x="13" y="3" width="8" height="18" rx="1" />
    <path d="M6 10.5h2M6 14h2M6 17.5h2M16 7h2M16 10.5h2M16 14h2M16 17.5h2" />
  </Icon>
);

export const CheckSquareIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M8 12l2.5 2.5L16 9" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </Icon>
);

export const MessageIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5.5h16v11.5H9l-4 3.5V17H4z" />
  </Icon>
);

export const UsersGroupIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15.5 13a4.5 4.5 0 0 1 5 4.2" />
  </Icon>
);

export const PlugIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 3v4M15 3v4" />
    <path d="M6.5 7h11l-.6 6a5 5 0 0 1-4.9 4.5v4" />
    <path d="M9 21.5h6" />
  </Icon>
);

export const LogOutIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
    <path d="M14 15l4-3-4-3" />
    <path d="M18 12H9" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);

export const FlameIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.5c1 3 .3 4.2-1 5.8-1.4 1.7-2 3-2 4.7a4.8 4.8 0 0 0 9.5 1c.4-2-.3-3.4-1.3-4.6 0 1.5-.6 2-1.2 2.3.4-2.6-.6-4.5-2-5.5.2 1.1 0 1.9-.6 2.5-.3-2.5-.9-4.6-1.4-6.2z" />
  </Icon>
);

export const ThermometerIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0z" />
  </Icon>
);

export const PhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4h3.2l1.3 4.5-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 4.5 1.3V18a2 2 0 0 1-2 2A15 15 0 0 1 3 5a2 2 0 0 1 2-1z" />
  </Icon>
);

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5L12 13l8.5-6.5" />
  </Icon>
);

export const MapPinIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 10.5a6 6 0 1 1 12 0c0 4 1.3 5.5 1.3 5.5H4.7S6 14.5 6 10.5z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Icon>
);

export const DotIcon = (p: IconProps) => (
  <svg width={8} height={8} viewBox="0 0 8 8" {...p}>
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
);
