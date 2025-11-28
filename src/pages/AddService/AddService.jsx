import Container from "../../components/UI/Container/Container.jsx";
import {
  Typography,
  TypographyError,
} from "../../components/Typography/Typography.jsx";
import * as styles from "./AddService.module.css";
import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsItem,
} from "../../components/Breadcrumbs/Breadcrumbs.jsx";
import { ImageUpload } from "../../components/ImageUpload/ImageUpload.jsx";
import { Input } from "../../components/Input/Input.jsx";
import { Textarea } from "../../components/Textarea/Textarea.jsx";
import { useState } from "react";
import { ButtonIcon } from "../../components/ButtonIcon/ButtonIcon.jsx";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { Button } from "../../components/Button/Button.jsx";
import SearchSelect from "../../components/SearchSelect/SearchSelect.jsx";
import { InputStepper } from "../../components/InputStepper/InputStepper.jsx";
import PlusIcon from "../../assets/icons/plus.svg?react";
import clsx from "clsx";
import { ItemBadge } from "../../components/ItemBadge/ItemBadge.jsx";
import { useDispatch, useSelector } from "react-redux";
import { selectItems } from "../../store/items/index.js";
import { selectCategories } from "../../store/categories/index.js";
import { selectAreas } from "../../store/areas/index.js";
import { object, string, array } from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { normalizeHttpError } from "../../utils/index.js";
import toast from "react-hot-toast";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common.js";
import { appClearSessionAction } from "../../store/utils.js";
import { addService } from "../../services/services.js";
import { useNavigate } from "react-router";

const ItemsFieldGroup = ({ itemsList, onAdd, excludeIds }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [measure, setMeasure] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  return (
    <div className={styles.ItemsFieldGroup}>
      <div className={styles.AddService__inputGroupWrapper}>
        <div className={styles.AddService__inputGroup}>
          <Typography variant="h4">Items</Typography>
          <SearchSelect
            excludeIds={excludeIds}
            value={itemSearch}
            onChange={(val) => {
              setItemSearch(val);
              if (!val) setSelectedItem(null);
            }}
            items={itemsList}
            onSelect={(item) => {
              setSelectedItem(item);
              setItemSearch(item.name);
            }}
            placeholder="Add the item"
          />
        </div>
        <Input
          value={measure}
          onChange={(e) => setMeasure(e.target.value)}
          variant="underline"
          placeholder="Enter quantity"
        />
      </div>

      <Button
        className={styles.ItemsFieldGroup__button}
        variant="light"
        bordered
        size="medium"
        icon={<PlusIcon />}
        disabled={!selectedItem || !measure || !itemSearch}
        onClick={() => {
          onAdd({
            ...selectedItem,
            measure: measure,
          });
          setSelectedItem(null);
          setMeasure("");
          setItemSearch("");
        }}
      >
        Add item
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
  cookingTime: 10,
  items: [],
  instructions: "",
};

const validationSchema = object({
  title: string().required("Service title is required"),
  description: string().required("Description is required"),
  category: object().required("Category is required"),
  area: object().required("Area is required"),
  instructions: string().required("Instructions are required"),
  items: array()
    .of(
      object().shape({
        id: string().required("Item ID is required"),
        measure: string().required("Measure is required"),
      }),
    )
    .min(1, "At least one item is required"),
  image: string().required("Image is required"),
});

const AddService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsList = useSelector(selectItems);
  const categoriesList = useSelector(selectCategories);
  const areasList = useSelector(selectAreas);
  const [categorySearch, setCategorySearch] = useState("");
  const [areaSearch, setAreaSearch] = useState("");

  const onSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
    setSubmitting(true);

    const formData = new FormData();

    formData.append("thumb", values.image);
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("categoryId", values.category.id);
    formData.append("areaId", values.area.id);
    formData.append("time", values.cookingTime.toString());
    formData.append("instructions", values.instructions);

    formData.append(
      "items",
      JSON.stringify(values.items.map(({ id, measure }) => ({ id, measure }))),
    );

    try {
      const data = await addService(formData);
      resetForm();
      setCategorySearch("");
      setAreaSearch("");
      setStatus({ success: true });
      toast.success("Service added successfully");
      data?.service && navigate(`/service/${data.service.id}`);
    } catch (error) {
      const { message, status } = normalizeHttpError(error);
      toast.error(message ?? DEFAULT_ERROR_MESSAGE);
      if (status === 401) dispatch(appClearSessionAction());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <div className={styles.AddService}>
        <Breadcrumbs>
          <BreadcrumbsItem
            onClick={() => {
              window.open("/", "_self");
            }}
          >
            Home
          </BreadcrumbsItem>
          <BreadcrumbsDivider />
          <BreadcrumbsItem isActive>Add service</BreadcrumbsItem>
        </Breadcrumbs>

        <div className={styles.AddService__header}>
          <Typography variant="h2">Add service</Typography>
          <Typography variant="body">
            Reveal your culinary art, share your favorite recipe and create
            gastronomic masterpieces with us.
          </Typography>
        </div>

        <Formik
          initialValues={defaultData}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ setFieldValue, values, resetForm, isSubmitting, errors }) => (
            <Form className={styles.AddService__form}>
              <ImageUpload
                value={values.image}
                error={errors.image}
                name="image"
                onUpload={(file) => setFieldValue("image", file)}
              />

              <div className={styles.AddService__inputs}>
                <div className={styles.AddService__inputGroup_top}>
                  <div>
                    <Field
                      name="title"
                      as={Input}
                      variant="ghost"
                      placeholder="The name of the service"
                    />
                    <ErrorMessage name="title" component={TypographyError} />
                  </div>

                  <div>
                    <Field
                      name="description"
                      as={Textarea}
                      placeholder="Enter a description of the dish"
                    />
                    <ErrorMessage
                      name="description"
                      component={TypographyError}
                    />
                  </div>
                </div>

                <div className={styles.AddService__inputGroup}>
                  <Typography variant="h4">Area</Typography>
                  <div>
                    <SearchSelect
                      value={areaSearch}
                      onChange={(val) => {
                        setAreaSearch(val);
                        if (!val) setFieldValue("area", null);
                      }}
                      name="area"
                      items={areasList}
                      onSelect={(item) => {
                        setFieldValue("area", item);
                        setAreaSearch(item.name);
                      }}
                      placeholder="Select an area"
                    />
                    <ErrorMessage name="area" component={TypographyError} />
                  </div>
                </div>

                <div className={styles.AddService__inputGroupWrapper}>
                  <div className={styles.AddService__inputGroup}>
                    <Typography variant="h4">Category</Typography>
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
                        placeholder="Select a category"
                      />
                      <ErrorMessage
                        name="category"
                        component={TypographyError}
                      />
                    </div>
                  </div>

                  <div className={styles.AddService__inputGroup}>
                    <Typography variant="h4">Cooking time</Typography>
                    <Field
                      name="cookingTime"
                      component={InputStepper}
                      value={values.cookingTime}
                      onChange={(value) => setFieldValue("cookingTime", value)}
                    />
                  </div>
                </div>

                <div>
                  <ItemsFieldGroup
                    excludeIds={values.items.map((item) => item.id)}
                    itemsList={itemsList}
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
                  <Typography variant="h4">Recipe Preparation</Typography>
                  <div>
                    <Field
                      name="instructions"
                      as={Textarea}
                      placeholder="Enter service"
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
                      setAreaSearch("");
                    }}
                  />
                  <Button
                    className={styles.AddService__publishBtn}
                    variant="dark"
                    size="small"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Publish
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

export default AddService;
