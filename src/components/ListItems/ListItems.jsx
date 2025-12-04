import {
  emptyTabMessagesForOwner,
  emptyTabMessagesForUser,
  TabKey,
} from "../../constants/common";
import { ServicePreview } from "../ServicePreview/ServicePreview";
import { Typography } from "../Typography/Typography";
import styles from "./ListItems.module.css";
import { UserCard } from "../UserCard/UserCard.jsx";
import { WorkflowsTabs } from "../WorkflowsTabs/WorkflowsTabs.jsx";

/**
 * @param {object} props
 * @param {Array} props.items
 * @param {string} props.tab
 * @param {boolean} props.isMyProfile
 * @param {Function} props.onDelete — optional, callback to remove the item from UI after deletion
 * @param {object} props.user — user object for workflows tab
 * @param {Function} props.onConnectN8n — callback to connect n8n
 * @param {Function} props.onExecuteWorkflow — callback to execute workflow
 * @param {Function} props.onViewWorkflow — callback to view workflow
 */
export const ListItems = ({
  items,
  tab,
  isMyProfile,
  onDelete,
  onFollow,
  onUnFollow,
  user,
  onConnectN8n,
  onExecuteWorkflow,
  onViewWorkflow,
}) => {
  // Special case for workflows tab - use WorkflowsTabs component
  if (tab === TabKey.WORKFLOWS) {
    return (
      <WorkflowsTabs
        user={user}
        onConnectN8n={onConnectN8n}
        onExecuteWorkflow={onExecuteWorkflow}
        onViewWorkflow={onViewWorkflow}
      />
    );
  }

  if (!items || items.length === 0) {
    const messages = isMyProfile
      ? emptyTabMessagesForOwner
      : emptyTabMessagesForUser;
    const message = messages[tab] || "No data found.";

    return (
      <Typography textColor="black" className={styles.notFoundMsg}>
        {message}
      </Typography>
    );
  }

  const isServiceTab = [TabKey.SERVICES, TabKey.FAVORITES].includes(tab);
  const isUserTab = [TabKey.FOLLOWERS, TabKey.FOLLOWING].includes(tab);

  return (
    <div className={styles.listContainer}>
      {items.map((item) =>
        isServiceTab ? (
          <ServicePreview
            key={item.id}
            service={item}
            tab={tab}
            isMyProfile={isMyProfile}
            onDelete={onDelete}
          />
        ) : isUserTab ? (
          <UserCard
            key={item.id}
            user={item}
            tabType={tab}
            onFollow={onFollow}
            onUnfollow={onUnFollow}
          />
        ) : null,
      )}
    </div>
  );
};
