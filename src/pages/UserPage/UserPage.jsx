import { useParams } from "react-router";
import { Button } from "../../components/Button/Button";
import { Typography } from "../../components/Typography/Typography";
import styles from "./UserPage.module.css";
import { useCallback, useEffect, useState } from "react";
import {
  followUserById,
  getUserDataById,
  getUserFollowers,
  getUserFollowing,
  unfollowUserById,
  updateUserAvatar,
} from "../../services/users";
import { UserInfo } from "../../components/UserInfo/UserInfo";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, updateAvatar } from "../../store/auth/index.js";
// import { useBreakpoint } from "../../hooks/index.js";
import { openLogOut } from "../../store/auth";
import { TabsList } from "../../components/TabsList/TabsList";
import { SlidePanel } from "../../components/SlidePanel/SlidePanel";
import { ListItems } from "../../components/ListItems/ListItems";
import { normalizeHttpError } from "../../utils";
import toast from "react-hot-toast";
import {
  getServicesByUserId,
  getFavoriteServices,
} from "../../services/services";
import { TabKey, tabsForOwner, tabsForUser } from "../../constants/common";
import { appClearSessionAction } from "../../store/utils.js";
import { Container } from "../../components/UI/index.js";
import {
  Breadcrumbs,
  BreadcrumbsItem,
  BreadcrumbsDivider,
} from "../../components/Breadcrumbs/Breadcrumbs.jsx";
import { Pagination } from "../../components/Pagination/Pagination.jsx";
import { Modal } from "../../components/Modal/Modal";
import { N8nConnectionModal } from "../../components/N8nConnectionModal/N8nConnectionModal";
import { WorkflowExecutionModal } from "../../components/WorkflowExecutionModal/WorkflowExecutionModal";
import { checkN8nStatus } from "../../services/workflows";

