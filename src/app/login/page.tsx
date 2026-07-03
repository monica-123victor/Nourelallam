"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        setLoading(false);
        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Incorrect password.");
            return;
        }
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream text-xl">
                        ⛺
                    </div>
                    <h1 className="font-display text-3xl text-forest-dark">NourelAllam</h1>
                    <p className="mt-1 text-sm text-charcoal/60">Leaders only — enter your password</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-white/60 p-6 shadow-sm">
                    {error && (
                        <div className="rounded-lg bg-ember/10 border border-ember/30 px-3 py-2 text-sm text-ember">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-charcoal/80">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
                            placeholder="Enter leader password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-forest py-2.5 text-sm font-medium text-cream hover:bg-forest-dark disabled:opacity-60"
                    >
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}