type Child = {
    name: string
    tasks: string[]
}

type Period = {
    name: string
    startsAt: string
    endsAt: string
    children: Child[]
}

export type {Child, Period}
