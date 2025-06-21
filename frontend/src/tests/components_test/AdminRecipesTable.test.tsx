import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminRecipesTable from "@/components/AdminRecipesTable";
import { vi } from "vitest";
import * as adminService from "@/services/adminService";

// מוקים
vi.mock("@/services/adminService", async () => {
  const actual = await vi.importActual<typeof adminService>("@/services/adminService");
  return {
    ...actual,
    getAllRecipes: vi.fn(),
    deleteRecipe: vi.fn(),
  };
});

describe("AdminRecipesTable", () => {
  const mockRecipes = [
    {
      id: 1,
      title: "שקשוקה חריפה",
      description: "תיאור ארוך של שקשוקה חריפה",
      is_public: true,
      creator_name: "שחר",
    },
    {
      id: 2,
      title: "עוגת גבינה",
      description: "טעימה מאוד!",
      is_public: false,
      creator_name: "מיכל",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("מציג טבלת מתכונים", async () => {
    (adminService.getAllRecipes as ReturnType<typeof vi.fn>).mockResolvedValue(mockRecipes);

    render(<AdminRecipesTable />);

    await waitFor(() => {
      expect(screen.getByText("📋 כל המתכונים")).toBeInTheDocument();
    });

    expect(screen.getByText("שקשוקה חריפה")).toBeInTheDocument();
    expect(screen.getByText("עוגת גבינה")).toBeInTheDocument();
    expect(screen.getAllByText("🗑️")).toHaveLength(2);
  });

  it("מוחק מתכון מהטבלה בלחיצה", async () => {
    window.confirm = vi.fn().mockReturnValue(true); // אישור למחיקה
    (adminService.getAllRecipes as ReturnType<typeof vi.fn>).mockResolvedValue(mockRecipes);
    (adminService.deleteRecipe as ReturnType<typeof vi.fn>).mockResolvedValue({});

    render(<AdminRecipesTable />);

    await waitFor(() => {
      expect(screen.getByText("שקשוקה חריפה")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("מחק מתכון");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(adminService.deleteRecipe).toHaveBeenCalledWith(1);
    });
  });

  it("אם getAllRecipes נכשל – מוצג טבלה ריקה", async () => {
    (adminService.getAllRecipes as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("שגיאה"));

    render(<AdminRecipesTable />);

    await waitFor(() => {
      expect(screen.queryByText("שקשוקה חריפה")).not.toBeInTheDocument();
    });

    expect(screen.queryAllByText("🗑️")).toHaveLength(0);
  });
});
