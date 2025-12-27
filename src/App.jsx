import { Route, Routes } from "react-router";
import { lazy, useEffect } from "react";
import { useDispatch } from "react-redux";

import SharedLayout from "./components/layout/SharedLayout/SharedLayout";
import { PrivateRoute } from "./components/PrivateRoute";
import { checkApiConnection } from "./services/api.js";
import { getCurrentUser } from "./store/auth";
import { getAllAreas } from "./store/areas";
import { getAllCategories } from "./store/categories";
import { getAllItems } from "./store/services";

const Home = lazy(() => import("./pages/Home/Home.jsx"));
const AboutUs = lazy(() => import("./pages/AboutUs/AboutUs.jsx"));
const Service = lazy(() => import("./pages/Service/Service.jsx"));
const ServiceForm = lazy(() => import("./pages/ServiceForm/ServiceForm.jsx"));
const UserPage = lazy(() => import("./pages/UserPage/UserPage.jsx"));
const GoogleOAuthCallback = lazy(() =>
  import("./pages/GoogleOAuthCallback/GoogleOAuthCallback.jsx"),
);
const NotFound = lazy(() => import("./pages/NotFound/NotFound.jsx"));

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    checkApiConnection()
      .then(() => console.log("✅ API is reachable"))
      .catch((err) => console.error("❌ API connection failed:", err));

    dispatch(getCurrentUser());
    dispatch(getAllAreas());
    dispatch(getAllCategories());
    dispatch(getAllItems());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<SharedLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />

        <Route
          path="/user/:id"
          element={
            <PrivateRoute>
              <UserPage />
            </PrivateRoute>
          }
        />

        <Route path="/service/:serviceId" element={<Service />} />
        <Route
          path="/service/add"
          element={
            <PrivateRoute>
              <ServiceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/service/:serviceId/edit"
          element={
            <PrivateRoute>
              <ServiceForm />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
