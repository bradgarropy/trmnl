import {expect, test} from "vitest"

import {loader} from "~/routes/api/kids-schedules"

test("returns kids schedules", () => {
    const {data, init} = loader()

    expect(init).toMatchObject({status: 200})
    expect(data).toEqual({
        period: {
            name: "Morning",
            startsAt: "06:00",
            endsAt: "11:00",
        },
        children: [
            {
                name: "Sofia",
                tasks: ["Restroom", "Brush Teeth"],
            },
            {
                name: "Justin",
                tasks: ["Restroom", "Brush Teeth"],
            },
        ],
    })
})
