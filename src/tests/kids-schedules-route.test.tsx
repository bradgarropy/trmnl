import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {expect, test} from "vitest"

import Route from "~/routes/kids-schedules"

test("renders the kids schedules editor", () => {
    render(<Route />)

    expect(document.title).toEqual("trmnl | kids schedules")
    expect(screen.getByRole("heading", {name: "Kids Schedules"})).toBeVisible()
    expect(screen.getByRole("heading", {name: "Kids"})).toBeVisible()
    expect(screen.getByDisplayValue("Morning")).toBeVisible()
    expect(screen.getByDisplayValue("Night")).toBeVisible()
    expect(screen.getAllByDisplayValue("Sofia")).toHaveLength(1)
    expect(screen.getAllByDisplayValue("Justin")).toHaveLength(1)
    expect(screen.getAllByRole("heading", {name: "Sofia"})).toHaveLength(2)
    expect(screen.getAllByRole("heading", {name: "Justin"})).toHaveLength(2)
    expect(screen.getAllByDisplayValue("Make Bed")).toHaveLength(2)
    expect(screen.getAllByDisplayValue("Floss Teeth")).toHaveLength(2)
    expect(
        screen.getByRole("button", {name: "Save Coming Soon"}),
    ).toBeDisabled()
})

test("edits schedule fields locally", async () => {
    const user = userEvent.setup()

    render(<Route />)

    const morning = screen.getByDisplayValue("Morning")
    await user.clear(morning)
    await user.type(morning, "Before School")

    expect(screen.getByDisplayValue("Before School")).toBeVisible()
})

test("adds and removes periods, kids, and tasks", async () => {
    const user = userEvent.setup()

    render(<Route />)

    await user.click(screen.getByRole("button", {name: "Add Period"}))
    expect(screen.getAllByDisplayValue("06:00")).toHaveLength(2)

    await user.click(screen.getByRole("button", {name: "Add Kid"}))
    expect(screen.getAllByDisplayValue("")).not.toHaveLength(0)

    await user.click(screen.getAllByRole("button", {name: "Add Task"})[0])
    expect(screen.getAllByLabelText(/task/i).length).toBeGreaterThan(8)

    await user.click(screen.getByRole("button", {name: "Remove Sofia"}))
    expect(screen.queryByDisplayValue("Sofia")).not.toBeInTheDocument()
    expect(screen.queryAllByRole("heading", {name: "Sofia"})).toHaveLength(0)
})

test("edits times, kids, and tasks locally", async () => {
    const user = userEvent.setup()

    render(<Route />)

    const startsAt = screen.getAllByDisplayValue("06:00")[0]
    await user.clear(startsAt)
    await user.type(startsAt, "06:30")

    const endsAt = screen.getAllByDisplayValue("08:00")[0]
    await user.clear(endsAt)
    await user.type(endsAt, "08:30")

    const sofia = screen.getAllByDisplayValue("Sofia")[0]
    await user.clear(sofia)
    await user.type(sofia, "Sof")

    const restroom = screen.getAllByDisplayValue("Restroom")[0]
    await user.clear(restroom)
    await user.type(restroom, "Shoes")

    expect(screen.getByDisplayValue("06:30")).toBeVisible()
    expect(screen.getByDisplayValue("08:30")).toBeVisible()
    expect(screen.getByDisplayValue("Sof")).toBeVisible()
    expect(screen.getAllByRole("heading", {name: "Sof"})).toHaveLength(2)
    expect(screen.getByDisplayValue("Shoes")).toBeVisible()
})
