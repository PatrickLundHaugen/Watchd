import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Incoming register request:", body);

        const { username, email, password } = body;

        if (!username || !email || !password) {
            console.log("Missing fields:", { username, email, password });
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            console.log("User already exists:", username);
            return NextResponse.json({ message: "Username already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        console.log("User created:", newUser);

        return NextResponse.json(
            { message: "User created", user: { id: newUser.id, username: newUser.username } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error); // <- This should print something useful
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

