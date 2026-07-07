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

test("returns an empty schedule outside configured periods", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-06T14:00:00.000Z"))

    const {data, init} = loader()

    expect(init).toMatchObject({status: 200})
    expect(data).toEqual({period: null, children: []})
})
