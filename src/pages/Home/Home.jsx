import { useSearchParams } from "react-router";

import { Category } from "../../components/Category";
import { Hero } from "../../components/Hero";
import { Services } from "../../components/Services/Services";

import css from "./Home.module.css";

const isValidCategory = (category) => {
  if (!category) return false;
  if (category === "all") return true;
  return !Number.isNaN(Number(category));
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  const isServicesSubPage = isValidCategory(category);
  const categoryId =
    isServicesSubPage && category !== "all" ? Number(category) : null;

  // Show search results if there's a search query
  const showSearchResults = searchQuery && searchQuery.trim().length > 0;

  return (
    <div className={css.container}>
      <Hero />

      {showSearchResults ? (
        <Services searchQuery={searchQuery} />
      ) : isServicesSubPage ? (
        <Services categoryId={categoryId} />
      ) : (
        <Category />
      )}
    </div>
  );
}