const UserPage = () => {
  const { id } = useParams();
  const PAGE_LIMIT = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);

  // const breakpoint = useBreakpoint();
  // const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const isMyProfile = user?.id === currentUser?.id;

  const [activeTab, setActiveTab] = useState(TabKey.SERVICES);
  const [items, setItems] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userPageSidePanel");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });
  // const [n8nStatus, setN8nStatus] = useState(null);

  // Workflows modals state
  const [isN8nModalOpen, setIsN8nModalOpen] = useState(false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Tab icons for sidebar
  const getTabsWithIcons = () => {
    const iconMap = {
      [TabKey.PROFILE]: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      [TabKey.SERVICES]: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      [TabKey.WORKFLOWS]: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.27002 6.96L12 12.01L20.73 6.96"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22.08V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      [TabKey.FAVORITES]: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      [TabKey.FOLLOWERS]: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      [TabKey.FOLLOWING]: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 8V14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 11H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    };

    const tabs = isMyProfile ? tabsForOwner : tabsForUser;
    return tabs.map((tab) => ({
      ...tab,
      icon: iconMap[tab.key],
    }));
  };

  const handleTogglePanel = () => {
    setIsPanelOpen((prev) => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("userPageSidePanel", String(newValue));
      }
      return newValue;
    });
  };

  useEffect(() => {
    const loadUser = async () => {
      await fetchUserData(id);
      setPage(1);
      setTotalPages(1);
      setActiveTab(TabKey.SERVICES);
    };

    loadUser();
  }, [id]);

  const reloadData = useCallback(
    (pageToLoad) => {
      const pagination = { page: pageToLoad, limit: PAGE_LIMIT };

      const fetchTabData = async () => {
        try {
          let data = {};

          switch (activeTab) {
            case TabKey.SERVICES:
              data = await getServicesByUserId(id, pagination);
              break;
            case TabKey.FAVORITES:
              if (isMyProfile) {
                data = await getFavoriteServices(pagination);
              }
              break;
            case TabKey.FOLLOWERS:
              data = await getUserFollowers(id, pagination);
              break;
            case TabKey.FOLLOWING:
              if (isMyProfile) {
                data = await getUserFollowing(pagination);
              }
              break;
            case TabKey.WORKFLOWS:
              if (isMyProfile) {
                try {
                  // Check n8n status first
                  const status = await checkN8nStatus();
                  // setN8nStatus(status);

                  if (status.autoConnected) {
                    toast.success("Connected to existing n8n account");
                    // Reload user data to get updated n8nEnabled status
                    await fetchUserData(id);
                  }

                  // WorkflowsTabs will handle its own data loading
                  data = { items: [], total: 0 };
                } catch (error) {
                  console.error("Error checking n8n status:", error);
                  data = { items: [], total: 0 };
                }
              }
              break;
            default:
              data = {};
          }

          setItems(data?.items || []);
          setTotalPages(Math.ceil((data?.total || 0) / PAGE_LIMIT));
        } catch (err) {
          const error = normalizeHttpError(err);
          toast.error(error.message);
        }
      };

      fetchTabData();
    },
    [activeTab, id, isMyProfile],
  );

  useEffect(() => {
    if (user) {
      reloadData(page);
    }
  }, [user, page, reloadData]);

  const handleAvatarChange = async (file) => {
    try {
      const data = await updateUserAvatar(file);
      setUser((prev) => ({
        ...prev,
        avatarURL: data.avatarURL,
      }));
      dispatch(updateAvatar(data.avatarURL));
    } catch (err) {
      const error = normalizeHttpError(err);
      if (error.status === 401) dispatch(appClearSessionAction());
      toast.error(error.message);
    }
  };

  const handleFollow = async (userId = id) => {
    try {
      const data = await followUserById(userId);
      toast.success(data.message);

      // Refresh user data after follow
      await fetchUserData(id);
      reloadData(page);
    } catch (err) {
      const error = normalizeHttpError(err);
      if (error.status === 401) dispatch(appClearSessionAction());
      toast.error(error.message);
    }
  };

  const handleUnFollow = async (userId = id) => {
    try {
      const data = await unfollowUserById(userId);
      toast.success(data.message);

      // Refresh user data after unfollow
      await fetchUserData(id);
      if (page > 1 && items.length === 1) {
        setPage((prev) => prev - 1);
      } else {
        reloadData(page);
      }
    } catch (err) {
      const error = normalizeHttpError(err);
      if (error.status === 401) dispatch(appClearSessionAction());
      toast.error(error.message);
    }
  };

  const handleDelete = () => {
    if (page > 1 && items.length === 1) {
      setPage((prev) => prev - 1);
    } else {
      reloadData(page);
    }
  };

  const handleOpenLogOut = () => {
    dispatch(openLogOut());
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const fetchUserData = async (id) => {
    try {
      const data = await getUserDataById(id);
      setUser(data.user);
    } catch (err) {
      const error = normalizeHttpError(err);
      toast.error(error.message);
    }
  };

  const onPageChange = (newPage) => {
    setPage(newPage);
  };

  // Workflows handlers
  const handleConnectN8n = () => {
    setIsN8nModalOpen(true);
  };

  const handleCloseN8nModal = () => {
    setIsN8nModalOpen(false);
    // Reload user data and workflows after connection
    fetchUserData(id).then(() => {
      if (activeTab === TabKey.WORKFLOWS) {
        reloadData(page);
      }
    });
  };

  const handleExecuteWorkflow = (workflowId) => {
    const workflow = items.find((w) => w.id === workflowId);
    setSelectedWorkflow(workflow);
    setIsExecutionModalOpen(true);
  };

  const handleCloseExecutionModal = () => {
    setIsExecutionModalOpen(false);
    setSelectedWorkflow(null);
  };

  const handleViewWorkflow = (workflowId) => {
    // Navigate to workflow details or open n8n editor
    window.open(`https://sell-o.shop/n8n/workflow/${workflowId}`, "_blank");
  };

  if (!user)
    return <section className={styles.userPage}>User not found</section>;

  return (
    <Container className={styles.container}>
      <Breadcrumbs>
        <BreadcrumbsItem onClick={() => (window.location.href = "/")}>
          Головна
        </BreadcrumbsItem>
        <BreadcrumbsDivider />
        <BreadcrumbsItem isActive>
          Кабінет користувача - {user.name}
        </BreadcrumbsItem>
      </Breadcrumbs>
      <Typography variant="h2" className={styles.title}>
        Кабінет користувача
      </Typography>
      <button
        className={styles.togglePanelButton}
        onClick={handleTogglePanel}
        aria-label={isPanelOpen ? "Сховати панель" : "Показати панель"}
        aria-expanded={isPanelOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isPanelOpen ? (
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {isPanelOpen ? "Сховати панель" : "Показати панель"}
      </button>
      <div className={styles.separator}></div>
      <div className={styles.profileContainer}>
        {/* <div className={styles.profile}>
          <UserInfo
            user={user}
            isMyProfile={isMyProfile}
            onAvatarChange={handleAvatarChange}
          />
          {isMyProfile ? (
            <Button variant="uastyle" size="medium" onClick={handleOpenLogOut}>
              Вийти
            </Button>
          ) : user.isFollowed ? (
            <Button
              variant="uastyle"
              size="medium"
              bordered={true}
              onClick={() => handleUnFollow(id)}
            >
              Відписатися
            </Button>
          ) : (
            <Button
              variant="blue"
              size="medium"
              bordered={true}
              onClick={() => handleFollow(id)}
            >
              Підписатися
            </Button>
          )}
        </div> */}
        <div className={styles.profileTabs}>
          <SlidePanel
            isOpen={isPanelOpen}
            onToggle={handleTogglePanel}
            showToggleButton={false}
            tabs={getTabsWithIcons()}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          >
            <TabsList
              isMyProfile={isMyProfile}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              user={user}
              tabs={getTabsWithIcons()}
            />
          </SlidePanel>
          <div className={styles.content}>
            {activeTab === TabKey.PROFILE && (
              <div className={styles.profile}>
                <UserInfo
                  user={user}
                  isMyProfile={isMyProfile}
                  onAvatarChange={handleAvatarChange}
                />
                {isMyProfile ? (
                  <Button
                    variant="uastyle"
                    size="medium"
                    onClick={handleOpenLogOut}
                  >
                    Вийти
                  </Button>
                ) : user.isFollowed ? (
                  <Button
                    variant="uastyle"
                    size="medium"
                    bordered={true}
                    onClick={() => handleUnFollow(id)}
                  >
                    Відписатися
                  </Button>
                ) : (
                  <Button
                    variant="blue"
                    size="medium"
                    bordered={true}
                    onClick={() => handleFollow(id)}
                  >
                    Підписатися
                  </Button>
                )}
              </div>
            )}
            <ListItems
              tab={activeTab}
              items={items}
              isMyProfile={isMyProfile}
              onDelete={handleDelete}
              onFollow={handleFollow}
              onUnFollow={handleUnFollow}
              user={user}
              onConnectN8n={handleConnectN8n}
              onExecuteWorkflow={handleExecuteWorkflow}
              onViewWorkflow={handleViewWorkflow}
            />
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Pagination
                  totalPages={totalPages}
                  activePage={page}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflows Modals */}
      <Modal isOpen={isN8nModalOpen} closeModal={handleCloseN8nModal}>
        <N8nConnectionModal onClose={handleCloseN8nModal} />
      </Modal>

      <Modal
        isOpen={isExecutionModalOpen}
        closeModal={handleCloseExecutionModal}
      >
        {selectedWorkflow && (
          <WorkflowExecutionModal
            workflowId={selectedWorkflow.id}
            workflowName={selectedWorkflow.name}
            onClose={handleCloseExecutionModal}
          />
        )}
      </Modal>
    </Container>
  );
};

export default UserPage;
