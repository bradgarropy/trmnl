import type {KidsScheduleConfig} from "~/types"

const KIDS_SCHEDULES_KEY = "kids_schedules"

type SettingsRow = {
    value: string
}

const getKidsScheduleConfig = async (db: D1Database) => {
    const row = await db
        .prepare("select value from settings where key = ?")
        .bind(KIDS_SCHEDULES_KEY)
        .first<SettingsRow>()

    if (!row) {
        return null
    }

    return JSON.parse(row.value) as KidsScheduleConfig
}

const saveKidsScheduleConfig = async (
    db: D1Database,
    config: KidsScheduleConfig,
    updatedAt = new Date(),
) => {
    await db
        .prepare(
            `
                insert into settings (key, value, updated_at)
                values (?, ?, ?)
                on conflict(key) do update set
                    value = excluded.value,
                    updated_at = excluded.updated_at
            `,
        )
        .bind(
            KIDS_SCHEDULES_KEY,
            JSON.stringify(config),
            updatedAt.toISOString(),
        )
        .run()
}

export {getKidsScheduleConfig, saveKidsScheduleConfig}
