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

type Kid = {
    id: string
    name: string
}

type RangeConfig = {
    name: string
    startsAt: string
    endsAt: string
    tasksByKidId: Record<string, string[]>
}

type KidsScheduleConfig = {
    kids: Kid[]
    ranges: RangeConfig[]
}

export type {Child, Kid, KidsScheduleConfig, Range, RangeConfig}
