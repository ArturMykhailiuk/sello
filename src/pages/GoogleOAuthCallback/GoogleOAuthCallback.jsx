import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useDispatch } from "react-redux";
import { setAuthData, getCurrentUser } from "../../store/auth";
import toast from "react-hot-toast";

export default function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Set token in Redux store and localStorage
      dispatch(setAuthData({ token }));

      // Fetch user data with the new token
      dispatch(getCurrentUser())
        .unwrap()
        .then(() => {
          toast.success("Successfully signed in with Google!");
          navigate("/", { replace: true });
        })
        .catch(() => {
          toast.error("Failed to load user data. Please try again.");
          navigate("/", { replace: true });
        });
    } else {
      toast.error("Google authentication failed. Please try again.");
      navigate("/", { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "var(--text-primary)",
      }}
    >
      Authenticating with Google...
    </div>
  );
}
