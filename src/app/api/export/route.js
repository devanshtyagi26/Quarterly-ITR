import { connect } from "@/dbConnection/dbConfig";
import { NextResponse } from "next/server";
import { withAPIHandler } from "@/middleware/apiMiddleware";
import createDoc from "@/helpers/createDoc";
import { Packer } from "docx";
import { saveToSystemStorage } from "@/helpers/findSystemStorage";

async function postHandler(request) {
  const data = await request.json();
  const doc = createDoc(data);
  const buffer = await Packer.toBuffer(doc);

  // 1. Permanent System Log (Internal storage)
  //   const systemPath = await saveToSystemStorage(buffer, "report.docx");
  //   console.log(`Internal backup saved at: ${systemPath}`);

  // 2. Direct Browser Download (The actual "user" download)
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="Quarterly_Report_${Date.now()}.docx"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  });
}

export const POST = withAPIHandler(postHandler, {
  requireAuth: true,
  endpoint: "/api/export",
  allowedMethods: ["POST"],
});
