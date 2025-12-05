import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsItem,
} from "../Breadcrumbs/Breadcrumbs.jsx";
import { ServiceMainInfo } from "../ServiceMainInfo/index.js";
import { ServiceAIWorkflowsList } from "../ServiceAIWorkflowsList/ServiceAIWorkflowsList.jsx";
import { ServiceAIAssistantModal } from "../ServiceAIAssistantModal/ServiceAIAssistantModal.jsx";
import { N8nChat } from "../N8nChat/N8nChat.jsx";
import Loader from "../Loader/Loader.jsx";
import { normalizeHttpError } from "../../utils/index.js";
import { getServiceById } from "../../services/services.js";
import { selectUser } from "../../store/auth/index.js";
import {
  fetchServiceAIWorkflows,
  selectAIWorkflows,
} from "../../store/aiWorkflows/index.js";

import css from "./ServiceInfo.module.css";
import NotFound from "../../pages/NotFound/NotFound.jsx";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg?react";

export const ServiceInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const goBackPath = useRef(state?.from ?? "/");

  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const currentUser = useSelector(selectUser);
  const aiWorkflows = useSelector(selectAIWorkflows) || [];

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const service = await getServiceById(serviceId);
        setService(service);

        // Load AI workflows for all users to show chat icon
        dispatch(fetchServiceAIWorkflows(serviceId));
      } catch (err) {
        const { message, status } = normalizeHttpError(err);
        if (status !== 404) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, dispatch]);

  const isOwner = currentUser && service?.owner?.id === currentUser.id;

  // Автоматично відкриваємо чат при заході на сторінку, якщо є активний AI Chat workflow
  useEffect(() => {
    if (aiWorkflows.length > 0 && !selectedWorkflow) {
      const aiChatWorkflow = aiWorkflows.find(
        (w) => w.isActive && w.aiTemplate?.name === "AI Chat",
      );
      if (aiChatWorkflow) {
        setSelectedWorkflow(aiChatWorkflow);
        setIsChatModalOpen(true);
      }
    }
  }, [aiWorkflows, selectedWorkflow]);

  // Cleanup при розмонтуванні компонента (коли користувач покидає сторінку)
  useEffect(() => {
    return () => {
      // Закриваємо чат
      setIsChatModalOpen(false);
      setSelectedWorkflow(null);

      // Примусово видаляємо n8n віджет з DOM
      setTimeout(() => {
        const chatWidget = document.querySelector(".n8n-chat");
        if (chatWidget) {
          chatWidget.remove();
        }
      }, 0);
    };
  }, []);

  // Автоматично відкриваємо чат після активації workflow (тільки для AI Chat)
  useEffect(() => {
    if (selectedWorkflow && !isChatModalOpen) {
      const currentWorkflow = aiWorkflows.find(
        (w) => w.id === selectedWorkflow.id,
      );

      // Якщо workflow активовано і це AI Chat - відкриваємо чат
      if (
        currentWorkflow &&
        currentWorkflow.isActive &&
        currentWorkflow.aiTemplate?.name === "AI Chat"
      ) {
        setIsChatModalOpen(true);
      }
    }
  }, [aiWorkflows, selectedWorkflow, isChatModalOpen]);

  // Автоматично закриваємо чат якщо workflow було видалено або деактивовано
  useEffect(() => {
    if (selectedWorkflow && isChatModalOpen) {
      const currentWorkflow = aiWorkflows.find(
        (w) => w.id === selectedWorkflow.id,
      );

      // Якщо workflow видалено або деактивовано - закриваємо чат
      if (!currentWorkflow || currentWorkflow.isActive === false) {
        // Тільки закриваємо чат, але зберігаємо selectedWorkflow для можливості повторної активації
        setIsChatModalOpen(false);
      }
    }

    // Якщо workflow видалено зовсім - очищаємо selectedWorkflow
    if (selectedWorkflow) {
      const workflowExists = aiWorkflows.find(
        (w) => w.id === selectedWorkflow.id,
      );
      if (!workflowExists) {
        setTimeout(() => {
          setSelectedWorkflow(null);
        }, 100);
      }
    }
  }, [aiWorkflows, selectedWorkflow, isChatModalOpen]);

  const updateFavoriteStatus = (isFavorite) => {
    setService((prev) => ({ ...prev, isFavorite }));
  };

  const handleOpenAssistantModal = () => {
    setIsAssistantModalOpen(true);
  };

  const handleCloseAssistantModal = () => {
    setIsAssistantModalOpen(false);
  };

  const handleOpenChat = (workflow) => {
    // Якщо це AI Chat workflow - відкриваємо чат
    if (workflow.aiTemplate?.name === "AI Chat") {
      setSelectedWorkflow(workflow);
      setIsChatModalOpen(true);
    } else {
      // Для інших типів workflows - тут буде логіка редагування
      // Поки що просто показуємо повідомлення
      console.log("Edit workflow:", workflow);
      // TODO: Додати модальне вікно для редагування workflow
    }
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedWorkflow(null);
  };

  const handleBackClick = () => {
    navigate(goBackPath.current);
  };

  if (loading) return <Loader />;

  if (!service) return <NotFound />;

  return (
    <section>
      <button
        className={css.servicesBackButton}
        type="button"
        onClick={handleBackClick}
      >
        <ArrowLeftIcon className={css.servicesBackIcon} />
        Повернутись
      </button>

      <div className={css.detailsBlock}>
        <ServiceMainInfo
          serviceId={service.id}
          imgURL={service.thumb}
          title={service.title}
          description={service.description}
          category={service.category}
          time={service.time}
          owner={service.owner}
          items={service.items}
          instructions={service.instructions}
          isFavorite={service.isFavorite}
          updateFavoriteStatus={updateFavoriteStatus}
        />
      </div>

      {isOwner && (
        <div className={css.aiSection}>
          <ServiceAIWorkflowsList
            serviceId={Number(serviceId)}
            workflows={aiWorkflows}
            onAddNew={handleOpenAssistantModal}
            onChat={handleOpenChat}
          />
        </div>
      )}

      {isOwner && (
        <ServiceAIAssistantModal
          isOpen={isAssistantModalOpen}
          onClose={handleCloseAssistantModal}
          serviceId={Number(serviceId)}
          onWorkflowCreated={handleOpenChat}
        />
      )}

      {selectedWorkflow && (
        <N8nChat
          isOpen={isChatModalOpen}
          webhookUrl={selectedWorkflow.webhookUrl}
          workflowName={selectedWorkflow.name}
          onClose={handleCloseChat}
        />
      )}
    </section>
  );
};
