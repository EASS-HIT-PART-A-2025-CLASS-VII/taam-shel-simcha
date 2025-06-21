import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CommentsSection from "@/components/CommentsSection";
import { vi } from "vitest";
import api, { deleteComment } from "@/services/api";
import { MemoryRouter } from "react-router-dom";

// Mocking api
vi.mock("@/services/api", () => {
  return {
    __esModule: true,
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
    deleteComment: vi.fn(),
  };
});

describe("CommentsSection", () => {
  const mockedApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  const mockComments = [
    {
      id: 1,
      content: "מתכון מעולה!",
      username: "שחר",
      user_id: 1,
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("מציג טקסט התחברות אם אין משתמש", async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.startsWith("/auth/me")) throw new Error("unauthorized");
      if (url.startsWith("/comments")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <CommentsSection recipeId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/יש להתחבר כדי להגיב/)).toBeInTheDocument();
    });
  });

  it("מציג textarea ושלח תגובה אם המשתמש מחובר", async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.startsWith("/auth/me")) return Promise.resolve({ data: { id: 1, is_admin: false } });
      if (url.startsWith("/comments")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <CommentsSection recipeId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("כתוב תגובה...")).toBeInTheDocument();
    });
  });

  it("מציג תגובה קיימת", async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.startsWith("/auth/me")) return Promise.resolve({ data: { id: 1, is_admin: false } });
      if (url.startsWith("/comments")) return Promise.resolve({ data: mockComments });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <CommentsSection recipeId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("מתכון מעולה!")).toBeInTheDocument();
    });
  });

  it("מאפשר לשלוח תגובה חדשה", async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.startsWith("/auth/me")) return Promise.resolve({ data: { id: 1, is_admin: false } });
      if (url.startsWith("/comments")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    mockedApi.post.mockResolvedValue({});

    render(
      <MemoryRouter>
        <CommentsSection recipeId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("כתוב תגובה...")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("כתוב תגובה..."), {
      target: { value: "תגובה חדשה" },
    });

    fireEvent.click(screen.getByText("שלח תגובה"));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/comments/1", { content: "תגובה חדשה" });
    });
  });

  it("מאפשר למחוק תגובה אם המשתמש הוא הבעלים", async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    mockedApi.get.mockImplementation((url: string) => {
      if (url.startsWith("/auth/me")) return Promise.resolve({ data: { id: 1, is_admin: false } });
      if (url.startsWith("/comments")) return Promise.resolve({ data: mockComments });
      return Promise.resolve({ data: [] });
    });

    (deleteComment as ReturnType<typeof vi.fn>).mockResolvedValue({});

    render(
      <MemoryRouter>
        <CommentsSection recipeId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🗑️")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("🗑️"));

    await waitFor(() => {
      expect(deleteComment).toHaveBeenCalledWith(1);
    });
  });
});
