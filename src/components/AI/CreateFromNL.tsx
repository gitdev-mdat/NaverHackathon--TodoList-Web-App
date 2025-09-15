// components/AI/CreateFromNL.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  generateFromPromptClient,
  DEFAULT_GEMINI_MODEL,
} from "../../lib/genaiClient";
import useTasks from "../../hooks/useTasks";
import { normalizeParsedTask } from "../../lib/normalizeParsedTask";
import type { NormalizeResult } from "../../lib/normalizeParsedTask";

import styles from "../../styles/CreateFromNL.module.css";
import type { Task, Priority } from "../../types/Task";

type ParsedTask = {
  title: string;
  description?: string | null;
  priority?: Priority;
  allDay?: boolean;
  dueDate?: string | null;
  endDate?: string | null;
  tags?: string[];
};

type Item = {
  parsed: ParsedTask;
  normalize: NormalizeResult;
  editable?: Omit<Task, "id">;
};

export default function CreateFromNL() {
  const { addTask } = useTasks();
  const [apiKey, setApiKey] = useState("");
  const [remember, setRemember] = useState(false);
  const [modelName, setModelName] = useState(DEFAULT_GEMINI_MODEL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<number>(0.0);

  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // hydrate apiKey from session if saved
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("GEMINI_API_KEY_SESSION");
      if (s) {
        setApiKey(s);
        setRemember(true);
      }
    } catch {}
  }, []);

  // persist when apiKey or remember changes (avoid storing empty key)
  useEffect(() => {
    try {
      if (remember && apiKey)
        sessionStorage.setItem("GEMINI_API_KEY_SESSION", apiKey);
      if (!remember) sessionStorage.removeItem("GEMINI_API_KEY_SESSION");
    } catch {}
  }, [remember, apiKey]);

  const promptTemplate = (userText: string) => `
You are a strict JSON extractor. Parse the user's instruction into a JSON array of task objects.
RETURN ONLY A JSON ARRAY (no extra words, be compact).

Schema:
[
  {
    "title": string,
    "description": string | null,
    "priority": "low"|"medium"|"high",
    "allDay": boolean,
    "dueDate": string | null,   // prefer YYYY-MM-DD if only date
    "endDate": string | null,
    "tags": string[]
  }
]

Instruction:
"""${userText}"""
`;

  // robust extractor for different response shapes
  function extractTextFromResponseBody(bodyText: string) {
    try {
      const json = JSON.parse(bodyText);

      const candidate = json?.candidates?.[0] ?? json?.candidate ?? null;
      const finishReason = candidate?.finishReason ?? candidate?.finish_reason;

      // try common places
      const tryPaths = [
        () => candidate?.content?.parts?.[0]?.text,
        () => candidate?.output?.[0]?.content?.[0]?.text,
        () => candidate?.content?.[0]?.text,
        () => json?.text,
      ];

      for (const fn of tryPaths) {
        try {
          const v = fn();
          if (typeof v === "string" && v.trim().length > 0) {
            return {
              text: v,
              truncated:
                finishReason === "MAX_TOKENS" || finishReason === "max_tokens",
            };
          }
        } catch {}
      }

      // deep search first string leaf
      const findFirstString = (obj: any): string | null => {
        if (!obj) return null;
        if (typeof obj === "string") return obj;
        if (Array.isArray(obj)) {
          for (const it of obj) {
            const x = findFirstString(it);
            if (x) return x;
          }
        } else if (typeof obj === "object") {
          for (const k of Object.keys(obj)) {
            const x = findFirstString(obj[k]);
            if (x) return x;
          }
        }
        return null;
      };

      const found = findFirstString(json);
      if (found) {
        return {
          text: found,
          truncated:
            finishReason === "MAX_TOKENS" || finishReason === "max_tokens",
        };
      }

      return {
        text: JSON.stringify(json),
        truncated:
          finishReason === "MAX_TOKENS" || finishReason === "max_tokens",
      };
    } catch {
      // not JSON -> try extract JSON array substring if present
      const match = bodyText.match(/\[[\s\S]*\]/);
      if (match) return { text: match[0], truncated: false };
      return { text: bodyText, truncated: false };
    }
  }

  const runParse = useCallback(async () => {
    setError(null);
    setRaw(null);
    setItems(null);
    setStatus(null);

    if (!apiKey) {
      setError("Paste your Gemini API key (demo).");
      return;
    }
    if (!input.trim()) {
      setError("Please enter an instruction.");
      return;
    }

    setLoading(true);
    try {
      const prompt = promptTemplate(input);
      const res = await generateFromPromptClient(apiKey.trim(), prompt, {
        model: modelName,
        temperature,
        maxOutputTokens: 2048, // bump to reduce truncation for JSON
      });

      if (!res.ok) {
        setError(res.error ?? "Model error");
        setLoading(false);
        return;
      }

      setRaw(res.raw ?? null);

      const { text: extractedText, truncated } = extractTextFromResponseBody(
        res.raw ?? ""
      );

      if (truncated) {
        setError(
          "Model output was truncated (MAX_TOKENS). Increase maxOutputTokens or shorten the prompt."
        );
        setLoading(false);
        return;
      }

      // parse JSON array from extracted text
      let j: any = null;
      try {
        j = JSON.parse(extractedText);
      } catch {
        const arr = extractedText.match(/\[[\s\S]*\]/);
        if (arr) {
          try {
            j = JSON.parse(arr[0]);
          } catch {
            j = null;
          }
        }
      }

      if (!Array.isArray(j)) {
        setError("Model did not return a JSON array. Check raw output.");
        setLoading(false);
        return;
      }

      // Map parsed JSON -> parsed tasks -> normalize -> items
      const mapped: Item[] = j.map((p: any) => {
        const parsed: ParsedTask = {
          title: String(p?.title ?? "").trim(),
          description: p?.description ?? null,
          priority: ["low", "medium", "high"].includes(p?.priority)
            ? p.priority
            : "medium",
          allDay: !!p?.allDay,
          dueDate: p?.dueDate ?? null,
          endDate: p?.endDate ?? null,
          tags: Array.isArray(p?.tags) ? p.tags.map(String) : [],
        };

        const normalize: NormalizeResult = normalizeParsedTask(parsed);
        const editable = normalize.task ? { ...normalize.task } : undefined;
        return { parsed, normalize, editable };
      });

      setItems(mapped);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [apiKey, input, modelName, temperature]);

  const updateEditable = (idx: number, patch: Partial<Omit<Task, "id">>) => {
    setItems((prev) => {
      if (!prev) return prev;
      const copy = [...prev];
      const it = { ...copy[idx] };
      it.editable = {
        ...(it.editable ?? it.normalize.task ?? ({} as Omit<Task, "id">)),
        ...patch,
      };
      copy[idx] = it;
      return copy;
    });
  };

  const handleCreate = useCallback(() => {
    if (!items || items.length === 0) {
      setError("No parsed tasks to create.");
      return;
    }
    const bad = items.find((it) => it.normalize.error);
    if (bad) {
      setError("Fix errors before creating.");
      return;
    }

    let createdCount = 0;
    const failures: string[] = [];

    for (const [idx, it] of items.entries()) {
      const data = it.editable ?? it.normalize.task;
      if (!data) {
        failures.push(`Item ${idx + 1}: invalid data`);
        continue;
      }
      if (!data.title || data.title.trim() === "") {
        failures.push(`Item ${idx + 1}: missing title`);
        continue;
      }

      const toAdd: Omit<Task, "id"> = {
        title: data.title,
        description: data.description ?? "",
        dueDate: data.dueDate,
        endDate: data.endDate,
        allDay: !!data.allDay,
        priority: data.priority ?? "medium",
        createdAt: new Date().toISOString(),
        completed: false,
      };
      try {
        addTask?.(toAdd);
        createdCount += 1;
      } catch (e: any) {
        console.error("addTask error", e);
        failures.push(
          `Item ${idx + 1}: failed to add (${e?.message ?? "unknown"})`
        );
      }
    }

    // Provide feedback
    if (createdCount > 0) {
      setStatus({
        type: "success",
        message: `Created ${createdCount} task${
          createdCount > 1 ? "s" : ""
        } successfully.`,
      });
    }
    if (failures.length > 0) {
      setStatus({
        type: createdCount > 0 ? "info" : "error",
        message:
          (createdCount > 0 ? `Some items failed: ` : `Create failed: `) +
          failures.slice(0, 3).join("; ") +
          (failures.length > 3 ? `; +${failures.length - 3} more` : ""),
      });
    }

    // clear UI on successful creation
    if (createdCount > 0) {
      setItems(null);
      setRaw(null);
      setInput("");
    }

    // auto-dismiss message after 4s
    window.setTimeout(() => setStatus(null), 4000);
  }, [items, addTask]);

  const hasErrors = useMemo(
    () => !!items?.some((it) => !!it.normalize.error),
    [items]
  );
  const anyWarnings = useMemo(
    () =>
      items?.some((it) => (it.normalize.warnings || []).length > 0) ?? false,
    [items]
  );

  return (
    <div
      className={styles?.container ?? undefined}
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid #e6eefb",
        background: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Create tasks from natural language</h3>

      {status && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background:
              status.type === "success"
                ? "#ecfdf5"
                : status.type === "error"
                ? "#fff1f2"
                : "#fff7ed",
            color:
              status.type === "success"
                ? "#065f46"
                : status.type === "error"
                ? "#9f1239"
                : "#92400e",
            border:
              status.type === "success"
                ? "1px solid #10b98133"
                : status.type === "error"
                ? "1px solid #ef444433"
                : "1px solid #f59e0b33",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>{status.message}</div>
          <button
            onClick={() => setStatus(null)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              padding: 6,
            }}
            aria-label="Close status"
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
          Gemini API key (demo)
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your Gemini API key"
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span style={{ fontSize: 13 }}>Remember key for this session</span>
          </label>

          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={{
              marginLeft: "auto",
              padding: 6,
              borderRadius: 6,
              border: "1px solid #ddd",
            }}
            placeholder="model, e.g. gemini-2.0 or gemini-2.5-flash"
          />
        </div>
      </div>

      <label style={{ display: "block", marginBottom: 8 }}>
        Instruction
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder='e.g., "Create deadline: submit Naver Hackathon slides next Friday 5pm, high priority"'
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        />
      </label>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 8,
          alignItems: "center",
        }}
      >
        <button
          onClick={runParse}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#6366f1",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "Parsing..." : "Parse instruction"}
        </button>
        <label
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          Temp:
          <input
            type="number"
            step="0.1"
            min={0}
            max={1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>
      </div>

      {error && (
        <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
      )}

      {raw && (
        <div style={{ marginBottom: 8 }}>
          <strong>Raw model output:</strong>
          <pre
            style={{
              maxHeight: 160,
              overflow: "auto",
              padding: 8,
              background: "#f8fafc",
              borderRadius: 6,
            }}
          >
            {raw}
          </pre>
        </div>
      )}

      {items && (
        <div style={{ marginBottom: 8 }}>
          <strong>Parsed tasks (preview):</strong>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {items.map((it, i) => {
              const nr = it.normalize;
              const ed = it.editable;
              const disabled = !!nr.error;
              return (
                <div
                  key={i}
                  style={{
                    padding: 8,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      value={ed?.title ?? nr.task?.title ?? it.parsed.title}
                      onChange={(e) =>
                        updateEditable(i, { title: e.target.value })
                      }
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                      }}
                    />
                    <select
                      value={
                        ed?.priority ??
                        nr.task?.priority ??
                        it.parsed.priority ??
                        "medium"
                      }
                      onChange={(e) =>
                        updateEditable(i, {
                          priority: e.target.value as Priority,
                        })
                      }
                      style={{ marginLeft: 8 }}
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <label
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          ed?.allDay ?? nr.task?.allDay ?? !!it.parsed.allDay
                        }
                        onChange={(e) =>
                          updateEditable(i, { allDay: e.target.checked })
                        }
                      />{" "}
                      All day
                    </label>

                    <input
                      type="date"
                      value={(
                        ed?.dueDate ??
                        nr.task?.dueDate ??
                        it.parsed.dueDate ??
                        ""
                      ).slice(0, 10)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (
                          ed?.allDay ??
                          nr.task?.allDay ??
                          !!it.parsed.allDay
                        ) {
                          const iso = new Date(val + "T00:00:00").toISOString();
                          updateEditable(i, { dueDate: iso });
                        } else {
                          const iso = new Date(val + "T09:00:00").toISOString();
                          updateEditable(i, { dueDate: iso });
                        }
                      }}
                      style={{
                        marginLeft: "auto",
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
                    {nr.warnings && nr.warnings.length > 0 && (
                      <div>
                        <strong>Warnings:</strong>
                        <ul style={{ margin: "6px 0 0 18px" }}>
                          {nr.warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {nr.error && (
                      <div style={{ color: "crimson" }}>
                        <strong>Error:</strong> {nr.error}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              onClick={handleCreate}
              disabled={hasErrors}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#10b981",
                color: "#fff",
                border: "none",
              }}
            >
              Create tasks
            </button>
            <button
              onClick={() => {
                setItems(null);
                setRaw(null);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            >
              Cancel
            </button>
          </div>

          {anyWarnings && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#92400e" }}>
              <strong>Note:</strong> items show warnings — please review before
              creating.
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
        <strong>Important note:</strong> You can use my api key for demo , but
        be aware that it may have limited quota and could stop working at any
        time. For reliable access, please obtain and use your own Gemini API
        key. Thank your support.
        <br /> <br />
        <strong>My api key:</strong> AIzaSyBVMiandzjP1tlVXaQCqA62wGjjNHHS2Cc
      </div>
    </div>
  );
}
