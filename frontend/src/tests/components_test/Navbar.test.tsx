import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
  });

  it("מציג את הלוגו עם טקסט 'טעם של שמחה'", () => {
    const title = screen.getByText("טעם של שמחה");
    expect(title).toBeInTheDocument();
  });

  it("מכיל כפתור למתכונים ציבוריים", () => {
    const publicRecipesBtn = screen.getByRole("link", { name: /🍽️ מתכונים/i });
    expect(publicRecipesBtn).toHaveAttribute("href", "/public");
  });

  it("מכיל כפתור ל-AI מתכונים", () => {
    const aiBtn = screen.getByRole("link", { name: /AI מתכונים עם/i });
    expect(aiBtn).toHaveAttribute("href", "/ai-recipe");
  });

  it("מכיל כפתור התחברות", () => {
    const loginBtn = screen.getByRole("link", { name: /🔐 התחברות/i });
    expect(loginBtn).toHaveAttribute("href", "/login");
  });

  it("מציג את תמונת הלוגו", () => {
    const logo = screen.getByAltText("טעם של שמחה לוגו");
    expect(logo).toBeInTheDocument();
  });
});
