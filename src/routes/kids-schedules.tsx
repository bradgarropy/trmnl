import {Trash2} from "lucide-react"
import {useEffect, useRef, useState} from "react"
import {
    type ActionFunctionArgs,
    data,
    type LoaderFunctionArgs,
    useActionData,
    useLoaderData,
    useNavigation,
    useSubmit,
} from "react-router"
import {toast} from "sonner"

import {Button} from "~/components/ui/button"
import {Input} from "~/components/ui/input"
import {Label} from "~/components/ui/label"
import {
    getKidsScheduleConfig,
    saveKidsScheduleConfig,
} from "~/kids-schedules.server"
import type {Child, Kid, KidsScheduleConfig, Range, RangeConfig} from "~/types"

const createId = (value: string, index: number) => {
    return `${value.toLowerCase().replaceAll(/\s+/g, "-")}-${index}`
}

const createKid = (name = "", index = Date.now()): Kid => {
    return {
        id: createId(name || "kid", index),
        name,
    }
}

const createRange = (kids: Kid[]): RangeConfig => {
    return {
        name: "",
        startsAt: "06:00",
        endsAt: "07:00",
        tasksByKidId: Object.fromEntries(kids.map(kid => [kid.id, [""]])),
    }
}

const getUniqueChildren = (ranges: Range[]) => {
    return ranges.reduce<Child[]>((children, range) => {
        for (const child of range.children) {
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

const createConfig = (ranges: Range[]): KidsScheduleConfig => {
    const kids = getUniqueChildren(ranges).map((child, index) =>
        createKid(child.name, index),
    )

    return {
        kids,
        ranges: ranges.map(range => ({
            name: range.name,
            startsAt: range.startsAt,
            endsAt: range.endsAt,
            tasksByKidId: Object.fromEntries(
                kids.map(kid => {
                    const child = range.children.find(
                        currentChild => currentChild.name === kid.name,
                    )

                    return [kid.id, child?.tasks ?? []]
                }),
            ),
        })),
    }
}

const emptyConfig: KidsScheduleConfig = {
    kids: [],
    ranges: [],
}

const serializeConfig = (config: KidsScheduleConfig) => {
    return JSON.stringify(config)
}

const loader = async ({context}: LoaderFunctionArgs) => {
    return await getKidsScheduleConfig(context.cloudflare.env.DB)
}

const action = async ({context, request}: ActionFunctionArgs) => {
    const formData = await request.formData()
    const config = formData.get("config")

    if (typeof config !== "string") {
        return data({success: false}, {status: 400})
    }

    await saveKidsScheduleConfig(
        context.cloudflare.env.DB,
        JSON.parse(config) as KidsScheduleConfig,
    )

    return data({success: true}, {status: 200})
}

const Route = () => {
    const loadedConfig = useLoaderData<typeof loader>()
    const actionData = useActionData<typeof action>()
    const navigation = useNavigation()
    const submit = useSubmit()
    const [config, setConfig] = useState(loadedConfig ?? emptyConfig)
    const [savedConfig, setSavedConfig] = useState(loadedConfig ?? emptyConfig)
    const submittedConfig = useRef<KidsScheduleConfig | null>(null)
    const isSaving = navigation.state !== "idle"
    const isDirty = serializeConfig(config) !== serializeConfig(savedConfig)

    useEffect(() => {
        if (!actionData) {
            return
        }

        if (actionData.success) {
            if (submittedConfig.current) {
                setSavedConfig(submittedConfig.current)
            }

            submittedConfig.current = null
            toast.success("Saved")
            return
        }

        toast.error("Save failed")
    }, [actionData])

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
                ranges: currentConfig.ranges.map(range => ({
                    ...range,
                    tasksByKidId: {...range.tasksByKidId, [kid.id]: [""]},
                })),
            }
        })
    }

    const removeKid = (kidId: string) => {
        setConfig(currentConfig => ({
            kids: currentConfig.kids.filter(kid => kid.id !== kidId),
            ranges: currentConfig.ranges.map(range => {
                const {[kidId]: removedTasks, ...tasksByKidId} =
                    range.tasksByKidId
                void removedTasks

                return {...range, tasksByKidId}
            }),
        }))
    }

    const updateRange = (
        rangeIndex: number,
        updates: Partial<Omit<RangeConfig, "tasksByKidId">>,
    ) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            ranges: currentConfig.ranges.map((range, index) =>
                index === rangeIndex ? {...range, ...updates} : range,
            ),
        }))
    }

    const addRange = () => {
        setConfig(currentConfig => ({
            ...currentConfig,
            ranges: [...currentConfig.ranges, createRange(currentConfig.kids)],
        }))
    }

    const removeRange = (rangeIndex: number) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            ranges: currentConfig.ranges.filter(
                (_, index) => index !== rangeIndex,
            ),
        }))
    }

    const updateTask = (
        rangeIndex: number,
        kidId: string,
        taskIndex: number,
        task: string,
    ) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            ranges: currentConfig.ranges.map((range, index) => {
                if (index !== rangeIndex) {
                    return range
                }

                return {
                    ...range,
                    tasksByKidId: {
                        ...range.tasksByKidId,
                        [kidId]: range.tasksByKidId[kidId].map(
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

    const addTask = (rangeIndex: number, kidId: string) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            ranges: currentConfig.ranges.map((range, index) =>
                index === rangeIndex
                    ? {
                          ...range,
                          tasksByKidId: {
                              ...range.tasksByKidId,
                              [kidId]: [...range.tasksByKidId[kidId], ""],
                          },
                      }
                    : range,
            ),
        }))
    }

    const removeTask = (
        rangeIndex: number,
        kidId: string,
        taskIndex: number,
    ) => {
        setConfig(currentConfig => ({
            ...currentConfig,
            ranges: currentConfig.ranges.map((range, index) =>
                index === rangeIndex
                    ? {
                          ...range,
                          tasksByKidId: {
                              ...range.tasksByKidId,
                              [kidId]: range.tasksByKidId[kidId].filter(
                                  (_, currentTaskIndex) =>
                                      currentTaskIndex !== taskIndex,
                              ),
                          },
                      }
                    : range,
            ),
        }))
    }

    const saveConfig = () => {
        if (!isDirty) {
            return
        }

        submittedConfig.current = config
        submit({config: serializeConfig(config)}, {method: "post"})
    }

    return (
        <>
            <title>trmnl | kids schedules</title>

            <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-24 sm:gap-8 sm:pb-0">
                <div>
                    <h2 className="text-2xl font-bold">Kids Schedules</h2>
                    <p className="mt-2 text-muted-foreground">
                        Configure kids once, then customize their tasks for each
                        display range.
                    </p>
                </div>

                <section className="mb-2 sm:mb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Kids</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Kid names are shared across every range.
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
                        <h3 className="text-xl font-semibold">Ranges</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set the display windows, then customize tasks for
                            each kid.
                        </p>
                    </div>

                    <Button
                        className="w-full sm:w-auto"
                        variant="secondary"
                        type="button"
                        onClick={addRange}
                    >
                        Add Range
                    </Button>
                </div>

                <div className="flex flex-col gap-8">
                    {config.ranges.map((range, rangeIndex) => (
                        <section
                            className="border-border/60 flex flex-col gap-7 rounded-xl border bg-card p-4 shadow-xs sm:p-5"
                            key={rangeIndex}
                        >
                            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                                <div className="flex items-end gap-3 sm:contents">
                                    <Label className="flex-1">
                                        Name
                                        <Input
                                            value={range.name}
                                            onChange={event =>
                                                updateRange(rangeIndex, {
                                                    name: event.target.value,
                                                })
                                            }
                                        />
                                    </Label>

                                    <Button
                                        aria-label={`Remove ${range.name || "range"}`}
                                        className="text-muted-foreground hover:text-muted-foreground sm:order-4"
                                        size="icon"
                                        variant="outline"
                                        type="button"
                                        onClick={() => removeRange(rangeIndex)}
                                    >
                                        <Trash2
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 sm:contents">
                                    <Label className="min-w-0 sm:order-2">
                                        Starts
                                        <Input
                                            className="min-w-0 appearance-none px-2 sm:px-3"
                                            type="time"
                                            value={range.startsAt}
                                            onChange={event =>
                                                updateRange(rangeIndex, {
                                                    startsAt:
                                                        event.target.value,
                                                })
                                            }
                                        />
                                    </Label>

                                    <Label className="min-w-0 sm:order-3">
                                        Ends
                                        <Input
                                            className="min-w-0 appearance-none px-2 sm:px-3"
                                            type="time"
                                            value={range.endsAt}
                                            onChange={event =>
                                                updateRange(rangeIndex, {
                                                    endsAt: event.target.value,
                                                })
                                            }
                                        />
                                    </Label>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                {config.kids.map(kid => {
                                    const tasks = range.tasksByKidId[kid.id]

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
                                                                aria-label={`${kid.name || "Kid"} ${range.name || "range"} task ${taskIndex + 1}`}
                                                                className="flex-1"
                                                                value={task}
                                                                onChange={event =>
                                                                    updateTask(
                                                                        rangeIndex,
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
                                                                        rangeIndex,
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
                                                            rangeIndex,
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

                <div className="bg-background fixed inset-x-0 bottom-0 flex items-center justify-end p-4 sm:static sm:bg-transparent sm:p-0">
                    <Button
                        className="w-full sm:w-auto"
                        type="button"
                        disabled={isSaving || !isDirty}
                        onClick={saveConfig}
                    >
                        {isSaving ? "Saving" : "Save"}
                    </Button>
                </div>
            </div>
        </>
    )
}

export {action, createConfig, loader}
export default Route
