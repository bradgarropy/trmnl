const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number)
    const suffix = hour < 12 ? "AM" : "PM"
    const displayHour = hour % 12 || 12

    return `${displayHour}:${minute.toString().padStart(2, "0")}${suffix}`
}

export {formatTime}
