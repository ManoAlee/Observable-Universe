import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

interface ClusterDetailProps {
    cluster: any
    onClose: () => void
}

export default function ClusterDetail({ cluster, onClose }: ClusterDetailProps) {
    return (
        <AnimatePresence>
            {cluster && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    className="absolute top-0 right-0 h-full w-[500px] bg-black/90 backdrop-blur-xl border-l border-cyan-500/30 p-8 z-40 shadow-2xl shadow-cyan-500/20 overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">
                                {cluster.root}
                            </h2>
                            <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-widest">{cluster.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded hover:bg-red-500/20"
                        >
                            [CLOSE_STREAM]
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* System Log / Lore */}
                        {cluster.lore && (
                            <Section title="SYSTEM KERNEL LOGS">
                                <div className="space-y-4">
                                    {cluster.lore.map((l: any, i: number) => (
                                        <div key={i} className="bg-white/5 border-l-2 border-cyan-500/50 p-3 rounded-r relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
                                                <span className="text-[40px] leading-none font-black">0{i + 1}</span>
                                            </div>
                                            <h4 className="text-cyan-300 font-bold text-sm mb-1">{l.title}</h4>
                                            <p className="text-gray-300 text-xs leading-relaxed">{l.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Active Agents */}
                        {cluster.agents && (
                            <Section title="ACTIVE DAEMONS">
                                <div className="grid grid-cols-2 gap-2">
                                    {cluster.agents.map((agent: any, i: number) => (
                                        <div key={i} className="bg-blue-900/20 border border-blue-500/20 p-2 rounded flex flex-col justify-center items-center text-center hover:bg-blue-900/40 transition-colors">
                                            <span className="text-blue-300 font-bold text-sm block">{agent.name}</span>
                                            <span className="text-blue-500/60 text-[10px] uppercase">{agent.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Incidents */}
                        {cluster.incidents && (
                            <Section title="SECURITY INCIDENTS">
                                <div className="space-y-2">
                                    {cluster.incidents.map((inc: any, i: number) => (
                                        <div key={i} className="bg-red-900/10 border border-red-500/30 p-2 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                                <h4 className="text-red-400 font-bold text-xs uppercase">{inc.title}</h4>
                                            </div>
                                            <p className="text-red-200/60 text-[10px]">{inc.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Core Stats */}
                        <Section title="OPERATIONAL METRICS">
                            <div className="grid grid-cols-2 gap-4">
                                <Badge label="OS KERNEL" value={cluster.os || 'UNKNOWN'} color="cyan" />
                                <Badge label="NODE COUNT" value={cluster.nodes || 'N/A'} color="purple" />
                            </div>

                            <div className="mt-4">
                                <h4 className="text-[10px] text-gray-500 uppercase mb-2">Focus Routines</h4>
                                <div className="flex flex-wrap gap-2">
                                    {cluster.focus?.map((f: string) => (
                                        <span key={f} className="text-[10px] px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-300">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        {/* Technologies */}
                        <Section title="TECH STACK">
                            <div className="space-y-3">
                                {Object.entries(cluster.technologies || {}).map(([category, techs]: [string, any]) => (
                                    <div key={category}>
                                        <h4 className="text-[10px] uppercase text-gray-500 mb-1">{category}</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(techs) ? techs.map((t: string) => (
                                                <span key={t} className="text-xs px-2 py-0.5 bg-gray-800 border border-gray-600 rounded hover:border-cyan-400 transition-colors cursor-crosshair">
                                                    {t}
                                                </span>
                                            )) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-black text-white/40 tracking-[0.2em] mb-4 border-b border-white/5 pb-2">
                {title}
            </h3>
            {children}
        </div>
    )
}

function Badge({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="flex flex-col p-2 bg-white/5 rounded border border-white/5">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{label}</span>
            <span className={`font-mono font-bold text-sm text-${color}-400 break-words`}>{value}</span>
        </div>
    )
}
