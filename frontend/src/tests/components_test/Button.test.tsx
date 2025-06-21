import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { vi } from "vitest";

describe("Button component", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });

  it("renders with different variants", () => {
    render(
      <>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
      </>
    );

    expect(screen.getByText("Default")).toHaveClass("bg-primary");
    expect(screen.getByText("Destructive")).toHaveClass("bg-destructive");
    expect(screen.getByText("Ghost")).toHaveClass("hover:bg-accent");
    expect(screen.getByText("Outline")).toHaveClass("border");
  });

  it("renders with size variants", () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="icon-button">
          <svg />
        </Button>
      </>
    );

    expect(screen.getByText("Small")).toHaveClass("h-8");
    expect(screen.getByText("Large")).toHaveClass("h-10");
    expect(screen.getByLabelText("icon-button")).toHaveClass("h-9 w-9");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText("Click").click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can render as a child component (Slot)", () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
  });
});
