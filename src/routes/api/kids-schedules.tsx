import {data} from "react-router"

import {kidsSchedules} from "~/data"

const loader = () => {
    const [period] = kidsSchedules.periods
    const {children, ...periodDetails} = period

    return data({period: periodDetails, children}, {status: 200})
}

export {loader}
