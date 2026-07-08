import {expect, test, vi} from "vitest"

import {
    getKidsScheduleConfig,
    saveKidsScheduleConfig,
} from "~/kids-schedules.server"
import type {KidsScheduleConfig} from "~/types"

const createD1Mock = (row?: {value: string} | null) => {
    const first = vi.fn(async () => row)
    const run = vi.fn(async () => ({success: true}))
    const bind = vi.fn(() => ({first, run}))
    const prepare = vi.fn(() => ({bind}))

    return {
        db: {prepare} as unknown as D1Database,
        first,
        run,
        bind,
        prepare,
    }
}

const config: KidsScheduleConfig = {
    kids: [
        {
            id: "sofia-0",
            name: "Sofia",
        },
    ],
    ranges: [
        {
            name: "Morning",
            startsAt: "06:00",
            endsAt: "08:00",
            tasksByKidId: {
                "sofia-0": ["Brush Teeth"],
            },
        },
    ],
}

test("gets kids schedule config", async () => {
    const {db, bind, prepare} = createD1Mock({
        value: JSON.stringify(config),
    })

    await expect(getKidsScheduleConfig(db)).resolves.toEqual(config)
    expect(prepare).toHaveBeenCalledWith(
        "select value from settings where key = ?",
    )
    expect(bind).toHaveBeenCalledWith("kids_schedules")
})

test("returns null when kids schedule config does not exist", async () => {
    const {db} = createD1Mock(null)

    await expect(getKidsScheduleConfig(db)).resolves.toBeNull()
})

test("saves kids schedule config", async () => {
    const {db, bind, prepare, run} = createD1Mock()
    const updatedAt = new Date("2026-07-08T01:23:45.000Z")

    await saveKidsScheduleConfig(db, config, updatedAt)

    expect(prepare).toHaveBeenCalledWith(
        expect.stringContaining("insert into settings"),
    )
    expect(bind).toHaveBeenCalledWith(
        "kids_schedules",
        JSON.stringify(config),
        "2026-07-08T01:23:45.000Z",
    )
    expect(run).toHaveBeenCalledOnce()
})
