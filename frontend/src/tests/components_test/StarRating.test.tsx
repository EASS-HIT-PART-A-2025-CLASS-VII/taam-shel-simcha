import { render, screen, fireEvent } from "@testing-library/react";
import StarRating from "@/components/StarRating";
import { vi } from "vitest";

describe("StarRating", () => {
  it("מציג את מספר הכוכבים לפי דירוג התחלתי", () => {
    render(<StarRating rating={3} />);
    const filledStars = screen.getAllByTestId("star-filled");
    expect(filledStars.length).toBe(3);
  });

  it("מציג את כל הכוכבים באפור אם הדירוג הוא 0", () => {
    render(<StarRating rating={0} />);
    const filledStars = screen.queryAllByTestId("star-filled");
    expect(filledStars.length).toBe(0);
  });

  it("מפעיל onRate כאשר לוחצים על כוכב", () => {
    const onRateMock = vi.fn();
    render(<StarRating onRate={onRateMock} />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]); // כוכב 3
    expect(onRateMock).toHaveBeenCalledWith(3);
  });

  it("לא מפעיל onRate כש־readonly=true", () => {
    const onRateMock = vi.fn();
    render(<StarRating onRate={onRateMock} readonly />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[4]); // כוכב 5
    expect(onRateMock).not.toHaveBeenCalled();
  });

  it("משנה את הכוכבים בעת מעבר עם העכבר", () => {
    render(<StarRating />);
    const stars = screen.getAllByRole("button");
    fireEvent.mouseEnter(stars[1]); // מעבר מעל כוכב 2
    const hoverStars = screen.getAllByTestId("star-filled");
    expect(hoverStars.length).toBe(2);
  });

  it("מציג את הדירוג הנוכחי כטקסט", () => {
    render(<StarRating rating={4.2} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });
});
