"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function MisterChat() {
    // useChat manually handles messages, we manage input locally
    const { messages, sendMessage, status } = useChat();
    const isLoading = status === "submitted" || status === "streaming";

    const [input, setInput] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput("");
    };

    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[500px] max-h-[85vh]">
                    {/* Header */}
                    <div className="bg-zinc-900 border-b border-zinc-800 p-4 font-bold text-zinc-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl" role="img" aria-label="entrenador cabreado">🤬</span>
                            <div>
                                <span className="block font-bold">El Míster</span>
                                <span className="block text-xs text-zinc-400 font-normal">Siempre de mal humor</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
                        {messages.length === 0 && (
                            <div className="flex items-start gap-2 mb-4">
                                <span className="text-2xl mt-1">🤬</span>
                                <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm shadow-sm">
                                    ¿Qué quieres, chaval? Más te vale que sea importante o te pongo a correr hasta que vomites.
                                </div>
                            </div>
                        )}

                        {messages.map((m: any) => (
                            <div key={m.id} className={cn("flex items-start gap-2 w-full", m.role === "user" ? "flex-row-reverse" : "")}>
                                {m.role === "assistant" ? (
                                    <span className="text-2xl mt-1">🤬</span>
                                ) : (
                                    <span className="text-2xl mt-1">👦🏻</span>
                                )}
                                <div className={cn(
                                    "rounded-2xl px-4 py-2 text-sm shadow-sm max-w-[80%]",
                                    m.role === "user"
                                        ? "bg-emerald-600 text-white rounded-tr-sm"
                                        : "bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/50"
                                )}>
                                    {m.parts ? m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') : (m.content || "")}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-2">
                                <span className="text-2xl mt-1">🤬</span>
                                <div className="bg-zinc-800 text-zinc-400 rounded-2xl rounded-tl-sm px-4 py-2 text-sm shadow-sm flex gap-1 items-center">
                                    <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-zinc-900 border-t border-zinc-800">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                className="flex-1 bg-zinc-950 border border-zinc-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow placeholder:text-zinc-500"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Pregúntale al Míster..."
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 w-10 h-10"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center border border-zinc-700 group relative"
                    aria-label="Hablar con el Míster"
                >
                    {/* tooltip */}
                    <span className="absolute -top-10 right-0 bg-black text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-800">
                        El Míster
                    </span>
                    {/* Whistle SVG Icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-8 h-8 text-emerald-500 group-hover:text-emerald-400"
                    >
                        <path d="M12 2v2" />
                        <path d="M6 8v4a6 6 0 0 0 12 0V8a6 6 0 0 0-12 0z" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M15 8h4" />
                    </svg>
                </button>
            )}
        </div>
    );
}
