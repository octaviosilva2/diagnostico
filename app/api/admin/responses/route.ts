import { NextResponse } from "next/server";
import { client } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== "admin2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await client.execute("SELECT * FROM responses ORDER BY created_at DESC");
    
    // Parse answers JSON string
    const responses = rows.map(row => ({
      ...row,
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers
    }));

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: "Falha ao buscar respostas" }, { status: 500 });
  }
}
