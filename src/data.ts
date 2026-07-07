import type {Period} from "~/types"

const kidsSchedules: {periods: Period[]} = {
    periods: [
        {
            name: "Morning",
            startsAt: "06:00",
            endsAt: "08:00",
            children: [
                {
                    name: "Sofia",
                    tasks: [
                        "Restroom",
                        "Brush Teeth",
                        "Brush Hair",
                        "Make Bed",
                    ],
                },
                {
                    name: "Justin",
                    tasks: [
                        "Restroom",
                        "Brush Teeth",
                        "Brush Hair",
                        "Make Bed",
                    ],
                },
            ],
        },
        {
            name: "Night",
            startsAt: "19:00",
            endsAt: "21:00",
            children: [
                {
                    name: "Sofia",
                    tasks: [
                        "Pajamas",
                        "Brush Teeth",
                        "Floss Teeth",
                        "Restroom",
                    ],
                },
                {
                    name: "Justin",
                    tasks: [
                        "Pajamas",
                        "Brush Teeth",
                        "Floss Teeth",
                        "Restroom",
                    ],
                },
            ],
        },
    ],
}

export {kidsSchedules}
