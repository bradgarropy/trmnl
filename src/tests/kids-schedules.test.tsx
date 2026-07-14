import type {LoaderFunctionArgs} from "react-router"
import {afterEach, expect, test, vi} from "vitest"

import {getCurrentRange, loader} from "~/routes/api/kids-schedules"
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

afterEach(() => {
    vi.useRealTimers()
})

const createD1Mock = (row?: {value: string} | null) => {
    const first = vi.fn(async () => row)
    const bind = vi.fn(() => ({first}))
    const prepare = vi.fn(() => ({bind}))

    return {prepare} as unknown as D1Database
}

const createLoaderArgs = (db = createD1Mock(null)) => {
    return {
        context: {
            cloudflare: {
                env: {DB: db} as Env,
                ctx: {} as ExecutionContext,
            },
        },
    } as LoaderFunctionArgs
}

test("skips display when config does not exist", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-06T11:30:00.000Z"))

    const {data, init} = await loader(createLoaderArgs())

    expect(init).toMatchObject({status: 200})
    expect(data).toEqual({
        TRMNL_SKIP_DISPLAY: true,
        range: null,
        children: [],
    })
})

test("returns the night kids schedule", () => {
    const range = getCurrentRange(new Date("2026-07-07T00:30:00.000Z"), ranges)

    expect(range).toMatchObject({
        name: "Night",
        startsAt: "19:00",
        endsAt: "21:00",
    })
})

test("returns the kids schedule from D1 when config exists", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-07T00:30:00.000Z"))

    const config: KidsScheduleConfig = {
        kids: [
            {
                id: "sofia-0",
                name: "Sofia",
            },
        ],
        ranges: [
            {
                name: "Bedtime",
                startsAt: "19:00",
                endsAt: "21:00",
                tasksByKidId: {
                    "sofia-0": ["Shoes", "Backpack"],
                },
            },
        ],
    }

    const {data, init} = await loader(
        createLoaderArgs(createD1Mock({value: JSON.stringify(config)})),
    )

    expect(init).toMatchObject({status: 200})
    expect(data).toEqual({
        TRMNL_SKIP_DISPLAY: false,
        range: {
            name: "Bedtime",
            startsAt: "7:00PM",
            endsAt: "9:00PM",
        },
        children: [
            {
                name: "Sofia",
                tasks: ["Shoes", "Backpack"],
            },
        ],
    })
})

test("skips display outside configured ranges", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-06T14:00:00.000Z"))
    const config: KidsScheduleConfig = {
        kids: [
            {
                id: "sofia-0",
                name: "Sofia",
            },
        ],
        ranges: [
            {
                name: "Before School",
                startsAt: "06:00",
                endsAt: "08:00",
                tasksByKidId: {
                    "sofia-0": ["Shoes", "Backpack"],
                },
            },
        ],
    }

    const {data, init} = await loader(
        createLoaderArgs(createD1Mock({value: JSON.stringify(config)})),
    )

    expect(init).toMatchObject({status: 200})
    expect(data).toEqual({
        TRMNL_SKIP_DISPLAY: true,
        range: null,
        children: [],
    })
})

test.each([
    ["05:59", "2026-07-06T10:59:00.000Z", undefined],
    ["06:00", "2026-07-06T11:00:00.000Z", "Morning"],
    ["07:59", "2026-07-06T12:59:00.000Z", "Morning"],
    ["08:00", "2026-07-06T13:00:00.000Z", undefined],
    ["18:59", "2026-07-06T23:59:00.000Z", undefined],
    ["19:00", "2026-07-07T00:00:00.000Z", "Night"],
    ["20:59", "2026-07-07T01:59:00.000Z", "Night"],
    ["21:00", "2026-07-07T02:00:00.000Z", undefined],
])("returns the correct range at %s", (_, date, expectedRange) => {
    const range = getCurrentRange(new Date(date), ranges)

    expect(range?.name).toBe(expectedRange)
})
