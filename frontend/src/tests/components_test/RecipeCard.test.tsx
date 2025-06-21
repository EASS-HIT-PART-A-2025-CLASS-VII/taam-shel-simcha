import { render, screen, fireEvent } from "@testing-library/react";
import RecipeCard from "../../components/RecipeCard";
import { BrowserRouter as Router } from "react-router-dom";
import { Recipe } from "../../types/Recipe";
import { vi } from "vitest";

const mockRecipe: Recipe = {
  id: 1,
  title: "פיצה ביתית",
  description: "פיצה טעימה עם גבינה ובזיליקום",
  ingredients: "קמח, מים, שמרים, גבינה, רוטב עגבניות",
  instructions: "",
  image_url: "",
  video_url: "",
  user_id: 1,
  creator_name: "שחר",
  average_rating: 4.2,
  prep_time: "30",
  difficulty: "Easy",
  created_at: "",
  is_public: true,
};

describe("RecipeCard", () => {
  it("מציג את כותרת המתכון", () => {
    render(
      <Router>
        <RecipeCard
          recipe={mockRecipe}
          isFavorited={false}
          onToggleFavorite={() => {}}
          onRate={() => {}}
        />
      </Router>
    );
    expect(screen.getByText("פיצה ביתית")).toBeInTheDocument();
  });

  it("מציג את שם היוצר", () => {
    render(
      <Router>
        <RecipeCard
          recipe={mockRecipe}
          isFavorited={false}
          onToggleFavorite={() => {}}
          onRate={() => {}}
        />
      </Router>
    );
    expect(screen.getByText("שחר")).toBeInTheDocument();
  });

  it("מפעיל את onToggleFavorite בלחיצה על הלב", () => {
    const mockToggle = vi.fn();
    render(
      <Router>
        <RecipeCard
          recipe={mockRecipe}
          isFavorited={false}
          onToggleFavorite={mockToggle}
          onRate={() => {}}
        />
      </Router>
    );
    const heartButton = screen.getByRole("button", {
      name: /הוסף למועדפים/i,
    });
    fireEvent.click(heartButton);
    expect(mockToggle).toHaveBeenCalledWith(1);
  });

  it("מציג את הדירוג הממוצע של המתכון", () => {
    render(
      <Router>
        <RecipeCard
          recipe={mockRecipe}
          isFavorited={false}
          onToggleFavorite={() => {}}
          onRate={() => {}}
        />
      </Router>
    );
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("מציג את רמת הקושי בעברית", () => {
    render(
      <Router>
        <RecipeCard
          recipe={mockRecipe}
          isFavorited={false}
          onToggleFavorite={() => {}}
          onRate={() => {}}
        />
      </Router>
    );
    expect(screen.getByText(/🎯 קל/)).toBeInTheDocument();
  });

  it("מציג את זמן ההכנה בדקות", () => {
    render(
      <Router>
        <RecipeCard
          recipe={mockRecipe}
          isFavorited={false}
          onToggleFavorite={() => {}}
          onRate={() => {}}
        />
      </Router>
    );
    expect(screen.getByText(/30 דק'/)).toBeInTheDocument();
  });
});
