import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { vi } from "vitest";

describe("ProtectedRoute", () => {
  const originalGetItem = window.localStorage.getItem;

  afterEach(() => {
    // ניקוי localStorage לאחר כל טסט
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("מציג את הילדים אם הטוקן תקף", async () => {
    const validToken = {
      exp: Math.floor(Date.now() / 1000) + 60, // לא פג תוקף
    };
    const token = `header.${btoa(JSON.stringify(validToken))}.signature`;

    vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(token);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>תוכן סודי</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("תוכן סודי")).toBeInTheDocument();
    });
  });

  it("מנתב ל־/login אם אין טוקן", async () => {
    vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <ProtectedRoute>
          <div>תוכן סודי</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("תוכן סודי")).not.toBeInTheDocument();
    });
  });

  it("מנתב ל־/login אם הטוקן פג תוקף", async () => {
    const expiredToken = {
      exp: Math.floor(Date.now() / 1000) - 60, // פג תוקף
    };
    const token = `header.${btoa(JSON.stringify(expiredToken))}.signature`;

    vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(token);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <ProtectedRoute>
          <div>תוכן סודי</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("תוכן סודי")).not.toBeInTheDocument();
    });
  });
});
