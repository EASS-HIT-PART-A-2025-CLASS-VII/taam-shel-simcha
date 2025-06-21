// src/tests/components_test/RequireAuth.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import RequireAuth from "@/components/RequireAuth";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

const mockToken = (payload: object) => {
  const base64Payload = btoa(JSON.stringify(payload));
  const token = `header.${base64Payload}.signature`;
  localStorage.setItem("token", token);
};

describe("RequireAuth", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("מציג את הילדים אם הטוקן תקף", async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 60 * 60; // בעוד שעה
    mockToken({ exp: futureExp });

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <RequireAuth>
                <div data-testid="protected">תוכן סודי</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>התחברות</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected")).toBeInTheDocument();
    });
  });

  it("מנתב ל־/login אם אין טוקן", async () => {
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <RequireAuth>
                <div data-testid="protected">תוכן סודי</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>התחברות</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("התחברות")).toBeInTheDocument();
    });
  });

  it("מנתב ל־/login אם הטוקן פג תוקף", async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60; // לפני דקה
    mockToken({ exp: pastExp });

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <RequireAuth>
                <div data-testid="protected">תוכן סודי</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>התחברות</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("התחברות")).toBeInTheDocument();
    });
  });
});
