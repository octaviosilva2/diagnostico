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
    
    if (rows.length === 0) {
      return new Response("No data", { status: 404 });
    }

    // Basic CSV generation
    const headers = ["ID", "Empresa", "Contato", "Produto/Serviço", "Funcionários", "Anos", "Respostas", "Data"];
    const csvRows = rows.map(row => [
      row.id,
      `"${row.company_name?.toString().replace(/"/g, '""')}"`,
      `"${row.contact_name?.toString().replace(/"/g, '""')}"`,
      `"${row.product_service?.toString().replace(/"/g, '""')}"`,
      `"${row.employees}"`,
      `"${row.years_existing}"`,
      `"${row.answers?.toString().replace(/"/g, '""')}"`,
      row.created_at
    ]);

    const csvContent = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=diagnosticos_${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao exportar CSV" }, { status: 500 });
  }
}
