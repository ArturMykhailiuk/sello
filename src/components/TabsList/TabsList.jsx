import clsx from "clsx";
import { Button } from "../Button/Button";
import styles from "./TabsList.module.css";
import { tabsForOwner, tabsForUser, TabKey } from "../../constants/common";

/**
 * @param {object} props
 * @param {boolean} props.isMyProfile
 * @param {string} props.activeTab
 * @param {(tabKey: string) => void} props.onTabChange
 * @param {object} props.user - User object with counts (servicesCount, aiWorkflowsCount, etc.)
 */
export const TabsList = ({ isMyProfile, activeTab, onTabChange, user }) => {
  const tabs = isMyProfile ? tabsForOwner : tabsForUser;

  const getTabCount = (tabKey) => {
    if (!user || tabKey === TabKey.PROFILE) return null;

    const countMap = {
      [TabKey.SERVICES]: user.servicesCount,
      [TabKey.WORKFLOWS]: user.aiWorkflowsCount,
      [TabKey.FAVORITES]: user.favoriteServicesCount,
      [TabKey.FOLLOWERS]: user.followersCount,
      [TabKey.FOLLOWING]: user.followingCount,
    };

    return countMap[tabKey] ?? null;
  };

  return (
    <div className={styles.tabs}>
      {tabs.map(({ key, label }) => {
        const count = getTabCount(key);
        const displayLabel = count !== null ? `${label} (${count})` : label;

        return (
          <Button
            key={key}
            onClick={() => onTabChange(key)}
            className={clsx(styles.tab, {
              [styles.active]: activeTab === key,
            })}
          >
            {displayLabel}
          </Button>
        );
      })}
    </div>
  );
};
