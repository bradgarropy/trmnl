import {Trash2} from "lucide-react"
import {useState} from "react"

import {Button} from "~/components/ui/button"
import {Input} from "~/components/ui/input"
import {Label} from "~/components/ui/label"
import {kidsSchedules} from "~/data"
import type {Child, Period} from "~/types"

type Kid = {
    id: string
    name: string
}

type PeriodConfig = {
    name: string
    startsAt: string
    endsAt: string
    tasksByKidId: Record<string, string[]>
}

type ScheduleConfig = {
    kids: Kid[]
    periods: PeriodConfig[]
}

const createId = (value: string, index: number) => {
    return `${value.toLowerCase().replaceAll(/\s+/g, "-")}-${index}`
}

const createKid = (name = "", index = Date.now()): Kid => {
    return {
        id: createId(name || "kid", index),
        name,
    }
}

const createPeriod = (kids: Kid[]): PeriodConfig => {
    return {
        name: "",
        startsAt: "06:00",
        endsAt: "07:00",
        tasksByKidId: Object.fromEntries(kids.map(kid => [kid.id, [""]])),
    }
}

const getUniqueChildren = (periods: Period[]) => {
    return periods.reduce<Child[]>((children, period) => {
        for (const child of period.children) {
            const exists = children.some(
                currentChild => currentChild.name === child.name,
            )

            if (!exists) {
                children.push({name: child.name, tasks: []})
            }
        }

        return children
    }, [])
}

const createConfig = (periods: Period[]): ScheduleConfig => {
    const kids = getUniqueChildren(periods).map((child, index) =>
        createKid(child.name, index),
    )

    return {
        kids,
        periods: periods.map(period => ({
            name: period.name,
            startsAt: period.startsAt,
            endsAt: period.endsAt,
            tasksByKidId: Object.fromEntries(
                kids.map(kid => {
                    const child = period.children.find(
                        currentChild => currentChild.name === kid.name,
                    )

                    return [kid.id, child?.tasks ?? []]
                }),
            ),
        })),
    }
}

