import { useState } from "react";
import { Cpu, Brain, Save, CheckCircle2 } from "lucide-react";

export function SettingsPanel() {
    // Hardware States
    const [baudRate, setBaudRate] = useState("9600");
    const [comPort, setComPort] = useState("/dev/ttyUSB0");
    const [updateFreq, setUpdateFreq] = useState("5");

    // AI States
    const [aiModel, setAiModel] = useState("gpt-4o");
    const [apiKey, setApiKey] = useState("");
    const [temperature, setTemperature] = useState("0.7");

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate a network request to save settings
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            console.log("Saved Config:", { baudRate, comPort, updateFreq, aiModel, apiKey, temperature });
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">System Configuration</h2>
                <p className="text-slate-500 text-sm">Manage hardware communication and AI model parameters for Chatcommiot.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Hardware Configuration Card */}
                <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                        <Cpu className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">NEO-6M GPS Hardware</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">COM Port / Device Path</label>
                            <input
                                type="text"
                                value={comPort}
                                onChange={(e) => setComPort(e.target.value)}
                                placeholder="e.g., COM3 or /dev/ttyUSB0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Baud Rate</label>
                                <select
                                    value={baudRate}
                                    onChange={(e) => setBaudRate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="4800">4800</option>
                                    <option value="9600">9600 (Default)</option>
                                    <option value="19200">19200</option>
                                    <option value="38400">38400</option>
                                    <option value="115200">115200</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Update Freq (sec)</label>
                                <input
                                    type="number"
                                    value={updateFreq}
                                    onChange={(e) => setUpdateFreq(e.target.value)}
                                    min="1"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Configuration Card */}
                <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-slate-800">AI Model Integration</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Active Model</label>
                            <select
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="gpt-4o">GPT-4o (OpenAI)</option>
                                <option value="claude-3-opus">Claude 3 Opus (Anthropic)</option>
                                <option value="llama-3">Llama 3 (Local/Groq)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-mono text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">Temperature (Strictness)</label>
                                <span className="text-xs font-mono text-slate-500">{temperature}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                className="w-full accent-purple-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Predictable</span>
                                <span>Creative</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
                >
                    {saved ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Saved
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Configuration"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}