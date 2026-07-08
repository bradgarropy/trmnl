import {TRMNL_LOGO_URL} from "~/constants"

const Header = () => {
    return (
        <header className="flex items-center justify-between px-4 py-6 sm:px-8 sm:py-12">
            <a
                aria-label="TRMNL"
                href="https://trmnl.com"
                rel="noreferrer"
                target="_blank"
            >
                <img alt="" className="size-8" src={TRMNL_LOGO_URL} />
            </a>

            <a
                aria-label="Brad Garropy"
                className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="https://bradgarropy.com"
                rel="noreferrer"
                target="_blank"
            >
                <span aria-hidden="true" className="pb-0.5">
                    built by
                </span>

                <span className="inline-flex size-4 items-center justify-center">
                    <span
                        aria-hidden="true"
                        className="block size-4 bg-current"
                        style={{
                            mask: "url('/bg.svg') center / contain no-repeat",
                            WebkitMask:
                                "url('/bg.svg') center / contain no-repeat",
                        }}
                    />
                </span>
            </a>
        </header>
    )
}

export default Header
