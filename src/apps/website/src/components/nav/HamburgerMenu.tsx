import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import type { AstroInstance } from "astro";

interface MenuInterface {
    links: AstroInstance[];
}

export default function HamburgerMenu({ links }: MenuInterface) {
    const navItems = links
        // optional: filter out special files
        .filter((p) => !p.file.endsWith("404.astro"))
        .map((p) => {
            const url =
                p.url ??
                p.file
                    .replace(/^.*\/pages/, "")
                    .replace(/index\.astro$/, "")
                    .replace(/\.astro$/, "");

            const segment = url.split("/").filter(Boolean)[0] ?? "";
            const label = segment ? segment.replace(/-/g, " ") : "Home";

            return { url: url || "/", label };
        });
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link">
                    <Menu />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader className="mt-4 text-left">
                    <DialogTitle>Menu</DialogTitle>
                    <DialogDescription>Verken onze website!</DialogDescription>
                </DialogHeader>
                {navItems.map((page) => (
                    <a href={page.url}>
                        <Button variant="link" className="pl-0">
                            {page.label.charAt(0).toUpperCase() +
                                page.label.slice(1)}
                        </Button>
                    </a>
                ))}
            </DialogContent>
        </Dialog>
    );
}
