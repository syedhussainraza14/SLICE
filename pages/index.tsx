import { useSession, signIn, signOut } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

type AssessmentRecord = {
  id: string;
  exam: string | null;
  studentName: string | null;
  rollNo: string | null;
  status: string | null;
  stageIndex: number | null;
  examDate: string | null;
  createdAt: string;
  rawJson: Record<string, any>;
};

const sampleJson = JSON.stringify(
  {
    schemaVersion: 1,
    app: "SLICE Examiner",
    exportedAt: "2026-10-13T07:25:57.870Z",
    records: [
      {
        meta: {
          exam: "Block 12 Exam",
          subject: "Medicine",
          studentName: "Ali Hussain",
          rollNo: "01001",
          date: "2026-10-13"
        },
        status: "active",
        stageIndex: 1,
        ratings: {
          h1: "veryGood",
          d1: "veryGood"
        }
      }
    ]
  },
  null,
  2
);

export default function HomePage() {
  const { data: session, status } = useSession();
  const [jsonText, setJsonText] = useState(sampleJson);
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadAssessments = async () => {
    const response = await fetch("/api/assessments");
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    setRecords(data);
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadAssessments();
    }
  }, [status]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = JSON.parse(jsonText);
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save assessment.");
      }

      setMessage("Assessment saved successfully.");
      setJsonText(sampleJson);
      await loadAssessments();
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || "Please provide valid JSON.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SLICE</p>
          <h1>Accessible assessment storage</h1>
        </div>
        <div>
          {status === "authenticated" ? (
            <button className="primary" onClick={() => signOut()}>
              Sign out
            </button>
          ) : (
            <button className="primary" onClick={() => signIn("google")}>
              Continue with Google
            </button>
          )}
        </div>
      </header>

      {status === "loading" ? (
        <p>Loading session…</p>
      ) : status === "authenticated" ? (
        <div className="layout">
          <section className="card">
            <h2>Save assessment JSON</h2>
            <form onSubmit={handleSave}>
              <label htmlFor="assessment-json">Assessment data</label>
              <textarea
                id="assessment-json"
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
                aria-label="Assessment JSON"
                rows={18}
              />

              <div className="actions">
                <button className="primary" type="submit" disabled={loading}>
                  {loading ? "Saving…" : "Save assessment"}
                </button>
              </div>

              {message ? <p className="message">{message}</p> : null}
            </form>
          </section>

          <aside className="card">
            <h2>Saved assessments</h2>
            {records.length === 0 ? (
              <p>No assessments saved yet.</p>
            ) : (
              <ul className="record-list">
                {records.map((record) => (
                  <li key={record.id}>
                    <strong>{record.exam || "Assessment"}</strong>
                    <div>
                      <span>{record.studentName || "Unknown student"}</span>
                      <span>{record.rollNo || "No roll number"}</span>
                    </div>
                    <small>
                      {record.status} • {record.stageIndex ?? "-"} • {record.examDate ? new Date(record.examDate).toLocaleDateString() : "No date"}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      ) : (
        <section className="welcome card">
          <h2>Sign in to save assessment data</h2>
          <p>
            Use your Google account to securely save assessment records and access them later.
          </p>
          <button className="primary" onClick={() => signIn("google")}>
            Sign in with Google
          </button>
        </section>
      )}
    </main>
  );
}
