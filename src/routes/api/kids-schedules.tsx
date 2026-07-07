import {data} from "react-router"

import {kidsSchedules} from "~/data"
import type {Period} from "~/types"

const TIME_ZONE = "America/Chicago"

const getTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIME_ZONE,
    }).format(date)
}

const isCurrentPeriod = (period: Period, time: string) => {
    return time >= period.startsAt && time < period.endsAt
}

const getCurrentPeriod = (date = new Date()) => {
    const time = getTime(date)

    return kidsSchedules.periods.find(period => isCurrentPeriod(period, time))
}

const loader = () => {
    const period = getCurrentPeriod()

    if (!period) {
        return data({period: null, children: []}, {status: 200})
    }

    const {children, ...periodDetails} = period

    return data({period: periodDetails, children}, {status: 200})
}

export {getCurrentPeriod, loader}
