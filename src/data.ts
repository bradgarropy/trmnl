const kidsSchedules = {
    periods: [
        {
            name: "Morning",
            startsAt: "06:00",
            endsAt: "11:00",
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
        },
        {
            name: "Afternoon",
            startsAt: "15:00",
            endsAt: "18:00",
            children: [
                {
                    name: "Sofia",
                    tasks: ["Snack", "Homework"],
                },
                {
                    name: "Justin",
                    tasks: ["Snack", "Homework"],
                },
            ],
        },
        {
            name: "Night",
            startsAt: "18:00",
            endsAt: "21:00",
            children: [
                {
                    name: "Sofia",
                    tasks: ["Bath", "Pajamas", "Brush Teeth"],
                },
                {
                    name: "Justin",
                    tasks: ["Bath", "Pajamas", "Brush Teeth"],
                },
            ],
        },
    ],
}

export {kidsSchedules}
