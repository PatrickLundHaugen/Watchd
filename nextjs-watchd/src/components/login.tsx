"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoMdPerson } from "react-icons/io";
import { useUser } from "@/components/context/user-context";

interface LoginProps {
    trigger?: React.ReactNode;
}

const Login: React.FC<LoginProps> = ({ trigger }) => {
    const { user, setUser } = useUser();
    const [tab, setTab] = useState("log in");
    const [loginForm, setLoginForm] = useState({ username: "", password: "" });
    const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleChange = (formType: "login" | "register") => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (formType === "login") {
            setLoginForm((prev) => ({ ...prev, [name]: value }));
        } else {
            setRegisterForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const showToast = (msg: string) => {
        setStatus(msg);
        setTimeout(() => setStatus(null), 4000);
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Login failed");
                return;
            }

            showToast("Login successful!");
            if (data.user && data.user.username) {
                setUser({ username: data.user.username });
                setIsDialogOpen(false);
            }
        } catch (err) {
            console.error("Login error:", err);
            showToast("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const res = await fetch("api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerForm),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Registration failed");
                return;
            }

            showToast("Registration successful! You can now log in.");
            if (data.user && data.user.username) {
                setUser({ username: data.user.username });
                setIsDialogOpen(false);
            }
            setTab("log in");
        } catch (err) {
            console.error("Registration error:", err);
            showToast("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <IoMdPerson />
                    {user ? user.username : trigger}
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{tab === "log in" ? "Log in to your account" : "Register a new account"}</DialogTitle>
                    <DialogDescription>
                        {tab === "log in"
                            ? "Enter your credentials to log in."
                            : "Fill in the fields to create a new account."}
                    </DialogDescription>
                </DialogHeader>

                {status && (
                    <div className="text-sm text-red-500 mb-4">
                        {status}
                    </div>
                )}

                <Tabs defaultValue="log in" value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="log in">Log in</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="log in">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="login-username">Username</Label>
                                <Input
                                    id="login-username"
                                    name="username"
                                    autoComplete="off"
                                    value={loginForm.username}
                                    onChange={handleChange("login")}
                                    placeholder="yourusername"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    autoComplete="off"
                                    value={loginForm.password}
                                    onChange={handleChange("login")}
                                    placeholder="••••••••"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleLogin} disabled={loading}>
                                    {loading ? "Logging in..." : "Log in"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </TabsContent>

                    <TabsContent value="register">
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="register-username">Username</Label>
                                <Input
                                    id="register-username"
                                    name="username"
                                    autoComplete="off"
                                    value={registerForm.username}
                                    onChange={handleChange("register")}
                                    placeholder="newuser"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="register-email">Email</Label>
                                <Input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    value={registerForm.email}
                                    onChange={handleChange("register")}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="register-password">Password</Label>
                                <Input
                                    id="register-password"
                                    name="password"
                                    type="password"
                                    autoComplete="off"
                                    value={registerForm.password}
                                    onChange={handleChange("register")}
                                    placeholder="••••••••"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleRegister} disabled={loading}>
                                    {loading ? "Registering..." : "Register"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default Login;