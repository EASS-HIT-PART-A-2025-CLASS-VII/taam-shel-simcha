// src/tests/components_test/RecipeShareButton.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeShareButton from "@/components/RecipeShareButton";
import * as recipeService from "@/services/recipeService";
import { vi } from "vitest";

describe("RecipeShareButton", () => {
  const recipeId = 1;
  const title = "עוגת שוקולד";

  beforeEach(() => {
    vi.resetAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  it("פותח את התפריט בלחיצה על כפתור שיתוף", () => {
    render(<RecipeShareButton recipeId={recipeId} title={title} />);
    const button = screen.getByTitle("שיתוף");
    fireEvent.click(button);
    expect(screen.getByText("העתק קישור")).toBeInTheDocument();
  });

  it("מעתיק את הקישור ללוח", async () => {
    render(<RecipeShareButton recipeId={recipeId} title={title} />);
    fireEvent.click(screen.getByTitle("שיתוף"));
    fireEvent.click(screen.getByText("העתק קישור"));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(`/recipes/${recipeId}`)
      )
    );
  });

  it("פותח את וואטסאפ בלחיצה על שתף בוואטסאפ", () => {
    render(<RecipeShareButton recipeId={recipeId} title={title} />);
    fireEvent.click(screen.getByTitle("שיתוף"));
    fireEvent.click(screen.getByText("שתף בוואטסאפ"));

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/?text="),
      "_blank"
    );
  });

  it("פותח שדה שליחה במייל ומציג הודעת הצלחה", async () => {
    const sendMock = vi
  .spyOn(recipeService, "sendRecipeByEmail")
  .mockResolvedValue(undefined); // ✅ כדי לשמח את TypeScript


    render(<RecipeShareButton recipeId={recipeId} title={title} />);
    fireEvent.click(screen.getByTitle("שיתוף"));
    fireEvent.click(screen.getByText("שלח במייל"));

    fireEvent.change(screen.getByPlaceholderText("כתובת מייל"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("שלח מתכון"));

    await waitFor(() => {
      expect(sendMock).toHaveBeenCalledWith(recipeId, "test@example.com");
      expect(screen.getByText("✅ המתכון נשלח בהצלחה!")).toBeInTheDocument();
    });
  });

  it("מציג הודעת שגיאה אם השליחה נכשלת", async () => {
    vi.spyOn(recipeService, "sendRecipeByEmail").mockRejectedValue(new Error());

    render(<RecipeShareButton recipeId={recipeId} title={title} />);
    fireEvent.click(screen.getByTitle("שיתוף"));
    fireEvent.click(screen.getByText("שלח במייל"));

    fireEvent.change(screen.getByPlaceholderText("כתובת מייל"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("שלח מתכון"));

    await waitFor(() => {
      expect(
        screen.getByText("❌ שגיאה בשליחה. נסה שוב.")
      ).toBeInTheDocument();
    });
  });
});
