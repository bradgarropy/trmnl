import {render, screen} from "@testing-library/react"
import {expect, test} from "vitest"

import Header from "~/components/Header"

test("renders", () => {
    render(<Header />)

    const trmnlLink = screen.getByRole("link", {name: "TRMNL"})
    expect(trmnlLink).toBeInTheDocument()
    expect(trmnlLink).toHaveAttribute("href", "https://trmnl.com")
    expect(trmnlLink).toHaveAttribute("rel", "noreferrer")
    expect(trmnlLink).toHaveAttribute("target", "_blank")

    const bradGarropyLink = screen.getByRole("link", {name: "Brad Garropy"})
    expect(bradGarropyLink).toBeInTheDocument()
    expect(bradGarropyLink).toHaveAttribute("href", "https://bradgarropy.com")
    expect(bradGarropyLink).toHaveAttribute("rel", "noreferrer")
    expect(bradGarropyLink).toHaveAttribute("target", "_blank")
    expect(bradGarropyLink).toHaveTextContent("built by")
})
