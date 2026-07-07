import type {RouteConfig} from "@react-router/dev/routes"
import {index, route} from "@react-router/dev/routes"

const routes: RouteConfig = [
    index("./routes/index.tsx"),
    route("kids-schedules", "./routes/kids-schedules.tsx"),
    route("api/kids-schedules", "./routes/api/kids-schedules.tsx"),
]

export default routes
