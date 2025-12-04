// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { useDispatch, useSelector } from "react-redux";
// import { Typography } from "../Typography/Typography";
// import { Button } from "../Button/Button";
// import { ServiceAIWorkflowCard } from "../ServiceAIWorkflowCard/ServiceAIWorkflowCard";
// import { ServiceAIAssistantModal } from "../ServiceAIAssistantModal/ServiceAIAssistantModal";
// import { N8nChat } from "../N8nChat/N8nChat";
// import {
//   selectUserAIWorkflows,
//   selectUserAIWorkflowsLoading,
// } from "../../store/aiWorkflows/selectors";
// import {
//   fetchUserAIWorkflows,
//   deleteAIWorkflow,
// } from "../../store/aiWorkflows/operations";
// import Loader from "../Loader/Loader";
// import toast from "react-hot-toast";

// import css from "./UserAIWorkflowsList.module.css";

// /**
//  * Component to display and manage all AI assistants across user's services
//  */
// export const UserAIWorkflowsList = () => {
//   const dispatch = useDispatch();
//   const workflows = useSelector(selectUserAIWorkflows);
//   const loading = useSelector(selectUserAIWorkflowsLoading);

//   const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
//   const [isChatModalOpen, setIsChatModalOpen] = useState(false);
//   const [selectedWorkflow, setSelectedWorkflow] = useState(null);
//   const [editingWorkflow, setEditingWorkflow] = useState(null);

//   useEffect(() => {
//     console.log("UserAIWorkflowsList: Fetching workflows...");
//     dispatch(fetchUserAIWorkflows());
//   }, [dispatch]);

//   console.log("UserAIWorkflowsList render:", { workflows, loading });

//   const handleOpenEditModal = (workflow) => {
//     setEditingWorkflow(workflow);
//     setIsAssistantModalOpen(true);
//   };

//   const handleCloseAssistantModal = () => {
//     setIsAssistantModalOpen(false);
//     setEditingWorkflow(null);
//     // Reload workflows after create/edit
//     dispatch(fetchUserAIWorkflows());
//   };

//   const handleOpenChat = (workflow) => {
//     setSelectedWorkflow(workflow);
//     setIsChatModalOpen(true);
//   };

//   const handleCloseChat = () => {
//     setIsChatModalOpen(false);
//     setSelectedWorkflow(null);
//   };

//   const handleDelete = async (workflowId) => {
//     if (!window.confirm("Are you sure you want to delete this AI assistant?")) {
//       return;
//     }

//     try {
//       await dispatch(deleteAIWorkflow(workflowId)).unwrap();
//       toast.success("AI assistant deleted successfully");
//       dispatch(fetchUserAIWorkflows());
//     } catch (error) {
//       toast.error(error?.message || "Failed to delete AI assistant");
//     }
//   };

//   if (loading) {
//     return (
//       <div className={css.loaderContainer}>
//         <Loader />
//       </div>
//     );
//   }

//   // Group workflows by service
//   const workflowsByService =
//     workflows?.reduce((acc, workflow) => {
//       const serviceTitle = workflow.service?.title || "Unknown Service";
//       const serviceId = workflow.service?.id;

//       if (!acc[serviceId]) {
//         acc[serviceId] = {
//           serviceTitle,
//           serviceId,
//           workflows: [],
//         };
//       }

//       acc[serviceId].workflows.push(workflow);
//       return acc;
//     }, {}) || {};

//   const serviceGroups = Object.values(workflowsByService);

//   if (serviceGroups.length === 0) {
//     return (
//       <div className={css.emptyState}>
//         <div className={css.emptyContent}>
//           <Typography variant="h2" className={css.emptyTitle}>
//             No AI Assistants Yet
//           </Typography>
//           <Typography variant="body" className={css.emptyDescription}>
//             You haven't created any AI assistants for your services yet. AI
//             assistants can help your customers by answering questions about your
//             services, providing recommendations, and more.
//           </Typography>
//           <Typography variant="body" className={css.emptyHint}>
//             Go to any of your services and click "Add AI Assistant" to get
//             started.
//           </Typography>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={css.container}>
//       <div className={css.header}>
//         <Typography variant="h2">AI Assistants</Typography>
//         <Typography variant="body" className={css.subtitle}>
//           Manage AI assistants across all your services
//         </Typography>
//       </div>

//       <div className={css.serviceGroups}>
//         {serviceGroups.map((group) => (
//           <div key={group.serviceId} className={css.serviceGroup}>
//             <div className={css.serviceHeader}>
//               <Typography variant="h3" className={css.serviceTitle}>
//                 {group.serviceTitle}
//               </Typography>
//               <Typography variant="body" className={css.serviceCount}>
//                 {group.workflows.length} assistant
//                 {group.workflows.length !== 1 ? "s" : ""}
//               </Typography>
//             </div>

//             <div className={css.workflowsGrid}>
//               {group.workflows.map((workflow) => (
//                 <ServiceAIWorkflowCard
//                   key={workflow.id}
//                   workflow={workflow}
//                   onEdit={() => handleOpenEditModal(workflow)}
//                   onDelete={() => handleDelete(workflow.id)}
//                   onChat={() => handleOpenChat(workflow)}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modals */}
//       {editingWorkflow && (
//         <AIAssistantModal
//           isOpen={isAssistantModalOpen}
//           onClose={handleCloseAssistantModal}
//           serviceId={editingWorkflow.service?.id}
//           workflow={editingWorkflow}
//         />
//       )}

//       {selectedWorkflow && (
//         <N8nChat
//           isOpen={isChatModalOpen}
//           onClose={handleCloseChat}
//           webhookUrl={selectedWorkflow.webhookUrl}
//           workflowName={selectedWorkflow.name}
//         />
//       )}
//     </div>
//   );
// };

// UserAIWorkflowsList.propTypes = {};
