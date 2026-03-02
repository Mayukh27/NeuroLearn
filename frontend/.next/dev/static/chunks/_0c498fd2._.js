(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlayCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-play.js [app-client] (ecmascript) <export default as PlayCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-check.js [app-client] (ecmascript) <export default as ClipboardCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const menuItems = [
    {
        label: "Dashboard",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        href: "/dashboard"
    },
    {
        label: "Video Learning",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlayCircle$3e$__["PlayCircle"],
        href: "/video"
    },
    {
        label: "Assessment",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__["ClipboardCheck"],
        href: "/assessment"
    },
    {
        label: "Results",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        href: "/results"
    },
    {
        label: "Leaderboard",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
        href: "/leaderboard"
    },
    {
        label: "Profile",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
        href: "/profile"
    }
];
function Sidebar({ xp = 0, xpToNextLevel = 1, level = 1, streak = 0 }) {
    _s();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const xpPercent = Math.round(xp / xpToNextLevel * 100);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].aside, {
                initial: false,
                animate: {
                    width: collapsed ? 72 : 260
                },
                transition: {
                    duration: 0.3,
                    ease: [
                        0.4,
                        0,
                        0.2,
                        1
                    ]
                },
                className: "fixed left-0 top-0 z-50 h-screen flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 px-4 h-16 border-b border-[var(--border-subtle)] shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                whileHover: {
                                    rotate: 5,
                                    scale: 1.05
                                },
                                className: "w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-black text-white",
                                    children: "NL"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 57,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Sidebar.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                children: !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                    initial: {
                                        opacity: 0,
                                        x: -10
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        x: -10
                                    },
                                    className: "text-lg font-bold text-[var(--text-primary)] whitespace-nowrap",
                                    children: "NeuroLearn"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 61,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Sidebar.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Sidebar.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex-1 py-4 px-2 space-y-1 overflow-y-auto",
                        children: menuItems.map((item)=>{
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                            const Icon = item.icon;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    whileHover: {
                                        x: 2
                                    },
                                    whileTap: {
                                        scale: 0.98
                                    },
                                    className: `
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group
                    ${isActive ? "bg-gradient-to-r from-violet-500/15 to-purple-500/10 text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"}
                  `,
                                    children: [
                                        isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            layoutId: "sidebar-active",
                                            className: "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-blue-500 to-violet-500",
                                            transition: {
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 93,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            size: 20,
                                            className: `shrink-0 transition-colors ${isActive ? "text-violet-400" : "group-hover:text-violet-400/70"}`
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 100,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                            children: !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                                initial: {
                                                    opacity: 0,
                                                    x: -10
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    x: 0
                                                },
                                                exit: {
                                                    opacity: 0,
                                                    x: -10
                                                },
                                                className: `text-sm font-medium whitespace-nowrap ${isActive ? "font-semibold" : ""}`,
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "[project]/components/Sidebar.tsx",
                                                lineNumber: 107,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 105,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 80,
                                    columnNumber: 17
                                }, this)
                            }, item.href, false, {
                                fileName: "[project]/components/Sidebar.tsx",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/Sidebar.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                height: 0
                            },
                            animate: {
                                opacity: 1,
                                height: "auto"
                            },
                            exit: {
                                opacity: 0,
                                height: 0
                            },
                            className: "px-3 pb-3 space-y-3 shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                            size: 14,
                                                            className: "text-amber-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/Sidebar.tsx",
                                                            lineNumber: 136,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-semibold text-[var(--text-secondary)]",
                                                            children: [
                                                                "Level ",
                                                                level
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/Sidebar.tsx",
                                                            lineNumber: 137,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 135,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-mono text-violet-400",
                                                    children: [
                                                        xp,
                                                        "/",
                                                        xpToNextLevel
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 134,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    width: 0
                                                },
                                                animate: {
                                                    width: `${xpPercent}%`
                                                },
                                                transition: {
                                                    duration: 1,
                                                    ease: "easeOut"
                                                },
                                                className: "h-full rounded-full progress-animated"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Sidebar.tsx",
                                                lineNumber: 142,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 141,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 133,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                            size: 16,
                                            className: "text-orange-400"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 153,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold text-[var(--text-secondary)]",
                                            children: [
                                                streak,
                                                " day streak"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 154,
                                            columnNumber: 17
                                        }, this),
                                        streak >= 7 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                            animate: {
                                                scale: [
                                                    1,
                                                    1.2,
                                                    1
                                                ]
                                            },
                                            transition: {
                                                duration: 1.5,
                                                repeat: Infinity
                                            },
                                            className: "text-xs",
                                            children: "🔥"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 156,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 152,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 126,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Sidebar.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-2 pb-3 space-y-1 border-t border-[var(--border-subtle)] pt-3 shrink-0",
                        children: [
                            {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
                                label: "Settings"
                            },
                            {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
                                label: "Help"
                            }
                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                whileHover: {
                                    x: 2
                                },
                                className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all duration-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                        size: 18,
                                        className: "shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 180,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                        children: !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                            initial: {
                                                opacity: 0
                                            },
                                            animate: {
                                                opacity: 1
                                            },
                                            exit: {
                                                opacity: 0
                                            },
                                            className: "text-sm font-medium",
                                            children: item.label
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 183,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 181,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, item.label, true, {
                                fileName: "[project]/components/Sidebar.tsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/Sidebar.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                        whileHover: {
                            scale: 1.1
                        },
                        whileTap: {
                            scale: 0.95
                        },
                        onClick: ()=>setCollapsed(!collapsed),
                        className: "absolute top-4 -right-3 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-violet-500/50 transition-colors z-50 shadow-md",
                        children: collapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                            size: 12
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 204,
                            columnNumber: 24
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                            size: 12
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 204,
                            columnNumber: 53
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Sidebar.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: false,
                animate: {
                    width: collapsed ? 72 : 260
                },
                transition: {
                    duration: 0.3,
                    ease: [
                        0.4,
                        0,
                        0.2,
                        1
                    ]
                },
                className: "shrink-0 hidden md:block"
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Sidebar, "2UzrYSI/l/Ej1TQFld9gDEDnK74=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/dummyDb.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================
// DUMMY DATABASE — All data in JSON format for FastAPI integration
// Replace each section with actual API calls to your FastAPI backend
// Each function simulates: GET /api/<endpoint> → JSON response
// ============================================================
// ---- TYPES (matching FastAPI Pydantic models) ----
__turbopack_context__.s([
    "DUMMY_COURSES",
    ()=>DUMMY_COURSES,
    "DUMMY_DAILY_CHALLENGES",
    ()=>DUMMY_DAILY_CHALLENGES,
    "DUMMY_LEADERBOARD",
    ()=>DUMMY_LEADERBOARD,
    "DUMMY_NOTIFICATIONS",
    ()=>DUMMY_NOTIFICATIONS,
    "DUMMY_STUDENT",
    ()=>DUMMY_STUDENT,
    "DUMMY_TRANSCRIPT_SEGMENTS",
    ()=>DUMMY_TRANSCRIPT_SEGMENTS,
    "QUESTION_BANK",
    ()=>QUESTION_BANK,
    "generateAttentionSnapshot",
    ()=>generateAttentionSnapshot
]);
const DUMMY_STUDENT = {
    id: "student_001",
    name: "Alex Johnson",
    email: "alex@neurolearn.io",
    avatar: "/placeholder-user.jpg",
    level: 12,
    xp: 4250,
    xpToNextLevel: 5000,
    streak: 7,
    bestStreak: 14,
    totalCoursesCompleted: 4,
    totalWatchTime: 1260,
    joinedDate: "2024-09-15",
    rank: 23,
    badges: [
        {
            id: "b1",
            name: "First Steps",
            description: "Complete your first lesson",
            icon: "👣",
            earned: true,
            earnedDate: "2024-09-16",
            rarity: "common"
        },
        {
            id: "b2",
            name: "Week Warrior",
            description: "Maintain a 7-day streak",
            icon: "⚔️",
            earned: true,
            earnedDate: "2024-09-23",
            rarity: "rare"
        },
        {
            id: "b3",
            name: "Perfect Score",
            description: "Score 100% on an assessment",
            icon: "💯",
            earned: false,
            rarity: "epic"
        },
        {
            id: "b4",
            name: "Speed Learner",
            description: "Complete 5 lessons in one day",
            icon: "🚀",
            earned: false,
            rarity: "epic"
        },
        {
            id: "b5",
            name: "Century Club",
            description: "Earn 1000 XP",
            icon: "💎",
            earned: true,
            earnedDate: "2024-10-01",
            rarity: "legendary"
        },
        {
            id: "b6",
            name: "Night Owl",
            description: "Study past midnight",
            icon: "🦉",
            earned: true,
            earnedDate: "2024-10-05",
            rarity: "common"
        },
        {
            id: "b7",
            name: "Quiz Master",
            description: "Complete 50 quizzes",
            icon: "🧠",
            earned: false,
            rarity: "legendary"
        },
        {
            id: "b8",
            name: "Social Butterfly",
            description: "Join a study group",
            icon: "🦋",
            earned: false,
            rarity: "rare"
        }
    ]
};
const DUMMY_COURSES = [
    {
        id: "course_001",
        title: "Introduction to React",
        description: "Master the fundamentals of React including components, props, state, and hooks",
        icon: "⚛️",
        category: "Frontend",
        difficulty: "Beginner",
        totalVideos: 8,
        completedVideos: 5,
        progress: 65,
        estimatedHours: 6,
        tags: [
            "React",
            "JavaScript",
            "Frontend"
        ],
        videoLinks: [
            {
                id: "v1",
                title: "What is React? — Introduction & Setup",
                url: "https://www.youtube.com/watch?v=SqcY0GlETPk",
                duration: 720,
                thumbnail: "",
                order: 1,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v2",
                title: "JSX & Components Deep Dive",
                url: "https://www.youtube.com/watch?v=9YkUCRr3bVc",
                duration: 890,
                thumbnail: "",
                order: 2,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v3",
                title: "Props & Data Flow",
                url: "https://www.youtube.com/watch?v=PHaECbrKgs0",
                duration: 650,
                thumbnail: "",
                order: 3,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v4",
                title: "State & useState Hook",
                url: "https://www.youtube.com/watch?v=O6P86uwfdR0",
                duration: 780,
                thumbnail: "",
                order: 4,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v5",
                title: "useEffect & Side Effects",
                url: "https://www.youtube.com/watch?v=0ZJgIjIuY7U",
                duration: 920,
                thumbnail: "",
                order: 5,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v6",
                title: "Event Handling & Forms",
                url: "https://www.youtube.com/watch?v=dH6i3GurZW8",
                duration: 640,
                thumbnail: "",
                order: 6,
                completed: false,
                watchedPercent: 35
            },
            {
                id: "v7",
                title: "Conditional Rendering",
                url: "https://www.youtube.com/watch?v=4oCVDkb_peY",
                duration: 540,
                thumbnail: "",
                order: 7,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v8",
                title: "Lists & Keys",
                url: "https://www.youtube.com/watch?v=0sasRxl35_8",
                duration: 480,
                thumbnail: "",
                order: 8,
                completed: false,
                watchedPercent: 0
            }
        ]
    },
    {
        id: "course_002",
        title: "Advanced State Management",
        description: "Redux, Context API, Zustand and modern state patterns for scalable apps",
        icon: "🔄",
        category: "Frontend",
        difficulty: "Intermediate",
        totalVideos: 6,
        completedVideos: 2,
        progress: 42,
        estimatedHours: 8,
        tags: [
            "Redux",
            "Context API",
            "Zustand"
        ],
        videoLinks: [
            {
                id: "v9",
                title: "Why State Management Matters",
                url: "https://www.youtube.com/watch?v=CVpUuw9XSjY",
                duration: 600,
                thumbnail: "",
                order: 1,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v10",
                title: "Context API Fundamentals",
                url: "https://www.youtube.com/watch?v=5LrDIWkK_Bc",
                duration: 750,
                thumbnail: "",
                order: 2,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v11",
                title: "Redux Toolkit Setup",
                url: "https://www.youtube.com/watch?v=9zySeP5vH9c",
                duration: 880,
                thumbnail: "",
                order: 3,
                completed: false,
                watchedPercent: 20
            },
            {
                id: "v12",
                title: "Redux Thunk & Async",
                url: "https://www.youtube.com/watch?v=93p3LxR9xfM",
                duration: 920,
                thumbnail: "",
                order: 4,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v13",
                title: "Zustand — Lightweight Alternative",
                url: "https://www.youtube.com/watch?v=_ngCLZ5Iz-0",
                duration: 680,
                thumbnail: "",
                order: 5,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v14",
                title: "State Architecture Patterns",
                url: "https://www.youtube.com/watch?v=HKU24nY8Hsc",
                duration: 700,
                thumbnail: "",
                order: 6,
                completed: false,
                watchedPercent: 0
            }
        ]
    },
    {
        id: "course_003",
        title: "Performance Optimization",
        description: "React.memo, useMemo, code splitting, lazy loading, and profiling techniques",
        icon: "⚡",
        category: "Frontend",
        difficulty: "Advanced",
        totalVideos: 5,
        completedVideos: 1,
        progress: 28,
        estimatedHours: 5,
        tags: [
            "Performance",
            "Optimization",
            "React"
        ],
        videoLinks: [
            {
                id: "v15",
                title: "React Performance Basics",
                url: "https://www.youtube.com/watch?v=b1IQI4aJHLM",
                duration: 800,
                thumbnail: "",
                order: 1,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v16",
                title: "React.memo & useMemo",
                url: "https://www.youtube.com/watch?v=THL1OPn72vo",
                duration: 700,
                thumbnail: "",
                order: 2,
                completed: false,
                watchedPercent: 40
            },
            {
                id: "v17",
                title: "Code Splitting & Lazy Loading",
                url: "https://www.youtube.com/watch?v=JU6sl_yyZqs",
                duration: 650,
                thumbnail: "",
                order: 3,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v18",
                title: "Profiler & DevTools",
                url: "https://www.youtube.com/watch?v=LfEkP0bpFLc",
                duration: 600,
                thumbnail: "",
                order: 4,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v19",
                title: "Real-world Optimization Case Study",
                url: "https://www.youtube.com/watch?v=i8xbddI2Mg8",
                duration: 900,
                thumbnail: "",
                order: 5,
                completed: false,
                watchedPercent: 0
            }
        ]
    },
    {
        id: "course_004",
        title: "TypeScript Fundamentals",
        description: "Strong typing, interfaces, generics, and TypeScript best practices",
        icon: "📘",
        category: "Languages",
        difficulty: "Beginner",
        totalVideos: 7,
        completedVideos: 6,
        progress: 85,
        estimatedHours: 5,
        tags: [
            "TypeScript",
            "JavaScript",
            "Types"
        ],
        videoLinks: [
            {
                id: "v20",
                title: "Why TypeScript?",
                url: "https://www.youtube.com/watch?v=zQnBQ4tB3ZA",
                duration: 500,
                thumbnail: "",
                order: 1,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v21",
                title: "Basic Types & Inference",
                url: "https://www.youtube.com/watch?v=d56mG7DezGs",
                duration: 620,
                thumbnail: "",
                order: 2,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v22",
                title: "Interfaces & Type Aliases",
                url: "https://www.youtube.com/watch?v=crjIq7LEAYw",
                duration: 580,
                thumbnail: "",
                order: 3,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v23",
                title: "Functions & Generics",
                url: "https://www.youtube.com/watch?v=nViEqpgwxHE",
                duration: 700,
                thumbnail: "",
                order: 4,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v24",
                title: "Enums, Tuples & Utility Types",
                url: "https://www.youtube.com/watch?v=BwuLxPH8IDs",
                duration: 650,
                thumbnail: "",
                order: 5,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v25",
                title: "TypeScript with React",
                url: "https://www.youtube.com/watch?v=TPACABQTHvM",
                duration: 780,
                thumbnail: "",
                order: 6,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v26",
                title: "Advanced Patterns",
                url: "https://www.youtube.com/watch?v=F2Z8bk5XQBI",
                duration: 850,
                thumbnail: "",
                order: 7,
                completed: false,
                watchedPercent: 15
            }
        ]
    },
    {
        id: "course_005",
        title: "API Integration & REST",
        description: "Fetch, Axios, error handling, caching, and real-world API patterns",
        icon: "🔗",
        category: "Backend",
        difficulty: "Intermediate",
        totalVideos: 6,
        completedVideos: 3,
        progress: 55,
        estimatedHours: 6,
        tags: [
            "API",
            "REST",
            "HTTP"
        ],
        videoLinks: [
            {
                id: "v27",
                title: "HTTP Fundamentals",
                url: "https://www.youtube.com/watch?v=-MTSQjw5DrM",
                duration: 620,
                thumbnail: "",
                order: 1,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v28",
                title: "Fetch API & Promises",
                url: "https://www.youtube.com/watch?v=cuEtnrL9-H0",
                duration: 700,
                thumbnail: "",
                order: 2,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v29",
                title: "Axios & Interceptors",
                url: "https://www.youtube.com/watch?v=6LyagkoRWYA",
                duration: 680,
                thumbnail: "",
                order: 3,
                completed: true,
                watchedPercent: 100
            },
            {
                id: "v30",
                title: "Error Handling Patterns",
                url: "https://www.youtube.com/watch?v=DFN5Zl9S6eq",
                duration: 550,
                thumbnail: "",
                order: 4,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v31",
                title: "Caching & SWR/React Query",
                url: "https://www.youtube.com/watch?v=aLQGQovz3ww",
                duration: 800,
                thumbnail: "",
                order: 5,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v32",
                title: "Authentication & JWT",
                url: "https://www.youtube.com/watch?v=mbsmsi7l3r4",
                duration: 900,
                thumbnail: "",
                order: 6,
                completed: false,
                watchedPercent: 0
            }
        ]
    },
    {
        id: "course_006",
        title: "Web Security Essentials",
        description: "XSS, CSRF, CORS, CSP, and secure coding for modern web apps",
        icon: "🔐",
        category: "Security",
        difficulty: "Advanced",
        totalVideos: 5,
        completedVideos: 0,
        progress: 0,
        estimatedHours: 4,
        tags: [
            "Security",
            "XSS",
            "CORS"
        ],
        videoLinks: [
            {
                id: "v33",
                title: "Web Security Overview",
                url: "https://www.youtube.com/watch?v=WlmKwIe9z1Q",
                duration: 750,
                thumbnail: "",
                order: 1,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v34",
                title: "Cross-Site Scripting (XSS)",
                url: "https://www.youtube.com/watch?v=EoaDgUgS6QA",
                duration: 680,
                thumbnail: "",
                order: 2,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v35",
                title: "CSRF & CORS Deep Dive",
                url: "https://www.youtube.com/watch?v=eWEgUcHPle0",
                duration: 700,
                thumbnail: "",
                order: 3,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v36",
                title: "Content Security Policy",
                url: "https://www.youtube.com/watch?v=txHc4zk6w3s",
                duration: 600,
                thumbnail: "",
                order: 4,
                completed: false,
                watchedPercent: 0
            },
            {
                id: "v37",
                title: "Secure Coding Practices",
                url: "https://www.youtube.com/watch?v=4YOpILi9Oxs",
                duration: 850,
                thumbnail: "",
                order: 5,
                completed: false,
                watchedPercent: 0
            }
        ]
    }
];
const DUMMY_LEADERBOARD = [
    {
        rank: 1,
        studentId: "s10",
        name: "Priya Sharma",
        avatar: "",
        xp: 12500,
        level: 24,
        streak: 32,
        coursesCompleted: 12
    },
    {
        rank: 2,
        studentId: "s11",
        name: "Marcus Chen",
        avatar: "",
        xp: 11200,
        level: 22,
        streak: 28,
        coursesCompleted: 10
    },
    {
        rank: 3,
        studentId: "s12",
        name: "Sofia Reyes",
        avatar: "",
        xp: 10800,
        level: 21,
        streak: 15,
        coursesCompleted: 11
    },
    {
        rank: 4,
        studentId: "s13",
        name: "Aiden Okafor",
        avatar: "",
        xp: 9500,
        level: 19,
        streak: 20,
        coursesCompleted: 9
    },
    {
        rank: 5,
        studentId: "s14",
        name: "Emma Williams",
        avatar: "",
        xp: 8900,
        level: 18,
        streak: 12,
        coursesCompleted: 8
    },
    {
        rank: 6,
        studentId: "s15",
        name: "Kai Tanaka",
        avatar: "",
        xp: 8200,
        level: 17,
        streak: 10,
        coursesCompleted: 7
    },
    {
        rank: 7,
        studentId: "s16",
        name: "Luna Petrov",
        avatar: "",
        xp: 7600,
        level: 16,
        streak: 9,
        coursesCompleted: 7
    },
    {
        rank: 8,
        studentId: "s17",
        name: "Ravi Patel",
        avatar: "",
        xp: 6900,
        level: 15,
        streak: 14,
        coursesCompleted: 6
    },
    {
        rank: 9,
        studentId: "s18",
        name: "Chloe Dubois",
        avatar: "",
        xp: 5800,
        level: 14,
        streak: 6,
        coursesCompleted: 5
    },
    {
        rank: 10,
        studentId: "s19",
        name: "Hassan Ali",
        avatar: "",
        xp: 5200,
        level: 13,
        streak: 11,
        coursesCompleted: 5
    },
    // Current student
    {
        rank: 23,
        studentId: "student_001",
        name: "Alex Johnson",
        avatar: "",
        xp: 4250,
        level: 12,
        streak: 7,
        coursesCompleted: 4
    }
];
const DUMMY_DAILY_CHALLENGES = [
    {
        id: "dc1",
        title: "Watch 30 minutes",
        description: "Watch any video for 30 minutes",
        xpReward: 50,
        type: "watch",
        completed: true,
        progress: 30,
        target: 30
    },
    {
        id: "dc2",
        title: "Perfect Quiz",
        description: "Score 100% on any quiz",
        xpReward: 100,
        type: "quiz",
        completed: false,
        progress: 0,
        target: 1
    },
    {
        id: "dc3",
        title: "Streak Keeper",
        description: "Log in and study today",
        xpReward: 25,
        type: "streak",
        completed: true,
        progress: 1,
        target: 1
    },
    {
        id: "dc4",
        title: "Review Master",
        description: "Review 3 completed lessons",
        xpReward: 75,
        type: "review",
        completed: false,
        progress: 1,
        target: 3
    }
];
const DUMMY_NOTIFICATIONS = [
    {
        id: "n1",
        type: "achievement",
        title: "Badge Earned!",
        message: "You earned the Night Owl badge",
        timestamp: "2 hours ago",
        read: false,
        icon: "🦉"
    },
    {
        id: "n2",
        type: "milestone",
        title: "Level Up!",
        message: "You reached Level 12",
        timestamp: "1 day ago",
        read: false,
        icon: "⬆️"
    },
    {
        id: "n3",
        type: "challenge",
        title: "Daily Challenge",
        message: "New challenges available!",
        timestamp: "3 hours ago",
        read: true,
        icon: "🎯"
    },
    {
        id: "n4",
        type: "reminder",
        title: "Keep Your Streak!",
        message: "Don't forget to study today",
        timestamp: "5 hours ago",
        read: true,
        icon: "🔥"
    }
];
const QUESTION_BANK = {
    easy: [
        {
            id: "q_e1",
            type: "mcq",
            question: "What is React?",
            options: [
                "A database",
                "A JavaScript library for building UIs",
                "A CSS framework",
                "A backend language"
            ],
            correctAnswer: 1,
            difficulty: "easy",
            points: 10,
            explanation: "React is a JavaScript library developed by Facebook for building user interfaces.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-base",
                generatedFrom: "video_transcript",
                difficultyScore: 0.2,
                bloomsLevel: "remember"
            }
        },
        {
            id: "q_e2",
            type: "mcq",
            question: "What does JSX stand for?",
            options: [
                "JavaScript XML",
                "Java Syntax Extension",
                "JSON Extra",
                "JavaScript XHR"
            ],
            correctAnswer: 0,
            difficulty: "easy",
            points: 10,
            explanation: "JSX stands for JavaScript XML, a syntax extension for JavaScript.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-base",
                generatedFrom: "video_transcript",
                difficultyScore: 0.15,
                bloomsLevel: "remember"
            }
        },
        {
            id: "q_e3",
            type: "true-false",
            question: "React components must always return JSX.",
            options: [
                "True",
                "False"
            ],
            correctAnswer: 1,
            difficulty: "easy",
            points: 10,
            explanation: "Components can return null, which means they render nothing.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-base",
                generatedFrom: "video_transcript",
                difficultyScore: 0.25,
                bloomsLevel: "understand"
            }
        },
        {
            id: "q_e4",
            type: "mcq",
            question: "Which hook is used to manage state in a functional component?",
            options: [
                "useEffect",
                "useState",
                "useRef",
                "useMemo"
            ],
            correctAnswer: 1,
            difficulty: "easy",
            points: 10,
            explanation: "useState is the primary hook for managing local state in functional components.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-base",
                generatedFrom: "video_transcript",
                difficultyScore: 0.2,
                bloomsLevel: "remember"
            }
        },
        {
            id: "q_e5",
            type: "mcq",
            question: "What is the virtual DOM?",
            options: [
                "A direct copy of the real DOM",
                "A lightweight in-memory representation of the real DOM",
                "A CSS rendering engine",
                "A browser API"
            ],
            correctAnswer: 1,
            difficulty: "easy",
            points: 10,
            explanation: "The virtual DOM is a lightweight JavaScript representation that React uses for efficient updates.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-base",
                generatedFrom: "video_transcript",
                difficultyScore: 0.3,
                bloomsLevel: "understand"
            }
        }
    ],
    medium: [
        {
            id: "q_m1",
            type: "mcq",
            question: "What is the purpose of the useEffect cleanup function?",
            options: [
                "To reset state",
                "To prevent memory leaks by cleaning up subscriptions",
                "To optimize rendering",
                "To handle errors"
            ],
            correctAnswer: 1,
            difficulty: "medium",
            points: 20,
            explanation: "The cleanup function in useEffect prevents memory leaks by removing event listeners, subscriptions, etc.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-large",
                generatedFrom: "video_transcript+context",
                difficultyScore: 0.55,
                bloomsLevel: "apply"
            }
        },
        {
            id: "q_m2",
            type: "mcq",
            question: "When does React re-render a component?",
            options: [
                "When props or state change",
                "Every second",
                "Only on page refresh",
                "When CSS changes"
            ],
            correctAnswer: 0,
            difficulty: "medium",
            points: 20,
            explanation: "React re-renders when state or props change, triggering the reconciliation process.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-large",
                generatedFrom: "video_transcript+context",
                difficultyScore: 0.5,
                bloomsLevel: "understand"
            }
        },
        {
            id: "q_m3",
            type: "mcq",
            question: "What is prop drilling and how can it be solved?",
            options: [
                "Passing props through many levels — solved with Context API",
                "A CSS technique",
                "A testing pattern",
                "A build optimization"
            ],
            correctAnswer: 0,
            difficulty: "medium",
            points: 20,
            explanation: "Prop drilling is passing data through many component layers. Context API or state management libraries solve this.",
            topicId: "course_002",
            llmMetadata: {
                model: "flan-t5-large",
                generatedFrom: "video_transcript+context",
                difficultyScore: 0.6,
                bloomsLevel: "analyze"
            }
        },
        {
            id: "q_m4",
            type: "mcq",
            question: "What is the difference between controlled and uncontrolled components?",
            options: [
                "Controlled use state for form data, uncontrolled use refs",
                "They are the same",
                "Controlled are class components only",
                "Uncontrolled are faster"
            ],
            correctAnswer: 0,
            difficulty: "medium",
            points: 20,
            explanation: "Controlled components derive form values from state; uncontrolled components use DOM refs directly.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-large",
                generatedFrom: "video_transcript+context",
                difficultyScore: 0.55,
                bloomsLevel: "analyze"
            }
        },
        {
            id: "q_m5",
            type: "mcq",
            question: "What does the key prop do in a list?",
            options: [
                "Styles the element",
                "Helps React identify which items changed, added, or removed",
                "Sets the list order",
                "Adds accessibility"
            ],
            correctAnswer: 1,
            difficulty: "medium",
            points: 20,
            explanation: "Keys help React's reconciliation algorithm efficiently update the DOM by tracking list item identity.",
            topicId: "course_001",
            llmMetadata: {
                model: "flan-t5-large",
                generatedFrom: "video_transcript+context",
                difficultyScore: 0.5,
                bloomsLevel: "understand"
            }
        }
    ],
    hard: [
        {
            id: "q_h1",
            type: "mcq",
            question: "How does React's fiber reconciliation differ from the stack reconciler?",
            options: [
                "Fiber allows incremental rendering by splitting work into units",
                "They are identical",
                "Stack is newer",
                "Fiber only works with class components"
            ],
            correctAnswer: 0,
            difficulty: "hard",
            points: 30,
            explanation: "Fiber architecture enables incremental rendering, allowing React to pause and resume work for better performance.",
            topicId: "course_003",
            llmMetadata: {
                model: "flan-t5-xl",
                generatedFrom: "video_transcript+research",
                difficultyScore: 0.85,
                bloomsLevel: "evaluate"
            }
        },
        {
            id: "q_h2",
            type: "mcq",
            question: "When should you use useCallback vs useMemo?",
            options: [
                "useCallback memoizes functions, useMemo memoizes computed values",
                "They are identical",
                "useCallback is for effects",
                "useMemo is deprecated"
            ],
            correctAnswer: 0,
            difficulty: "hard",
            points: 30,
            explanation: "useCallback returns a memoized callback function; useMemo returns a memoized computed value.",
            topicId: "course_003",
            llmMetadata: {
                model: "flan-t5-xl",
                generatedFrom: "video_transcript+research",
                difficultyScore: 0.75,
                bloomsLevel: "analyze"
            }
        },
        {
            id: "q_h3",
            type: "mcq",
            question: "What is the Suspense boundary pattern used for?",
            options: [
                "Error handling only",
                "Declarative loading states for async operations",
                "CSS animations",
                "Route protection"
            ],
            correctAnswer: 1,
            difficulty: "hard",
            points: 30,
            explanation: "Suspense lets you specify loading fallbacks for components that perform async operations like data fetching or lazy loading.",
            topicId: "course_003",
            llmMetadata: {
                model: "flan-t5-xl",
                generatedFrom: "video_transcript+research",
                difficultyScore: 0.8,
                bloomsLevel: "apply"
            }
        },
        {
            id: "q_h4",
            type: "mcq",
            question: "What problem does the useTransition hook solve?",
            options: [
                "It handles CSS transitions",
                "It marks state updates as non-urgent to keep UI responsive",
                "It manages page navigation",
                "It replaces useEffect"
            ],
            correctAnswer: 1,
            difficulty: "hard",
            points: 30,
            explanation: "useTransition lets you mark updates as transitions, keeping the UI responsive during expensive re-renders.",
            topicId: "course_003",
            llmMetadata: {
                model: "flan-t5-xl",
                generatedFrom: "video_transcript+research",
                difficultyScore: 0.8,
                bloomsLevel: "evaluate"
            }
        },
        {
            id: "q_h5",
            type: "mcq",
            question: "In server components, what determines the client/server boundary?",
            options: [
                "File extension",
                "The 'use client' directive at the top of the file",
                "Component name prefix",
                "Import order"
            ],
            correctAnswer: 1,
            difficulty: "hard",
            points: 30,
            explanation: "The 'use client' directive marks the boundary — everything below it becomes a client component.",
            topicId: "course_003",
            llmMetadata: {
                model: "flan-t5-xl",
                generatedFrom: "video_transcript+research",
                difficultyScore: 0.7,
                bloomsLevel: "understand"
            }
        }
    ]
};
function generateAttentionSnapshot() {
    const states = [
        "attentive",
        "inattentive",
        "unfocused"
    ];
    const weights = [
        0.6,
        0.25,
        0.15
    ] // More likely to be attentive
    ;
    const rand = Math.random();
    let state = "attentive";
    if (rand > weights[0] + weights[1]) state = "unfocused";
    else if (rand > weights[0]) state = "inattentive";
    const scoreRanges = {
        attentive: [
            70,
            100
        ],
        inattentive: [
            35,
            69
        ],
        unfocused: [
            0,
            34
        ]
    };
    const [min, max] = scoreRanges[state];
    const score = Math.floor(Math.random() * (max - min + 1)) + min;
    const messages = {
        attentive: [
            "Excellent focus! You're fully engaged.",
            "Great concentration! Keep it up.",
            "You're doing amazing — stay locked in!"
        ],
        inattentive: [
            "Looks like your attention is drifting. Try refocusing.",
            "You seem a bit distracted. The key point is coming up!",
            "Hey, try to stay with the content — you've got this!"
        ],
        unfocused: [
            "You seem unfocused. Consider taking a short break.",
            "Your attention is very low. Pause and stretch if needed.",
            "Try closing other tabs and refocusing on the video."
        ]
    };
    return {
        timestamp: new Date().toISOString(),
        score,
        state,
        confidence: Math.random() * 0.3 + 0.7,
        message: messages[state][Math.floor(Math.random() * messages[state].length)],
        modelResponse: {
            eye_contact: state === "attentive" ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5,
            head_pose: state === "attentive" ? "forward" : state === "inattentive" ? "slightly_away" : "away",
            face_detected: Math.random() > 0.05,
            blink_rate: Math.floor(Math.random() * 10) + 10
        }
    };
}
const DUMMY_TRANSCRIPT_SEGMENTS = [
    {
        id: "t1",
        text: "Welcome to this lesson on React fundamentals.",
        timestamp: "00:00",
        startTime: 0,
        endTime: 3,
        confidence: 0.97,
        modelResponse: {
            language: "en",
            words: [
                {
                    word: "Welcome",
                    start: 0,
                    end: 0.5,
                    confidence: 0.98
                },
                {
                    word: "to",
                    start: 0.5,
                    end: 0.6,
                    confidence: 0.99
                },
                {
                    word: "this",
                    start: 0.6,
                    end: 0.8,
                    confidence: 0.97
                },
                {
                    word: "lesson",
                    start: 0.8,
                    end: 1.2,
                    confidence: 0.96
                }
            ]
        }
    },
    {
        id: "t2",
        text: "Today we'll explore how React uses a virtual DOM for efficient rendering.",
        timestamp: "00:04",
        startTime: 4,
        endTime: 8,
        confidence: 0.94,
        modelResponse: {
            language: "en",
            words: [
                {
                    word: "Today",
                    start: 4,
                    end: 4.3,
                    confidence: 0.95
                },
                {
                    word: "we'll",
                    start: 4.3,
                    end: 4.5,
                    confidence: 0.93
                }
            ]
        }
    },
    {
        id: "t3",
        text: "Components are the building blocks of any React application.",
        timestamp: "00:09",
        startTime: 9,
        endTime: 12,
        confidence: 0.96,
        modelResponse: {
            language: "en",
            words: [
                {
                    word: "Components",
                    start: 9,
                    end: 9.6,
                    confidence: 0.97
                }
            ]
        }
    },
    {
        id: "t4",
        text: "You can think of components as reusable, self-contained pieces of UI.",
        timestamp: "00:13",
        startTime: 13,
        endTime: 17,
        confidence: 0.92,
        modelResponse: {
            language: "en",
            words: []
        }
    },
    {
        id: "t5",
        text: "There are two types: functional components and class components.",
        timestamp: "00:18",
        startTime: 18,
        endTime: 22,
        confidence: 0.95,
        modelResponse: {
            language: "en",
            words: []
        }
    },
    {
        id: "t6",
        text: "Modern React strongly favors functional components with hooks.",
        timestamp: "00:23",
        startTime: 23,
        endTime: 27,
        confidence: 0.93,
        modelResponse: {
            language: "en",
            words: []
        }
    },
    {
        id: "t7",
        text: "The useState hook lets you add state to functional components.",
        timestamp: "00:28",
        startTime: 28,
        endTime: 32,
        confidence: 0.96,
        modelResponse: {
            language: "en",
            words: []
        }
    },
    {
        id: "t8",
        text: "useEffect handles side effects like data fetching and subscriptions.",
        timestamp: "00:33",
        startTime: 33,
        endTime: 37,
        confidence: 0.91,
        modelResponse: {
            language: "en",
            words: []
        }
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "awardXP",
    ()=>awardXP,
    "checkEmailStatus",
    ()=>checkEmailStatus,
    "emailReport",
    ()=>emailReport,
    "fetchAttentionHistory",
    ()=>fetchAttentionHistory,
    "fetchCourseById",
    ()=>fetchCourseById,
    "fetchCourses",
    ()=>fetchCourses,
    "fetchDailyChallenges",
    ()=>fetchDailyChallenges,
    "fetchDummyAttention",
    ()=>fetchDummyAttention,
    "fetchLeaderboard",
    ()=>fetchLeaderboard,
    "fetchLiveTranscriptSegment",
    ()=>fetchLiveTranscriptSegment,
    "fetchNotifications",
    ()=>fetchNotifications,
    "fetchStudentProfile",
    ()=>fetchStudentProfile,
    "fetchTranscription",
    ()=>fetchTranscription,
    "fetchVideoById",
    ()=>fetchVideoById,
    "generateAssessment",
    ()=>generateAssessment,
    "generateReportPdf",
    ()=>generateReportPdf,
    "sendAttentionFrame",
    ()=>sendAttentionFrame,
    "submitAssessment",
    ()=>submitAssessment,
    "transcribeAudioChunk",
    ()=>transcribeAudioChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// ============================================================
// API SERVICE LAYER — FastAPI Backend + Dummy Fallback
//
// USAGE:
//   1. Set NEXT_PUBLIC_API_URL=http://localhost:8000/api in .env.local
//   2. Start FastAPI backend: cd backend && python main.py
//   3. Every function tries the backend first
//   4. On failure → falls back to local dummy data seamlessly
//
// To switch to BACKEND-ONLY mode (no fallback):
//   Set NEXT_PUBLIC_API_STRICT=true
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dummyDb.ts [app-client] (ecmascript)");
;
// ── Config ──
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:8000/api") || "http://localhost:8000/api";
const STRICT_MODE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_STRICT === "true";
// ── Helpers ──
const delay = (ms)=>new Promise((r)=>setTimeout(r, ms));
/**
 * Recursively convert snake_case keys to camelCase.
 * Handles the mismatch between FastAPI (snake_case) and frontend (camelCase).
 */ function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, c)=>c.toUpperCase());
}
function normalizeKeys(obj) {
    if (Array.isArray(obj)) return obj.map(normalizeKeys);
    if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((acc, key)=>{
            acc[snakeToCamel(key)] = normalizeKeys(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
async function apiFetch(path, options, fallback) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers
            },
            ...options
        });
        if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
        const data = await res.json();
        // Normalize snake_case keys from backend to camelCase for frontend
        return normalizeKeys(data);
    } catch (err) {
        if (STRICT_MODE) throw err;
        console.warn(`[API] ${path} failed, using fallback:`, err.message);
        if (fallback) return await fallback();
        throw err;
    }
}
async function fetchStudentProfile() {
    return apiFetch("/student/profile?student_id=student_001", {
        method: "GET"
    }, async ()=>{
        await delay(200);
        return JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_STUDENT"]));
    });
}
async function awardXP(amount, studentId = "student_001") {
    return apiFetch("/student/xp", {
        method: "POST",
        body: JSON.stringify({
            student_id: studentId,
            amount,
            reason: "assessment"
        })
    }, async ()=>{
        await delay(100);
        const s = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_STUDENT"];
        s.xp += amount;
        const leveledUp = s.xp >= s.xpToNextLevel;
        if (leveledUp) {
            s.level++;
            s.xp -= s.xpToNextLevel;
            s.xpToNextLevel = Math.floor(s.xpToNextLevel * 1.2);
        }
        return {
            newXP: s.xp,
            newLevel: s.level,
            leveledUp,
            xpToNextLevel: s.xpToNextLevel
        };
    });
}
async function fetchCourses() {
    return apiFetch("/courses", {
        method: "GET"
    }, async ()=>{
        await delay(300);
        return JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_COURSES"]));
    });
}
async function fetchCourseById(courseId) {
    return apiFetch(`/courses/${courseId}`, {
        method: "GET"
    }, async ()=>{
        await delay(200);
        const c = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_COURSES"].find((c)=>c.id === courseId);
        return c ? JSON.parse(JSON.stringify(c)) : null;
    });
}
async function fetchVideoById(courseId, videoId) {
    return apiFetch(`/courses/${courseId}/videos/${videoId}`, {
        method: "GET"
    }, async ()=>{
        await delay(150);
        const course = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_COURSES"].find((c)=>c.id === courseId);
        if (!course) return null;
        const video = course.videoLinks.find((v)=>v.id === videoId);
        if (!video) return null;
        return {
            course: JSON.parse(JSON.stringify(course)),
            video: JSON.parse(JSON.stringify(video))
        };
    });
}
async function sendAttentionFrame(frameBase64, videoId, studentId = "student_001") {
    return apiFetch("/attention/snapshot", {
        method: "POST",
        body: JSON.stringify({
            frame_base64: frameBase64,
            video_id: videoId,
            student_id: studentId
        })
    }, async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttentionSnapshot"])());
}
async function fetchDummyAttention() {
    return apiFetch("/attention/dummy-snapshot", {
        method: "GET"
    }, async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttentionSnapshot"])());
}
async function fetchAttentionHistory(videoId, studentId = "student_001") {
    return apiFetch(`/attention/history?video_id=${videoId}&student_id=${studentId}`, {
        method: "GET"
    }, async ()=>({
            logs: [],
            average_score: 0
        }));
}
async function fetchTranscription(videoId) {
    return apiFetch(`/transcription/${videoId}`, {
        method: "GET"
    }, async ()=>{
        await delay(200);
        return JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_TRANSCRIPT_SEGMENTS"]));
    });
}
async function fetchLiveTranscriptSegment(videoId, currentTime) {
    return apiFetch(`/transcription/${videoId}/live?current_time=${currentTime}`, {
        method: "GET"
    }, async ()=>{
        const seg = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_TRANSCRIPT_SEGMENTS"].find((t)=>currentTime >= t.startTime && currentTime < t.endTime);
        return seg ? JSON.parse(JSON.stringify(seg)) : null;
    });
}
async function transcribeAudioChunk(videoId, audioBase64) {
    return apiFetch("/transcription/chunk", {
        method: "POST",
        body: JSON.stringify({
            video_id: videoId,
            audio_chunk_base64: audioBase64
        })
    }, async ()=>({
            segments: JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_TRANSCRIPT_SEGMENTS"]))
        }));
}
async function generateAssessment(courseId, videoId, attentionScore, previousScore, transcriptText = "") {
    return apiFetch("/assessment/generate", {
        method: "POST",
        body: JSON.stringify({
            course_id: courseId,
            video_id: videoId,
            student_id: "student_001",
            attention_score: attentionScore,
            previous_score: previousScore,
            transcript_text: transcriptText
        })
    }, async ()=>{
        // Local fallback: adaptive difficulty selection
        await delay(500);
        let difficulty = "medium";
        let reason = "Default medium difficulty";
        if (previousScore !== null) {
            if (previousScore >= 80) {
                difficulty = "hard";
                reason = `Prev score ${previousScore}% → hard`;
            } else if (previousScore < 50) {
                difficulty = "easy";
                reason = `Prev score ${previousScore}% → easy`;
            }
        }
        if (attentionScore < 40 && difficulty !== "easy") {
            difficulty = "easy";
            reason += ` | Low attention (${attentionScore}%) → easy`;
        }
        const questions = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QUESTION_BANK"][difficulty].slice(0, 5);
        const timeLimits = {
            easy: 600,
            medium: 420,
            hard: 300
        };
        return {
            id: `session_${Date.now()}`,
            courseId,
            videoId,
            questions,
            difficulty,
            timeLimit: timeLimits[difficulty],
            attentionScoreDuringVideo: attentionScore,
            adaptiveMetadata: {
                previousScore,
                adjustedDifficulty: difficulty,
                reason
            }
        };
    });
}
async function submitAssessment(sessionId, answers, questions, timeSpent) {
    return apiFetch("/assessment/submit", {
        method: "POST",
        body: JSON.stringify({
            session_id: sessionId,
            student_id: "student_001",
            answers,
            time_spent: timeSpent
        })
    }, async ()=>{
        // Local fallback grading
        await delay(400);
        let correct = 0;
        let earned = 0;
        const total = questions.reduce((s, q)=>s + q.points, 0);
        questions.forEach((q)=>{
            if (answers[q.id] === q.correctAnswer) {
                correct++;
                earned += q.points;
            }
        });
        const pct = Math.round(correct / questions.length * 100);
        const xp = Math.floor(earned * 1.5);
        let nextDiff = "medium";
        let trend = "stable";
        if (pct >= 80) {
            nextDiff = "hard";
            trend = "improving";
        } else if (pct < 50) {
            nextDiff = "easy";
            trend = "declining";
        }
        const msg = pct >= 90 ? "Outstanding! You've mastered this." : pct >= 70 ? "Well done! Solid understanding." : pct >= 50 ? "Decent effort. Review weak areas." : "Keep practicing! Rewatch the video.";
        return {
            sessionId,
            score: pct,
            totalPoints: total,
            earnedPoints: earned,
            percentage: pct,
            xpEarned: xp,
            timeSpent,
            correctAnswers: correct,
            totalQuestions: questions.length,
            difficulty: questions[0]?.difficulty || "medium",
            message: msg,
            nextDifficulty: nextDiff,
            suggestedTopics: pct >= 70 ? [
                "Next: Advanced Topics"
            ] : [
                "Review: Rewatch Video",
                "Practice: Easier Questions"
            ],
            adaptiveResponse: {
                performanceTrend: trend,
                recommendedAction: pct >= 80 ? "Moving to harder content." : pct >= 50 ? "Keep practicing at this level." : "Review material and try again.",
                nextAssessmentDifficulty: nextDiff,
                strengthAreas: correct >= 3 ? [
                    "Core Concepts",
                    "Syntax"
                ] : [
                    "Basic Recognition"
                ],
                weakAreas: correct < 3 ? [
                    "Applied Knowledge",
                    "Deep Understanding"
                ] : []
            }
        };
    });
}
async function fetchLeaderboard() {
    return apiFetch("/leaderboard", {
        method: "GET"
    }, async ()=>{
        await delay(250);
        return JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_LEADERBOARD"]));
    });
}
async function fetchDailyChallenges() {
    return apiFetch("/challenges/daily", {
        method: "GET"
    }, async ()=>{
        await delay(150);
        return JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_DAILY_CHALLENGES"]));
    });
}
async function fetchNotifications() {
    return apiFetch("/notifications?student_id=student_001", {
        method: "GET"
    }, async ()=>{
        await delay(100);
        return JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dummyDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_NOTIFICATIONS"]));
    });
}
async function generateReportPdf(payload) {
    const res = await fetch(`${API_BASE}/report/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Report generation failed: ${res.status}`);
    return res.blob();
}
async function emailReport(toEmail, payload) {
    const res = await fetch(`${API_BASE}/report/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            toEmail,
            reportData: payload
        })
    });
    if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.detail || "Email failed");
    }
    return res.json();
}
async function checkEmailStatus() {
    const res = await fetch(`${API_BASE}/report/email-status`);
    if (!res.ok) return {
        configured: false,
        message: "Server unreachable"
    };
    return res.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function Navbar({ studentName, level, xp, xpToNextLevel, streak }) {
    _s();
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showNotifs, setShowNotifs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showProfile, setShowProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const unreadCount = notifications.filter((n)=>!n.read).length;
    const xpPercent = Math.round(xp / xpToNextLevel * 100);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchNotifications"])().then(setNotifications);
        }
    }["Navbar.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].nav, {
        initial: {
            opacity: 0,
            y: -10
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "sticky top-0 z-40 h-16 border-b border-[var(--border-subtle)] glass-strong flex items-center justify-between px-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 flex-1 max-w-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative flex-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                            size: 16,
                            className: "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        }, void 0, false, {
                            fileName: "[project]/components/Navbar.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Search courses, topics...",
                            className: "w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        }, void 0, false, {
                            fileName: "[project]/components/Navbar.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Navbar.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Navbar.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden lg:flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        whileHover: {
                            scale: 1.05
                        },
                        className: "flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                size: 14,
                                className: "text-violet-400"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold text-violet-300",
                                children: [
                                    "Lv. ",
                                    level
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        width: 0
                                    },
                                    animate: {
                                        width: `${xpPercent}%`
                                    },
                                    className: "h-full rounded-full progress-animated"
                                }, void 0, false, {
                                    fileName: "[project]/components/Navbar.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-mono text-[var(--text-muted)]",
                                children: [
                                    xpPercent,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        whileHover: {
                            scale: 1.05
                        },
                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                size: 14,
                                className: "text-orange-400"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold text-orange-300",
                                children: streak
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Navbar.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                whileHover: {
                                    scale: 1.05
                                },
                                whileTap: {
                                    scale: 0.95
                                },
                                onClick: ()=>{
                                    setShowNotifs(!showNotifs);
                                    setShowProfile(false);
                                },
                                className: "relative w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.tsx",
                                        lineNumber: 84,
                                        columnNumber: 13
                                    }, this),
                                    unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            scale: 0
                                        },
                                        animate: {
                                            scale: 1
                                        },
                                        className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold text-white",
                                            children: unreadCount
                                        }, void 0, false, {
                                            fileName: "[project]/components/Navbar.tsx",
                                            lineNumber: 91,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.tsx",
                                        lineNumber: 86,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                children: showNotifs && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 10,
                                        scale: 0.95
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: 10,
                                        scale: 0.95
                                    },
                                    className: "absolute right-0 top-12 w-80 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl shadow-black/40 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "px-4 py-3 border-b border-[var(--border-subtle)]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-[var(--text-primary)]",
                                                children: "Notifications"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.tsx",
                                                lineNumber: 105,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Navbar.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "max-h-80 overflow-y-auto",
                                            children: notifications.map((notif)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer ${!notif.read ? "bg-violet-500/5" : ""}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-lg",
                                                                children: notif.icon
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.tsx",
                                                                lineNumber: 114,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1 min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs font-semibold text-[var(--text-primary)]",
                                                                        children: notif.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.tsx",
                                                                        lineNumber: 116,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-[var(--text-muted)] mt-0.5",
                                                                        children: notif.message
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.tsx",
                                                                        lineNumber: 117,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-[var(--text-muted)] mt-1",
                                                                        children: notif.timestamp
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.tsx",
                                                                        lineNumber: 118,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/Navbar.tsx",
                                                                lineNumber: 115,
                                                                columnNumber: 25
                                                            }, this),
                                                            !notif.read && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-2 h-2 rounded-full bg-violet-500 mt-1 shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.tsx",
                                                                lineNumber: 120,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.tsx",
                                                        lineNumber: 113,
                                                        columnNumber: 23
                                                    }, this)
                                                }, notif.id, false, {
                                                    fileName: "[project]/components/Navbar.tsx",
                                                    lineNumber: 109,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/Navbar.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Navbar.tsx",
                                    lineNumber: 98,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                whileHover: {
                                    scale: 1.02
                                },
                                whileTap: {
                                    scale: 0.98
                                },
                                onClick: ()=>{
                                    setShowProfile(!showProfile);
                                    setShowNotifs(false);
                                },
                                className: "flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md",
                                        children: studentName.split(" ").map((n)=>n[0]).join("")
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.tsx",
                                        lineNumber: 138,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hidden md:block text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-semibold text-[var(--text-primary)]",
                                                children: studentName
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.tsx",
                                                lineNumber: 142,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-[var(--text-muted)]",
                                                children: [
                                                    xp,
                                                    " XP"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Navbar.tsx",
                                                lineNumber: 143,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Navbar.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        size: 14,
                                        className: "text-[var(--text-muted)]"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                children: showProfile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 10,
                                        scale: 0.95
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: 10,
                                        scale: 0.95
                                    },
                                    className: "absolute right-0 top-12 w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl shadow-black/40 p-1",
                                    children: [
                                        "Profile",
                                        "Settings",
                                        "Help",
                                        "Sign Out"
                                    ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors",
                                            children: item
                                        }, item, false, {
                                            fileName: "[project]/components/Navbar.tsx",
                                            lineNumber: 157,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/Navbar.tsx",
                                    lineNumber: 150,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Navbar.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Navbar.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(Navbar, "3DtKRcAl68ND4W3/RcyJ4RfQtm0=");
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/assessment/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AssessmentLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Navbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AssessmentLayout({ children }) {
    _s();
    const [student, setStudent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AssessmentLayout.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchStudentProfile"])().then(setStudent);
        }
    }["AssessmentLayout.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[var(--bg-primary)] flex",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                xp: student?.xp || 0,
                xpToNextLevel: student?.xpToNextLevel || 1,
                level: student?.level || 1,
                streak: student?.streak || 0
            }, void 0, false, {
                fileName: "[project]/app/assessment/layout.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col min-h-screen",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        studentName: student?.name || "Student",
                        level: student?.level || 1,
                        xp: student?.xp || 0,
                        xpToNextLevel: student?.xpToNextLevel || 1,
                        streak: student?.streak || 0
                    }, void 0, false, {
                        fileName: "[project]/app/assessment/layout.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 overflow-y-auto",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/app/assessment/layout.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/assessment/layout.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/assessment/layout.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_s(AssessmentLayout, "pzKVz50thxP4x+ztGYlLWy+Ge6I=");
_c = AssessmentLayout;
var _c;
__turbopack_context__.k.register(_c, "AssessmentLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0c498fd2._.js.map