type Child = {
    name: string
    tasks: string[]
}

type Range = {
    name: string
    startsAt: string
    endsAt: string
    children: Child[]
}

export type {Child, Range}
