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
import { lazy, Suspense } from "react";

const N8nChat = lazy(() =>
  import("../N8nChat/N8nChat.jsx").then((module) => ({
    default: module.N8nChat,
  })),
);
import { TelegramBotWidget } from "../TelegramBotWidget/TelegramBotWidget.jsx";
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
  const [editingWorkflow, setEditingWorkflow] = useState(null); // null = створення, workflow = редагування
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Отримуємо фільтри з state (якщо прийшли зі сторінки з фільтрами)
  const filterCountry = state?.country;
  const filterCity = state?.city;

  const currentUser = useSelector(selectUser);
  const aiWorkflows = useSelector(selectAIWorkflows);

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

  // Find active Telegram Bot workflow
  const activeTelegramBot = aiWorkflows.find(
    (w) =>
      w.isActive &&
      w.aiTemplate?.name === "Telegram AI Bot" &&
      w.telegramBotUsername,
  );

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
    setEditingWorkflow(null); // Режим створення
    setIsAssistantModalOpen(true);
  };

  const handleCloseAssistantModal = () => {
    setIsAssistantModalOpen(false);
    setEditingWorkflow(null);
  };

  const handleEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow); // Режим редагування
    setIsAssistantModalOpen(true);
  };

  const handleOpenChat = (workflow) => {
    // Якщо це AI Chat workflow - відкриваємо чат
    if (workflow.aiTemplate?.name === "AI Chat") {
      setSelectedWorkflow(workflow);
      setIsChatModalOpen(true);
    } else {
      // Для інших типів workflows - відкриваємо редагування
      handleEditWorkflow(workflow);
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
      <Breadcrumbs className={css.breadcrumbs}>
        <BreadcrumbsItem onClick={() => navigate("/")}>Головна</BreadcrumbsItem>
        <BreadcrumbsDivider />
        <BreadcrumbsItem
          onClick={() => {
            const params = new URLSearchParams();
            if (service.category?.id)
              params.set("category", service.category.id);
            if (filterCountry) params.set("country", filterCountry);
            if (filterCity) params.set("city", filterCity);
            navigate(`/?${params.toString()}`);
          }}
          isActive={!filterCountry && !filterCity}
        >
          {service.category?.name || "Категорія"}
        </BreadcrumbsItem>
        {filterCountry && (
          <>
            <BreadcrumbsDivider />
            <BreadcrumbsItem
              onClick={() => {
                const params = new URLSearchParams();
                if (service.category?.id)
                  params.set("category", service.category.id);
                if (filterCountry) params.set("country", filterCountry);
                navigate(`/?${params.toString()}`);
              }}
            >
              {filterCountry}
            </BreadcrumbsItem>
          </>
        )}
        {filterCity && (
          <>
            <BreadcrumbsDivider />
            <BreadcrumbsItem
              onClick={() => {
                const params = new URLSearchParams();
                if (service.category?.id)
                  params.set("category", service.category.id);
                if (filterCountry) params.set("country", filterCountry);
                if (filterCity) params.set("city", filterCity);
                navigate(`/?${params.toString()}`);
              }}
            >
              {filterCity}
            </BreadcrumbsItem>
          </>
        )}
        <BreadcrumbsDivider />
        <BreadcrumbsItem isActive>{service.title}</BreadcrumbsItem>
      </Breadcrumbs>

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
          areas={service.areas}
          category={service.category}
          time={service.time}
          owner={service.owner}
          items={service.items}
          instructions={service.instructions}
          isFavorite={service.isFavorite}
          updateFavoriteStatus={updateFavoriteStatus}
          isOwner={isOwner}
        />
      </div>

      {isOwner && (
        <div className={css.aiSection}>
          <ServiceAIWorkflowsList
            serviceId={Number(serviceId)}
            workflows={aiWorkflows}
            onAddNew={handleOpenAssistantModal}
            onEdit={handleEditWorkflow}
          />
        </div>
      )}

      {isOwner && (
        <ServiceAIAssistantModal
          isOpen={isAssistantModalOpen}
          onClose={handleCloseAssistantModal}
          serviceId={Number(serviceId)}
          editingWorkflow={editingWorkflow}
          onWorkflowCreated={handleOpenChat}
        />
      )}

      {selectedWorkflow && (
        <Suspense fallback={null}>
          <N8nChat
            isOpen={isChatModalOpen}
            webhookUrl={selectedWorkflow.webhookUrl}
            workflowName={selectedWorkflow.name}
            onClose={handleCloseChat}
          />
        </Suspense>
      )}

      {activeTelegramBot && (
        <TelegramBotWidget
          botUsername={activeTelegramBot.telegramBotUsername}
          workflowName={activeTelegramBot.name}
        />
      )}
    </section>
  );
};
