import {render, screen, waitFor} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {type ActionFunction, createRoutesStub} from "react-router"
import {toast} from "sonner"
import {afterEach, expect, test, vi} from "vitest"

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
        info: vi.fn(),
        success: vi.fn(),
    },
}))

import Route, {createConfig} from "~/routes/kids-schedules"
import type {KidsScheduleConfig, Range} from "~/types"

const ranges: [Range, ...Range[]] = [
    {
        name: "Morning",
        startsAt: "06:00",
        endsAt: "08:00",
        children: [
            {
                name: "Sofia",
                tasks: ["Restroom", "Brush Teeth", "Brush Hair", "Make Bed"],
            },
            {
                name: "Justin",
                tasks: ["Restroom", "Brush Teeth", "Brush Hair", "Make Bed"],
            },
        ],
    },
    {
        name: "Night",
        startsAt: "19:00",
        endsAt: "21:00",
        children: [
            {
                name: "Sofia",
                tasks: ["Pajamas", "Brush Teeth", "Floss Teeth", "Restroom"],
            },
            {
                name: "Justin",
                tasks: ["Pajamas", "Brush Teeth", "Floss Teeth", "Restroom"],
            },
        ],
    },
]

const config = createConfig(ranges)

afterEach(() => {
    vi.clearAllMocks()
})

const renderRoute = (
    routeConfig: KidsScheduleConfig | null = config,
    action: ReturnType<typeof vi.fn> = vi.fn(async () => ({success: true})),
) => {
    const Stub = createRoutesStub([
        {
            path: "/",
            Component: Route,
            loader: () => routeConfig,
            action: action as ActionFunction,
        },
    ])

    render(<Stub />)

    return {action}
}

test("renders the kids schedules editor", async () => {
    renderRoute()

    await waitFor(() =>
        expect(document.title).toEqual("trmnl | kids schedules"),
    )
    expect(
        await screen.findByRole("heading", {name: "Kids Schedules"}),
    ).toBeVisible()
    expect(screen.getByRole("heading", {name: "Kids"})).toBeVisible()
    expect(screen.getByDisplayValue("Morning")).toBeVisible()
    expect(screen.getByDisplayValue("Night")).toBeVisible()
    expect(screen.getAllByDisplayValue("Sofia")).toHaveLength(1)
    expect(screen.getAllByDisplayValue("Justin")).toHaveLength(1)
    expect(screen.getAllByRole("heading", {name: "Sofia"})).toHaveLength(2)
    expect(screen.getAllByRole("heading", {name: "Justin"})).toHaveLength(2)
    expect(screen.getAllByDisplayValue("Make Bed")).toHaveLength(2)
    expect(screen.getAllByDisplayValue("Floss Teeth")).toHaveLength(2)
    expect(screen.getByRole("button", {name: "Reset"})).toBeDisabled()
    expect(screen.getByRole("button", {name: "Save"})).toBeDisabled()
})

test("edits schedule fields locally", async () => {
    const user = userEvent.setup()

    renderRoute()

    const morning = await screen.findByDisplayValue("Morning")
    await user.clear(morning)
    await user.type(morning, "Before School")

    expect(screen.getByDisplayValue("Before School")).toBeVisible()
    expect(screen.getByRole("button", {name: "Reset"})).toBeEnabled()
    expect(screen.getByRole("button", {name: "Save"})).toBeEnabled()
})

test("resets local edits to the saved config", async () => {
    const user = userEvent.setup()
    const {action} = renderRoute()

    const morning = await screen.findByDisplayValue("Morning")
    await user.clear(morning)
    await user.type(morning, "Before School")
    await user.click(screen.getByRole("button", {name: "Reset"}))

    expect(screen.getByDisplayValue("Morning")).toBeVisible()
    expect(screen.queryByDisplayValue("Before School")).not.toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Reset"})).toBeDisabled()
    expect(screen.getByRole("button", {name: "Save"})).toBeDisabled()
    expect(action).not.toHaveBeenCalled()
    expect(toast.info).toHaveBeenCalledWith(
        "Reset",
        expect.objectContaining({icon: expect.any(Object)}),
    )

    const resetToastOptions = vi.mocked(toast.info).mock.calls[0]?.[1] as {
        icon?: {props?: {className?: string}}
    }

    expect(resetToastOptions.icon?.props?.className).toContain(
        "text-foreground",
    )
})

test("adds and removes ranges, kids, and tasks", async () => {
    const user = userEvent.setup()

    renderRoute()

    await user.click(await screen.findByRole("button", {name: "Add Range"}))
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

    renderRoute()

    await screen.findByDisplayValue("Morning")

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

test("saves the edited config", async () => {
    const user = userEvent.setup()
    const action = vi.fn(async ({request}: {request: Request}) => {
        const formData = await request.formData()
        return {
            config: JSON.parse(String(formData.get("config"))),
            success: true,
        }
    })

    renderRoute(config, action)

    const morning = await screen.findByDisplayValue("Morning")
    await user.clear(morning)
    await user.type(morning, "Before School")
    await user.click(screen.getByRole("button", {name: "Save"}))

    await waitFor(() => expect(action).toHaveBeenCalledOnce())
    await expect(action.mock.results[0]?.value).resolves.toEqual({
        config: expect.objectContaining({
            ranges: expect.arrayContaining([
                expect.objectContaining({name: "Before School"}),
            ]),
        }),
        success: true,
    })
    await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
            "Saved",
            expect.objectContaining({icon: expect.any(Object)}),
        ),
    )

    const savedToastOptions = vi.mocked(toast.success).mock.calls[0]?.[1] as {
        icon?: {props?: {className?: string}}
    }

    expect(savedToastOptions.icon?.props?.className).toContain("text-primary")
    expect(screen.getByRole("button", {name: "Save"})).toBeDisabled()
})

test("shows save errors", async () => {
    const user = userEvent.setup()

    renderRoute(
        config,
        vi.fn(async () => ({success: false})),
    )

    const morning = await screen.findByDisplayValue("Morning")
    await user.clear(morning)
    await user.type(morning, "Before School")
    await user.click(screen.getByRole("button", {name: "Save"}))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Save failed"))
    expect(screen.getByRole("button", {name: "Save"})).toBeEnabled()
})
