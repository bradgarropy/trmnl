import {data, type LoaderFunctionArgs} from "react-router"

import {kidsSchedules} from "~/data"
import {getKidsScheduleConfig} from "~/kids-schedules.server"
import type {KidsScheduleConfig, Range} from "~/types"

const TIME_ZONE = "America/Chicago"

const getTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIME_ZONE,
    }).format(date)
}

const isCurrentRange = (range: Range, time: string) => {
    return time >= range.startsAt && time < range.endsAt
}

const getRangeDetails = (range: Range) => {
    const {children, ...rangeDetails} = range

    return rangeDetails
}

const getCurrentRange = (
    date = new Date(),
    ranges: Range[] = kidsSchedules.ranges,
) => {
    const time = getTime(date)

    return ranges.find(range => isCurrentRange(range, time))
}

const toRanges = (config: KidsScheduleConfig): Range[] => {
    return config.ranges.map(range => ({
        name: range.name,
        startsAt: range.startsAt,
        endsAt: range.endsAt,
        children: config.kids.map(kid => ({
            name: kid.name,
            tasks: range.tasksByKidId[kid.id] ?? [],
        })),
    }))
}

const getRanges = async (db: D1Database) => {
    const config = await getKidsScheduleConfig(db)

    if (!config) {
        return []
    }

    return toRanges(config)
}

const loader = async ({context}: LoaderFunctionArgs) => {
    const ranges = await getRanges(context.cloudflare.env.DB)
    const range = getCurrentRange(new Date(), ranges)

    if (!range) {
        return data(
            {
                TRMNL_SKIP_DISPLAY: true,
                range: null,
                children: [],
            },
            {status: 200},
        )
    }

    return data(
        {
            TRMNL_SKIP_DISPLAY: false,
            range: getRangeDetails(range),
            children: range.children,
        },
        {status: 200},
    )
}

export {getCurrentRange, loader, toRanges}
