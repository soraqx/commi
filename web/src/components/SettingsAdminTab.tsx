import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Save, CheckCircle2, AlertTriangle, Eye, RotateCcw, Trash2 } from "lucide-react";

export function SettingsAdminTab() {
    const config = useQuery(api.config.get);
    const updateConfig = useMutation(api.config.updateConfig);

    const [confidenceThreshold, setConfidenceThreshold] = useState(0.65);
    const [saveInferenceImages, setSaveInferenceImages] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (config && !initialized) {
            setConfidenceThreshold(config.yoloThreshold ?? 0.65);
            setSaveInferenceImages(config.saveInferenceImages ?? false);
            setInitialized(true);
        }
    }, [config, initialized]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateConfig({
                yoloThreshold: confidenceThreshold,
                saveInferenceImages,
            });
            setSaved(true);
            setHasChanges(false);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save config:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnyChange = () => {
        if (!hasChanges) setHasChanges(true);
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-900 pb-32">
            <div className="max-w-4xl mx-auto px-6 mt-8 flex flex-col gap-8">


                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-xl bg-purple-500/20 p-2.5">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">YOLOv11 Inference Settings</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-slate-300">Confidence Threshold</label>
                                <span className="text-sm font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{confidenceThreshold.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={confidenceThreshold}
                                onChange={(e) => {
                                    setConfidenceThreshold(parseFloat(e.target.value));
                                    handleAnyChange();
                                }}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>0.1 (Loose)</span>
                                <span>1.0 (Strict)</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <Eye className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Save Inference Images</p>
                                    <p className="text-xs text-slate-500">Debug mode - stores raw detection frames</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSaveInferenceImages(!saveInferenceImages);
                                    handleAnyChange();
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${saveInferenceImages ? "bg-purple-500" : "bg-slate-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${saveInferenceImages ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-xl bg-red-500/20 p-2.5">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-400">System Management</h3>
                    </div>

                    <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
                        <p className="text-sm text-red-300">
                            These actions will affect all connected edge nodes. Proceed with caution - system disruption may occur.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Clear Telemetry Ledger
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                            <RotateCcw className="w-4 h-4" />
                            Reboot All Edge Nodes
                        </button>
                    </div>
                </div>
            </div>

            <div className="fixed right-6 z-50 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all shadow-lg ${
                        hasChanges
                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                >
                    {saved ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            Saved
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {isSaving ? "Saving..." : "Save"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}