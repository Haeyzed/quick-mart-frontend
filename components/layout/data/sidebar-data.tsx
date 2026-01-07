import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  Task01Icon,
  AppStoreIcon,
  Chat01Icon,
  UserIcon,
  ShieldCheck,
  Bug01Icon,
  LockPasswordFreeIcons,
  UserRemove01Icon,
  File01Icon,
  CloudOff,
  Building,
  Settings01Icon,
  UserSettings01Icon,
  Wrench01Icon,
  Palette,
  Notification01Icon,
  Monitor,
  HelpCircleIcon,
  CommandIcon,
  GripVertical,
  AudioWaveIcon,
} from "@hugeicons/core-free-icons"
import { type SidebarData } from '../types'

// Icon wrapper components for HugeIcons
const DashboardIcon = () => <HugeiconsIcon icon={Home01Icon} className="size-4" />
const TasksIcon = () => <HugeiconsIcon icon={Task01Icon} className="size-4" />
const AppsIconComponent = () => <HugeiconsIcon icon={AppStoreIcon} className="size-4" />
const ChatsIcon = () => <HugeiconsIcon icon={Chat01Icon} className="size-4" />
const UsersIcon = () => <HugeiconsIcon icon={UserIcon} className="size-4" />
const ShieldIcon = () => <HugeiconsIcon icon={ShieldCheck} className="size-4" />
const BugIcon = () => <HugeiconsIcon icon={Bug01Icon} className="size-4" />
const LockIcon = () => <HugeiconsIcon icon={LockPasswordFreeIcons} className="size-4" />
const UserXIcon = () => <HugeiconsIcon icon={UserRemove01Icon} className="size-4" />
const FileXIcon = () => <HugeiconsIcon icon={File01Icon} className="size-4" />
const ServerOffIconComponent = () => <HugeiconsIcon icon={CloudOff} className="size-4" />
const ConstructionIcon = () => <HugeiconsIcon icon={Building} className="size-4" />
const SettingsIcon = () => <HugeiconsIcon icon={Settings01Icon} className="size-4" />
const UserCogIcon = () => <HugeiconsIcon icon={UserSettings01Icon} className="size-4" />
const WrenchIcon = () => <HugeiconsIcon icon={Wrench01Icon} className="size-4" />
const PaletteIcon = () => <HugeiconsIcon icon={Palette} className="size-4" />
const BellIcon = () => <HugeiconsIcon icon={Notification01Icon} className="size-4" />
const MonitorIcon = () => <HugeiconsIcon icon={Monitor} className="size-4" />
const HelpCircleIconComponent = () => <HugeiconsIcon icon={HelpCircleIcon} className="size-4" />
const CommandIconComponent = () => <HugeiconsIcon icon={CommandIcon} className="size-4" />
const GalleryIcon = () => <HugeiconsIcon icon={GripVertical} className="size-4" />
const AudioIcon = () => <HugeiconsIcon icon={AudioWaveIcon} className="size-4" />

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Quick Mart',
      logo: CommandIconComponent,
      plan: 'Next.js + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryIcon,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioIcon,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: DashboardIcon,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: TasksIcon,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: AppsIconComponent,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: ChatsIcon,
        },
        {
          title: 'Users',
          url: '/users',
          icon: UsersIcon,
        },
        {
          title: 'Brands',
          url: '/brands',
          icon: CommandIconComponent,
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: ShieldIcon,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: BugIcon,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: LockIcon,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserXIcon,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileXIcon,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOffIconComponent,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: ConstructionIcon,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: SettingsIcon,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCogIcon,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: WrenchIcon,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: PaletteIcon,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: BellIcon,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: MonitorIcon,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircleIconComponent,
        },
      ],
    },
  ],
}

