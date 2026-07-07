import {NavLink} from "react-router"

const Navigation = () => {
    return (
        <nav className="flex gap-4 font-bold">
            <NavLink to="/" prefetch="intent">
                Home
            </NavLink>
        </nav>
    )
}

export default Navigation
