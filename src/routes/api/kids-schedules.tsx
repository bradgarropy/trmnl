import {data} from "react-router"

import {kidsSchedules} from "~/data"
import type {Range} from "~/types"

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

const getCurrentRange = (date = new Date()) => {
    const time = getTime(date)

    return kidsSchedules.ranges.find(range => isCurrentRange(range, time))
}

const loader = () => {
    const range = getCurrentRange()

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

export {getCurrentRange, loader}
