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

interface NavLink {
    url: string;
    label: string;
}

interface LanguageLink {
    label: string;
    href: string;
    active: boolean;
}

interface MenuProps {
    links: NavLink[];
    menuTitle: string;
    menuDescription: string;
    languageLabel?: string;
    languageLinks?: LanguageLink[];
}

export default function HamburgerMenu({
    links,
    menuTitle,
    menuDescription,
    languageLabel = "Language",
    languageLinks = [],
}: MenuProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link">
                    <Menu />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader className="mt-4 text-left">
                    <DialogTitle>{menuTitle}</DialogTitle>
                    <DialogDescription>{menuDescription}</DialogDescription>
                </DialogHeader>
                {links.map((page) => (
                    <a href={page.url} key={page.url}>
                        <Button variant="link" className="pl-0">
                            {page.label}
                        </Button>
                    </a>
                ))}
                {languageLinks.length > 0 && (
                    <div className="mt-4 border-t border-zinc-800 pt-4">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                            {languageLabel}
                        </p>
                        <div className="flex gap-2">
                            {languageLinks.map((lang) => (
                                <a
                                    href={lang.href}
                                    key={lang.href}
                                    aria-current={lang.active ? "true" : undefined}
                                    className={
                                        lang.active
                                            ? "rounded-lg bg-purple-500/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white"
                                            : "rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                                    }
                                >
                                    {lang.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
