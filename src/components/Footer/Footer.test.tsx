import {render} from "@testing-library/react"
import {expect, test} from "vitest"

import Footer from "~/components/Footer"

test("renders", () => {
    const {container} = render(<Footer />)
    expect(container).toBeEmptyDOMElement()
})
