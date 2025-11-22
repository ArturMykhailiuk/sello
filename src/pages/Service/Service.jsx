import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Container from "../../components/UI/Container/Container";
import { ServiceInfo } from "../../components/ServiceInfo";
import { PopularServices } from "../../components/PopularServices/PopularServices";
import { getPopularServices } from "../../services/services";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common";
import { normalizeHttpError } from "../../utils";

import css from "./Service.module.css";

const ServicePage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { popularServices } = await getPopularServices();
        setServices(popularServices);
      } catch (error) {
        const { message } = normalizeHttpError(error);
        toast.error(message ?? DEFAULT_ERROR_MESSAGE);
      }
    })();
  }, []);

  return (
    <main>
      <Container className={css.container}>
        <ServiceInfo />

        <PopularServices services={services} />
      </Container>
    </main>
  );
};

export default ServicePage;
