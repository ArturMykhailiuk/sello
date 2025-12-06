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
import { useBreakpoint } from "../../hooks/index.js";
import { openLogOut } from "../../store/auth";
import { TabsList } from "../../components/TabsList/TabsList";
import { ListItems } from "../../components/ListItems/ListItems";
import { normalizeHttpError } from "../../utils";
import toast from "react-hot-toast";
import {
  getServicesByUserId,
  getFavoriteServices,
} from "../../services/services";
import { TabKey } from "../../constants/common";
import { appClearSessionAction } from "../../store/utils.js";
import { Container } from "../../components/UI/index.js";
import { PathInfo } from "../../components/PathInfo/PathInfo.jsx";
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

  const breakpoint = useBreakpoint();
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const isMyProfile = user?.id === currentUser?.id;

  const [activeTab, setActiveTab] = useState(TabKey.SERVICES);
  const [items, setItems] = useState([]);
  // const [n8nStatus, setN8nStatus] = useState(null);

  // Workflows modals state
  const [isN8nModalOpen, setIsN8nModalOpen] = useState(false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

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
                  console.log("n8n status:", status);
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
      <PathInfo current={user.name} />
      <Typography variant="h2" className={styles.title}>
        Панель користувача
      </Typography>
      <Typography
        variant="body"
        textColor={isMobile ? "black" : "gray"}
        className={styles.description}
      >
        Об’єднуймо наші зусилля, знання та таланти, щоб створювати послуги, які
        надихають і приносять цінність кожному клієнтові.
      </Typography>
      <div className={styles.profileContainer}>
        <div className={styles.profile}>
          <UserInfo
            user={user}
            isMyProfile={isMyProfile}
            onAvatarChange={handleAvatarChange}
          />
          {isMyProfile ? (
            <Button
              variant="blue"
              bordered={true}
              size="medium"
              onClick={handleOpenLogOut}
            >
              Вийти
            </Button>
          ) : user.isFollowed ? (
            <Button
              variant="blue"
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
        <div className={styles.profileTabs}>
          <TabsList
            isMyProfile={isMyProfile}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
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
