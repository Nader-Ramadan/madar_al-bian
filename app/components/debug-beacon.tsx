"use client";

import { useEffect, useRef } from "react";

const INGEST =
  "http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3";
const SESSION = "51cdae";

type BeaconProps = {
  location: string;
  hypothesisId: string;
  message?: string;
  data?: Record<string, unknown>;
};

export function DebugBeacon({
  location,
  hypothesisId,
  message = "beacon",
  data,
}: BeaconProps) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    // #region agent log
    fetch(INGEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": SESSION,
      },
      body: JSON.stringify({
        sessionId: SESSION,
        location,
        message,
        data: data ?? {},
        timestamp: Date.now(),
        hypothesisId,
      }),
    }).catch(() => {});
    // #endregion
  }, [location, hypothesisId, message, data]);

  return null;
}

export function logDebugClient(payload: {
  location: string;
  hypothesisId: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  // #region agent log
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify({
      sessionId: SESSION,
      location: payload.location,
      message: payload.message,
      data: payload.data ?? {},
      timestamp: Date.now(),
      hypothesisId: payload.hypothesisId,
    }),
  }).catch(() => {});
  // #endregion
}
