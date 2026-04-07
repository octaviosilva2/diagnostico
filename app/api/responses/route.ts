import { NextResponse } from "next/server";
import { client, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await initDb();

    const { empresa, nome, produto, tamanho, tempo, answers } = data;

    await client.execute({
      sql: `INSERT INTO responses (company_name, contact_name, product_service, employees, years_existing, answers) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [empresa || "", nome || "", produto || "", tamanho || "", tempo || "", JSON.stringify(answers)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ success: false, error: "Falha ao salvar diagnóstico" }, { status: 500 });
  }
}
