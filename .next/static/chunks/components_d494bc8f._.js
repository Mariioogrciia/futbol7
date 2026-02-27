(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/providers/team-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TeamProvider",
    ()=>TeamProvider,
    "useTeamData",
    ()=>useTeamData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568";
const defaultStats = {
    victorias: 0,
    empates: 0,
    derrotas: 0,
    golesFavor: 0,
    golesContra: 0,
    partidosJugados: 0
};
const TeamContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    jugadores: [],
    topGoleadores: [],
    partidos: [],
    goleadoresPartido: [],
    stats: defaultStats,
    loading: true,
    refreshData: async ()=>{}
});
function TeamProvider(param) {
    let { children } = param;
    _s();
    const [jugadores, setJugadores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [topGoleadores, setTopGoleadores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [partidos, setPartidos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [goleadoresPartido, setGoleadoresPartido] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultStats);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchData = async ()=>{
        setLoading(true);
        try {
            const ts = new Date().getTime();
            const [playersRes, matchesRes] = await Promise.all([
                fetch("/api/players?equipo_id=".concat(EQUIPO_ID, "&t=").concat(ts)),
                fetch("/api/matches?equipo_id=".concat(EQUIPO_ID, "&t=").concat(ts))
            ]);
            if (playersRes.ok) {
                const pData = await playersRes.json();
                setJugadores(pData.jugadores || []);
                setTopGoleadores(pData.top_goleadores || []);
            }
            if (matchesRes.ok) {
                const mData = await matchesRes.json();
                const matchesList = mData.partidos || [];
                setPartidos(matchesList);
                setGoleadoresPartido(mData.goleadores || []);
                const finalizados = matchesList.filter((m)=>m.estado === "finalizado");
                let won = 0;
                let drawn = 0;
                let lost = 0;
                let gf = 0;
                let ga = 0;
                finalizados.forEach((m)=>{
                    const mGf = Number(m.goles_equipo || 0);
                    const mGa = Number(m.goles_rival || 0);
                    gf += mGf;
                    ga += mGa;
                    if (mGf > mGa) won++;
                    else if (mGf === mGa) drawn++;
                    else lost++;
                });
                setStats({
                    victorias: won,
                    empates: drawn,
                    derrotas: lost,
                    golesFavor: gf,
                    golesContra: ga,
                    partidosJugados: finalizados.length
                });
            }
        } catch (error) {
            console.error("Error fetching team context data:", error);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TeamProvider.useEffect": ()=>{
            fetchData();
        }
    }["TeamProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamContext.Provider, {
        value: {
            jugadores,
            topGoleadores,
            partidos,
            goleadoresPartido,
            stats,
            loading,
            refreshData: fetchData
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/components/providers/team-provider.tsx",
        lineNumber: 115,
        columnNumber: 9
    }, this);
}
_s(TeamProvider, "cpwQJFvExuqoGPjZh4hiCR6GDeQ=");
_c = TeamProvider;
function useTeamData() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TeamContext);
}
_s1(useTeamData, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "TeamProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/theme-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
"use client";
;
;
function ThemeProvider(param) {
    let { children, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/theme-provider.tsx",
        lineNumber: 7,
        columnNumber: 12
    }, this);
}
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_d494bc8f._.js.map