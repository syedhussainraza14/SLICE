import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { authOptions } from "./[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  if (req.method === "GET") {
    const assessments = await prisma.assessment.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        exam: true,
        studentName: true,
        rollNo: true,
        status: true,
        stageIndex: true,
        examDate: true,
        createdAt: true,
        rawJson: true
      }
    });

    return res.status(200).json(
      assessments.map((item) => ({
        ...item,
        examDate: item.examDate ? item.examDate.toISOString() : null,
        rawJson: item.rawJson ?? {}
      }))
    );
  }

  if (req.method === "POST") {
    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "A valid JSON object is required." });
    }

    const created = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        exam:
          typeof payload?.meta?.exam === "string"
            ? payload.meta.exam
            : "Assessment",
        studentName:
          typeof payload?.meta?.studentName === "string"
            ? payload.meta.studentName
            : null,
        rollNo:
          typeof payload?.meta?.rollNo === "string" ? payload.meta.rollNo : null,
        examDate: payload?.meta?.date ? new Date(payload.meta.date) : null,
        status: typeof payload?.status === "string" ? payload.status : "active",
        stageIndex:
          typeof payload?.stageIndex === "number" ? payload.stageIndex : null,
        ratings: payload?.ratings ?? {},
        guidance: payload?.guidance ?? {},
        events: payload?.events ?? [],
        rawJson: payload
      }
    });

    return res.status(201).json({
      id: created.id,
      message: "Assessment saved successfully."
    });
  }

  return res.status(405).json({ error: "Method not allowed." });
}