const Route = () => {
    const [config, setConfig] = useState(() =>
        createConfig(kidsSchedules.periods),
    )

    const updateKid = (kidIndex: number, name: string) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            kids: currentConfig.kids.map((kid, index) =>
                index === kidIndex ? {...kid, name} : kid,
            ),
        }))
    }

    const addKid = () => {
        setConfig(currentConfig => {
            const kid = createKid("", currentConfig.kids.length)

            return {
                kids: [...currentConfig.kids, kid],
                periods: currentConfig.periods.map(period => ({
                    ...period,
                    tasksByKidId: {...period.tasksByKidId, [kid.id]: [""]},
                })),
            }
        })
    }

    const removeKid = (kidId: string) => {
        setConfig(currentConfig => ({
            kids: currentConfig.kids.filter(kid => kid.id !== kidId),
            periods: currentConfig.periods.map(period => {
                const {[kidId]: removedTasks, ...tasksByKidId} =
                    period.tasksByKidId
                void removedTasks

                return {...period, tasksByKidId}
            }),
        }))
    }

    const updatePeriod = (
        periodIndex: number,
        updates: Partial<Omit<PeriodConfig, "tasksByKidId">>,
    ) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            periods: currentConfig.periods.map((period, index) =>
                index === periodIndex ? {...period, ...updates} : period,
            ),
        }))
    }

    const addPeriod = () => {
        setConfig(currentConfig => ({
            ...currentConfig,
            periods: [
                ...currentConfig.periods,
                createPeriod(currentConfig.kids),
            ],
        }))
    }

    const removePeriod = (periodIndex: number) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            periods: currentConfig.periods.filter(
                (_, index) => index !== periodIndex,
            ),
        }))
    }

    const updateTask = (
        periodIndex: number,
        kidId: string,
        taskIndex: number,
        task: string,
    ) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            periods: currentConfig.periods.map((period, index) => {
                if (index !== periodIndex) {
                    return period
                }

                return {
                    ...period,
                    tasksByKidId: {
                        ...period.tasksByKidId,
                        [kidId]: period.tasksByKidId[kidId].map(
                            (currentTask, currentTaskIndex) =>
                                currentTaskIndex === taskIndex
                                    ? task
                                    : currentTask,
                        ),
                    },
                }
            }),
        }))
    }

    const addTask = (periodIndex: number, kidId: string) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            periods: currentConfig.periods.map((period, index) =>
                index === periodIndex
                    ? {
                          ...period,
                          tasksByKidId: {
                              ...period.tasksByKidId,
                              [kidId]: [...period.tasksByKidId[kidId], ""],
                          },
                      }
                    : period,
            ),
        }))
    }

    const removeTask = (
        periodIndex: number,
        kidId: string,
        taskIndex: number,
    ) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            periods: currentConfig.periods.map((period, index) =>
                index === periodIndex
                    ? {
                          ...period,
                          tasksByKidId: {
                              ...period.tasksByKidId,
                              [kidId]: period.tasksByKidId[kidId].filter(
                                  (_, currentTaskIndex) =>
                                      currentTaskIndex !== taskIndex,
                              ),
                          },
                      }
                    : period,
            ),
        }))
    }

    return (
        <>
            <title>trmnl | kids schedules</title>

            <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-24 sm:gap-8 sm:pb-0">
                <div>
                    <h2 className="text-2xl font-bold">Kids Schedules</h2>
                    <p className="mt-2 text-muted-foreground">
                        Configure kids once, then customize their tasks for each
                        display period.
                    </p>
                </div>

                <section className="mb-2 sm:mb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Kids</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Kid names are shared across every period.
                            </p>
                        </div>

                        <Button
                            variant="secondary"
                            type="button"
                            onClick={addKid}
                        >
                            Add Kid
                        </Button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {config.kids.map((kid, kidIndex) => (
                            <div
                                className="flex items-center gap-3"
                                key={kid.id}
                            >
                                <Input
                                    aria-label={`Kid ${kidIndex + 1} name`}
                                    className="text-lg sm:flex-1"
                                    value={kid.name}
                                    onChange={event =>
                                        updateKid(kidIndex, event.target.value)
                                    }
                                />

                                <Button
                                    aria-label={`Remove ${kid.name || "kid"}`}
                                    className="text-muted-foreground hover:text-muted-foreground"
                                    size="icon"
                                    variant="outline"
                                    type="button"
                                    onClick={() => removeKid(kid.id)}
                                >
                                    <Trash2
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">Periods</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set the display windows, then customize tasks for
                            each kid.
                        </p>
                    </div>

                    <Button
                        className="w-full sm:w-auto"
                        variant="secondary"
                        type="button"
                        onClick={addPeriod}
                    >
                        Add Period
                    </Button>
                </div>

                <div className="flex flex-col gap-8">
                    {config.periods.map((period, periodIndex) => (
                        <section
                            className="border-border/60 flex flex-col gap-7 rounded-xl border bg-card p-4 shadow-xs sm:p-5"
                            key={periodIndex}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-end gap-3">
                                    <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-3">
                                        <Label className="col-span-2 lg:col-span-1">
                                            Name
                                            <Input
                                                value={period.name}
                                                onChange={event =>
                                                    updatePeriod(periodIndex, {
                                                        name: event.target
                                                            .value,
                                                    })
                                                }
                                            />
                                        </Label>

                                        <Label>
                                            Starts
                                            <Input
                                                type="time"
                                                value={period.startsAt}
                                                onChange={event =>
                                                    updatePeriod(periodIndex, {
                                                        startsAt:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </Label>

                                        <Label>
                                            Ends
                                            <Input
                                                type="time"
                                                value={period.endsAt}
                                                onChange={event =>
                                                    updatePeriod(periodIndex, {
                                                        endsAt: event.target
                                                            .value,
                                                    })
                                                }
                                            />
                                        </Label>
                                    </div>

                                    <Button
                                        aria-label={`Remove ${period.name || "period"}`}
                                        className="text-muted-foreground hover:text-muted-foreground"
                                        size="icon"
                                        variant="outline"
                                        type="button"
                                        onClick={() =>
                                            removePeriod(periodIndex)
                                        }
                                    >
                                        <Trash2
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                {config.kids.map(kid => {
                                    const tasks = period.tasksByKidId[kid.id]

                                    return (
                                        <div
                                            className="flex flex-col"
                                            key={kid.id}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-xl font-semibold">
                                                    {kid.name || "Unnamed Kid"}
                                                </h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {tasks.length} tasks
                                                </span>
                                            </div>

                                            <div className="mt-4 flex flex-col gap-3">
                                                {tasks.map(
                                                    (task, taskIndex) => (
                                                        <div
                                                            className="flex items-center gap-3"
                                                            key={taskIndex}
                                                        >
                                                            <Input
                                                                aria-label={`${kid.name || "Kid"} ${period.name || "period"} task ${taskIndex + 1}`}
                                                                className="flex-1"
                                                                value={task}
                                                                onChange={event =>
                                                                    updateTask(
                                                                        periodIndex,
                                                                        kid.id,
                                                                        taskIndex,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />

                                                            <Button
                                                                aria-label={`Remove ${task || "task"}`}
                                                                className="text-muted-foreground hover:text-muted-foreground"
                                                                size="icon"
                                                                variant="outline"
                                                                type="button"
                                                                onClick={() =>
                                                                    removeTask(
                                                                        periodIndex,
                                                                        kid.id,
                                                                        taskIndex,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    aria-hidden="true"
                                                                    className="size-4"
                                                                />
                                                            </Button>
                                                        </div>
                                                    ),
                                                )}

                                                <Button
                                                    variant="secondary"
                                                    type="button"
                                                    onClick={() =>
                                                        addTask(
                                                            periodIndex,
                                                            kid.id,
                                                        )
                                                    }
                                                >
                                                    Add Task
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="bg-background fixed inset-x-0 bottom-0 p-4 sm:static sm:flex sm:justify-end sm:bg-transparent sm:p-0">
                    <Button className="w-full sm:w-auto" type="button" disabled>
                        Save Coming Soon
                    </Button>
                </div>
            </div>
        </>
    )
}

export default Route
