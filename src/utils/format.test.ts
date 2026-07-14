import {expect, test} from "vitest"

import {formatTime} from "~/utils/format"

test.each([
    ["00:00", "12:00AM"],
    ["06:00", "6:00AM"],
    ["12:00", "12:00PM"],
    ["19:00", "7:00PM"],
])("formats %s as %s", (time, expected) => {
    expect(formatTime(time)).toEqual(expected)
})
