import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter as Router } from "react-router-dom";
import * as apiModule from "@/services/api";
import UserNavbar from "@/components/UserNavbar";

// 🛠️ מוקים ל־useNavigate (חייב להיות מחוץ ל־describe!)
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// 🧪 מוקים ל-localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe("UserNavbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();  // חשוב לניקוי
    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { id: 1, username: "שחר", is_admin: true }
    });
  });

  it("מציג את כפתורי הניווט", async () => {
    render(<Router><UserNavbar /></Router>);
    expect(await screen.findByText("🍽️ מתכונים")).toBeInTheDocument();
    expect(screen.getByText("🤖 AI מתכונים עם")).toBeInTheDocument();
    expect(screen.getByText("👤 פרופיל")).toBeInTheDocument();
  });

  it("פותח את התפריט הנפתח עם לחיצה על פרופיל", async () => {
    render(<Router><UserNavbar /></Router>);
    fireEvent.click(await screen.findByText("👤 פרופיל"));
    expect(screen.getByText("👤 הפרופיל שלי")).toBeInTheDocument();
    expect(screen.getByText("❤️ המועדפים שלי")).toBeInTheDocument();
    expect(screen.getByText("🍲 המתכונים שלי")).toBeInTheDocument();
    expect(screen.getByText("🔐 ניהול מערכת")).toBeInTheDocument();
  });

  it("מוחק את הטוקן ומנווט ל־/login בעת לחיצה על התנתקות", async () => {
    localStorage.setItem("token", "12345");  // מוודאים שהטוקן קיים
    render(<Router><UserNavbar /></Router>);
    fireEvent.click(await screen.findByText("👤 פרופיל"));
    fireEvent.click(screen.getByText("🚪 התנתקות"));
    expect(localStorage.getItem("token")).toBe(null);
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
