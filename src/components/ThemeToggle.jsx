import { useEffect, useState } from "react"

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        if (
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark")
            setIsDark(true)
        } else {
            document.documentElement.classList.remove("dark")
            setIsDark(false)
        }
    }, [])

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark")
            localStorage.theme = "light"
            setIsDark(false)
        } else {
            document.documentElement.classList.add("dark")
            localStorage.theme = "dark"
            setIsDark(true)
        }
    }

    return (
        <button
            onClick={toggleTheme}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-accent"
        >
            {isDark ? "Light Mode" : "Dark Mode"}
        </button>
    )
}
