import { NextResponse } from "next/server";
import { client, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (password !== "admin2026") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await initDb();
    const result = await client.execute("SELECT * FROM responses ORDER BY created_at DESC");
    
    return NextResponse.json({ 
      success: true, 
      responses: result.rows.map(row => ({
        id: row.id,
        empresa: row.company_name,
        nome: row.contact_name,
        produto: row.product_service,
        tamanho: row.employees,
        tempo: row.years_existing,
        // Legacy keys for index table
        company: row.company_name,
        name: row.contact_name,
        product: row.product_service,
        answers: row.answers ? JSON.parse(row.answers as string) : {},
        submittedAt: row.created_at,
      }))
    });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json({ success: false, error: "Falha ao buscar" }, { status: 500 });
  }
}
