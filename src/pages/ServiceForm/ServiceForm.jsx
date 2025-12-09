import Container from "../../components/UI/Container/Container.jsx";
import {
  Typography,
  TypographyError,
} from "../../components/Typography/Typography.jsx";
import * as styles from "./ServiceForm.module.css";
import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsItem,
} from "../../components/Breadcrumbs/Breadcrumbs.jsx";
import { ImageUpload } from "../../components/ImageUpload/ImageUpload.jsx";
import { Input } from "../../components/Input/Input.jsx";
import { Textarea } from "../../components/Textarea/Textarea.jsx";
import { useState, useEffect } from "react";
import { ButtonIcon } from "../../components/ButtonIcon/ButtonIcon.jsx";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { Button } from "../../components/Button/Button.jsx";
import SearchSelect from "../../components/SearchSelect/SearchSelect.jsx";
import { InputStepper } from "../../components/InputStepper/InputStepper.jsx";
import PlusIcon from "../../assets/icons/plus.svg?react";
import clsx from "clsx";
import { ItemBadge } from "../../components/ItemBadge/ItemBadge.jsx";
import { useDispatch, useSelector } from "react-redux";
import { selectCategories } from "../../store/categories/index.js";
import { createOrUpdateArea } from "../../store/areas/index.js";
import { object, string, array } from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { normalizeHttpError, normalizeImagePath } from "../../utils/index.js";
import toast from "react-hot-toast";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common.js";
import { appClearSessionAction } from "../../store/utils.js";
import {
  addService,
  updateService,
  getServiceById,
} from "../../services/services.js";
import { useNavigate, useParams } from "react-router";
import { createItem } from "../../services/items.js";
import Loader from "../../components/Loader/Loader.jsx";
import { LocationModal } from "../../components/LocationModal/LocationModal.jsx";

const ItemsFieldGroup = ({ onAdd }) => {
  const [itemName, setItemName] = useState("");
  const [measure, setMeasure] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleAddItem = async () => {
    if (!itemName.trim() || !measure.trim()) return;

    setIsCreating(true);

    try {
      const newItem = await createItem({
        name: itemName.trim(),
      });

      onAdd({
        id: newItem.id,
        name: newItem.name,
        imgURL: newItem.imgURL,
        measure: measure,
      });

      setItemName("");
      setMeasure("");
      toast.success(`Item "${newItem.name}" added!`);
    } catch (error) {
      const { message } = normalizeHttpError(error);
      toast.error(message ?? "Failed to create item");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.ItemsFieldGroup}>
      <div className={styles.AddService__inputGroupWrapper}>
        <div className={styles.AddService__inputGroup}>
          <Typography variant="h4">Деталізація послуги</Typography>
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            variant="underline"
            placeholder="Внесіть назву деталізованої послуги"
          />
        </div>
        <Input
          value={measure}
          onChange={(e) => setMeasure(e.target.value)}
          variant="underline"
          placeholder="Внесіть вартість послуги"
        />
      </div>

      <Button
        className={styles.ItemsFieldGroup__button}
        variant="light"
        bordered
        size="medium"
        icon={<PlusIcon />}
        disabled={!itemName.trim() || !measure.trim() || isCreating}
        onClick={handleAddItem}
      >
        {isCreating ? "Додаємо..." : "Додати деталь"}
      </Button>
    </div>
  );
};

const defaultData = {
  image: null,
  title: "",
  description: "",
  category: null,
  area: null,
  location: null, // { lat, lng, address, city, country, street }
  cookingTime: 10,
  items: [],
  instructions: "",
};

const createValidationSchema = (mode) =>
  object({
    title: string().required("Service title is required"),
    description: string().required("Description is required"),
    category: object().required("Category is required"),
    area: object().required("Area is required"),
    instructions: string().required("Details are required"),
    items: array()
      .of(
        object().shape({
          id: string().required("Item ID is required"),
          measure: string().required("Measure is required"),
        }),
      )
      .min(1, "At least one item is required"),
    // Image required only for create mode
    image:
      mode === "create"
        ? string().required("Image is required")
        : string().optional(),
  });

const ServiceForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { serviceId } = useParams(); // Якщо є serviceId, то режим редагування
  const mode = serviceId ? "edit" : "create";
  const validationSchema = createValidationSchema(mode);

  const categoriesList = useSelector(selectCategories);
  const [categorySearch, setCategorySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(defaultData);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Завантаження даних для редагування
  useEffect(() => {
    if (mode === "edit") {
      const fetchService = async () => {
        try {
          setLoading(true);
          const service = await getServiceById(serviceId);

          // Підготовка даних для форми
          const formData = {
            image: service.thumb, // URL існуючого зображення
            title: service.title,
            description: service.description,
            category: service.category,
            area: service.area,
            location:
              service.area?.latitude && service.area?.longitude
                ? {
                    lat: parseFloat(service.area.latitude),
                    lng: parseFloat(service.area.longitude),
                    address: service.area.formattedAddress || "",
                    city: service.area.city || "",
                    country: service.area.country || "",
                    street: service.area.street || "",
                  }
                : null,
            cookingTime: service.time,
            items: service.items.map((item) => ({
              id: item.id,
              name: item.name,
              imgURL: item.imgURL,
              measure: item.measure,
            })),
            instructions: service.instructions,
          };

          setInitialData(formData);
          setCategorySearch(service.category.name);
        } catch (error) {
          const { message, status } = normalizeHttpError(error);
          toast.error(message ?? DEFAULT_ERROR_MESSAGE);
          if (status === 401) dispatch(appClearSessionAction());
          navigate("/");
        } finally {
          setLoading(false);
        }
      };

      fetchService();
    }
  }, [mode, serviceId, dispatch, navigate]);

  const onSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
    setSubmitting(true);

    try {
      // Створюємо або оновлюємо area якщо є локація
      let areaId = values.area?.id;

      if (values.location) {
        const areaData = {
          name: values.location.city || values.location.address,
          latitude: values.location.lat,
          longitude: values.location.lng,
          formattedAddress: values.location.address,
          city: values.location.city,
          country: values.location.country,
          street: values.location.street,
        };

        const resultAction = await dispatch(createOrUpdateArea(areaData));
        if (createOrUpdateArea.fulfilled.match(resultAction)) {
          areaId = resultAction.payload.id;
        } else {
          throw new Error("Failed to create/update area");
        }
      }

      if (!areaId) {
        toast.error("Виберіть локацію");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();

      // Додаємо зображення тільки якщо це новий File (не URL)
      if (values.image instanceof File) {
        formData.append("thumb", values.image);
      }

      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("categoryId", values.category.id);
      formData.append("areaId", areaId.toString());
      formData.append("time", values.cookingTime.toString());
      formData.append("instructions", values.instructions);

      formData.append(
        "items",
        JSON.stringify(
          values.items.map(({ id, measure }) => ({ id, measure })),
        ),
      );

      let data;
      if (mode === "create") {
        data = await addService(formData);
        toast.success("Послугу успішно додано");
      } else {
        data = await updateService(serviceId, formData);
        toast.success("Послугу успішно оновлено");
      }

      resetForm();
      setCategorySearch("");
      setStatus({ success: true });

      if (data?.service) {
        navigate(`/service/${data.service.id}`);
      }
    } catch (error) {
      const { message, status } = normalizeHttpError(error);
      toast.error(message ?? DEFAULT_ERROR_MESSAGE);
      if (status === 401) dispatch(appClearSessionAction());
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const pageTitle = mode === "create" ? "Додати послугу" : "Редагувати послугу";
  const breadcrumbTitle = mode === "create" ? "Додати послугу" : "Редагувати";
  const submitButtonText =
    mode === "create" ? "Опублікувати" : "Зберегти зміни";

  return (
    <Container>
      <div className={styles.AddService}>
        <Breadcrumbs>
          <BreadcrumbsItem
            onClick={() => {
              window.open("/", "_self");
            }}
          >
            Головна
          </BreadcrumbsItem>
          <BreadcrumbsDivider />
          <BreadcrumbsItem isActive>{breadcrumbTitle}</BreadcrumbsItem>
        </Breadcrumbs>

        <div className={styles.AddService__header}>
          <Typography variant="h2">{pageTitle}</Typography>
          <Typography variant="body">
            Об'єднуймо наші зусилля, знання та таланти, щоб створювати послуги,
            які надихають і приносять цінність кожному клієнтові.
          </Typography>
        </div>

        <Formik
          initialValues={initialData}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ setFieldValue, values, resetForm, isSubmitting, errors }) => (
            <Form className={styles.AddService__form}>
              <div>
                {mode === "edit" && typeof values.image === "string" && (
                  <div className={styles.AddService__currentImage}>
                    <Typography variant="body">Поточне зображення:</Typography>
                    <img
                      src={normalizeImagePath(values.image)}
                      alt="Current service"
                      className={styles.AddService__currentImagePreview}
                    />
                    <Typography variant="body">
                      Завантажте нове зображення нижче, щоб замінити:
                    </Typography>
                  </div>
                )}

                <ImageUpload
                  value={values.image instanceof File ? values.image : null}
                  error={errors.image}
                  name="image"
                  onUpload={(file) => setFieldValue("image", file)}
                />
              </div>

              <div className={styles.AddService__inputs}>
                <div className={styles.AddService__inputGroup_top}>
                  <div>
                    <Field
                      name="title"
                      as={Input}
                      variant="ghost"
                      placeholder="Назва послуги"
                    />
                    <ErrorMessage name="title" component={TypographyError} />
                  </div>

                  <div>
                    <Field
                      name="description"
                      as={Textarea}
                      placeholder="Опис послуги"
                    />
                    <ErrorMessage
                      name="description"
                      component={TypographyError}
                    />
                  </div>
                </div>

                <div className={styles.AddService__inputGroup}>
                  <Typography variant="h4">Локація на карті</Typography>
                  <div>
                    {values.location && (
                      <Typography
                        variant="body"
                        className={styles.locationInfo}
                      >
                        📍 {values.location.address}
                      </Typography>
                    )}
                    <Button
                      type="button"
                      variant="light"
                      bordered
                      size="mysmall"
                      onClick={() => setIsLocationModalOpen(true)}
                      className={styles.locationButton}
                    >
                      {values.location
                        ? "Змінити локацію"
                        : "Оберіть локацію на карті"}
                    </Button>

                    <ErrorMessage name="area" component={TypographyError} />
                  </div>
                </div>

                <LocationModal
                  isOpen={isLocationModalOpen}
                  onClose={() => setIsLocationModalOpen(false)}
                  currentLocation={values.location}
                  onSave={(location) => {
                    setFieldValue("location", location);
                    setIsLocationModalOpen(false);
                  }}
                />

                <div className={styles.AddService__inputGroupWrapper}>
                  <div className={styles.AddService__inputGroup}>
                    <Typography variant="h4">Категорія</Typography>
                    <div>
                      <SearchSelect
                        value={categorySearch}
                        onChange={(val) => {
                          setCategorySearch(val);
                          if (!val) setFieldValue("category", null);
                        }}
                        name="category"
                        items={categoriesList}
                        onSelect={(item) => {
                          setFieldValue("category", item);
                          setCategorySearch(item.name);
                        }}
                        placeholder="Виберіть категорію"
                      />
                      <ErrorMessage
                        name="category"
                        component={TypographyError}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <ItemsFieldGroup
                    onAdd={(newData) => {
                      setFieldValue("items", [...values.items, newData]);
                    }}
                  />
                  <ErrorMessage name="items" component={TypographyError} />
                </div>

                {values.items.length > 0 && (
                  <div className={styles.AddService__itemsList}>
                    {values.items.map((item) => (
                      <ItemBadge
                        imgURL={item.imgURL}
                        name={item.name}
                        measure={item.measure}
                        key={item.id}
                        onDelete={() => {
                          setFieldValue(
                            "items",
                            values.items.filter((i) => i.id !== item.id),
                          );
                        }}
                      />
                    ))}
                  </div>
                )}

                <div
                  className={clsx(
                    styles.AddService__inputGroup,
                    styles.AddService__inputGroup_bottom,
                  )}
                >
                  <Typography variant="h4">Деталі послуги</Typography>
                  <div>
                    <Field
                      name="instructions"
                      as={Textarea}
                      placeholder="Додайте детальний опис послуги тут..."
                    />
                    <ErrorMessage
                      name="instructions"
                      component={TypographyError}
                    />
                  </div>
                </div>

                <div className={styles.AddService__actions}>
                  <ButtonIcon
                    icon={<TrashIcon />}
                    variant="light"
                    size="large"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      resetForm();
                      setCategorySearch("");
                    }}
                  />
                  <Button
                    className={styles.AddService__publishBtn}
                    variant="dark"
                    size="small"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? mode === "create"
                        ? "Додаємо..."
                        : "Зберігаємо..."
                      : submitButtonText}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
};

export default ServiceForm;
