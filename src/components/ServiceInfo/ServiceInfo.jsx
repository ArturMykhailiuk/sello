import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import toast from "react-hot-toast";

import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsItem,
} from "../Breadcrumbs/Breadcrumbs.jsx";
import { ServiceMainInfo } from "../ServiceMainInfo/index.js";
import Loader from "../Loader/Loader.jsx";
import { normalizeHttpError } from "../../utils/index.js";
import { getServiceById } from "../../services/services.js";

import css from "./ServiceInfo.module.css";
import NotFound from "../../pages/NotFound/NotFound.jsx";

export const ServiceInfo = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const goBackPath = useRef(state?.from ?? "/");

  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const service = await getServiceById(serviceId);
        setService(service);
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
  }, [serviceId]);

  const updateFavoriteStatus = (isFavorite) => {
    setService((prev) => ({ ...prev, isFavorite }));
  };

  if (loading) return <Loader />;

  if (!service) return <NotFound />;

  return (
    <section>
      <Breadcrumbs>
        <BreadcrumbsItem
          onClick={() => {
            navigate(goBackPath.current);
          }}
        >
          Home
        </BreadcrumbsItem>
        <BreadcrumbsDivider />
        <BreadcrumbsItem isActive>{service.title}</BreadcrumbsItem>
      </Breadcrumbs>

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
    </section>
  );
};
