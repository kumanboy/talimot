(function () {
    try {
        var storageKey =
            "talimot-theme";

        var storedTheme =
            window.localStorage.getItem(
                storageKey
            );

        var systemPrefersDark =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        var theme =
            storedTheme === "dark" ||
            storedTheme === "light"
                ? storedTheme
                : systemPrefersDark
                  ? "dark"
                  : "light";

        document.documentElement.dataset.theme =
            theme;

        document.documentElement.style.colorScheme =
            theme;
    } catch (error) {
        document.documentElement.dataset.theme =
            "light";

        document.documentElement.style.colorScheme =
            "light";
    }
})();
