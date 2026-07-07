import {afterEach, expect, test, vi} from "vitest"

import {getCurrentPeriod, loader} from "~/routes/api/kids-schedules"

afterEach(() => {
    vi.useRealTimers()
})

test("returns the morning kids schedule", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-06T11:30:00.000Z"))

    const {data, init} = loader()

    expect(init).toMatchObject({status: 200})
    expect(data).toEqual({
        TRMNL_SKIP_DISPLAY: false,
        period: {
            name: "Morning",
            startsAt: "06:00",
            endsAt: "08:00",
        },
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
    })
})

test("returns the night kids schedule", () => {
    const period = getCurrentPeriod(new Date("2026-07-07T00:30:00.000Z"))

    expect(period).toMatchObject({
        name: "Night",
        startsAt: "19:00",
        endsAt: "21:00",
    })
})

test("skips display outside configured periods", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-06T14:00:00.000Z"))

    const {data, init} = loader()

    expect(init).toMatchObject({status: 200})
    expect(data).toEqual({
        TRMNL_SKIP_DISPLAY: true,
        period: null,
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
])("returns the correct period at %s", (_, date, expectedPeriod) => {
    const period = getCurrentPeriod(new Date(date))

    expect(period?.name).toBe(expectedPeriod)
})
