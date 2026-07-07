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

const getPeriodDetails = (period: Period) => {
    const {children, ...periodDetails} = period

    return periodDetails
}

const getCurrentPeriod = (date = new Date()) => {
    const time = getTime(date)

    return kidsSchedules.periods.find(period => isCurrentPeriod(period, time))
}

const getNextPeriod = (date = new Date()) => {
    const time = getTime(date)

    return (
        kidsSchedules.periods.find(period => period.startsAt > time) ??
        kidsSchedules.periods[0]
    )
}

const loader = () => {
    const period = getCurrentPeriod()

    if (!period) {
        const nextPeriod = getNextPeriod()

        return data(
            {
                period: null,
                nextPeriod: getPeriodDetails(nextPeriod),
                children: [],
            },
            {status: 200},
        )
    }

    return data(
        {
            period: getPeriodDetails(period),
            nextPeriod: null,
            children: period.children,
        },
        {status: 200},
    )
}

export {getCurrentPeriod, getNextPeriod, loader}
