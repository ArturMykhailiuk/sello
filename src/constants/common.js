export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

export const DEFAULT_ERROR_MESSAGE = "Something went wrong. Try again.";

export const TabKey = {
  PROFILE: "profile",
  SERVICES: "services",
  FAVORITES: "favorites",
  FOLLOWERS: "followers",
  FOLLOWING: "following",
  WORKFLOWS: "workflows",
};

export const tabsForOwner = [
  { key: TabKey.PROFILE, label: "Профіль" },
  { key: TabKey.SERVICES, label: "Послуги" },
  { key: TabKey.WORKFLOWS, label: "ШІ сценарії" },
  { key: TabKey.FAVORITES, label: "Вподобання" },
  { key: TabKey.FOLLOWERS, label: "Підписники" },
  { key: TabKey.FOLLOWING, label: "Підписки" },
];

export const tabsForUser = [
  { key: TabKey.PROFILE, label: "Профіль" },
  { key: TabKey.SERVICES, label: "Послуги" },
  { key: TabKey.FOLLOWERS, label: "Підписники" },
  { key: TabKey.FOLLOWING, label: "Підписки" },
];

export const emptyTabMessagesForOwner = {
  profile:
    "Your profile is currently empty. Add some information about yourself to let others know more about you.",
  services:
    "Nothing has been added to your services list yet. Please browse our services and add your favorites for easy access in the future.",
  favorites:
    "Nothing has been added to your favorite services list yet. Please browse our services and add your favorites for easy access in the future.",
  followers:
    "There are currently no followers on your account. Please engage our visitors with interesting content and draw their attention to your profile.",
  following:
    "Your account currently has no subscriptions to other users. Learn more about our users and select those whose content interests you.",

  workflows:
    "You have not created any workflows yet. Start by adding new workflows to manage your tasks efficiently.",
};

export const emptyTabMessagesForUser = {
  services:
    "This user hasn't added any services yet. Check back later to see if they've shared something tasty!",
  followers:
    "No one is following this user yet. Be the first to follow and stay updated on their activity.",
};
