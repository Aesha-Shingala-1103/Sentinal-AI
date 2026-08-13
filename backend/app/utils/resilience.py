"""
Resilience utilities: retry-with-backoff and source health tracking.

Every connector call is routed through `call_with_resilience`, which:
  1. Retries transient failures (timeouts, 5xx, connection errors) with
     exponential backoff + jitter.
  2. Trips a lightweight circuit breaker for a source if it fails
     repeatedly, so we stop hammering a dead/rate-limited API for a
     cool-down window.
  3. Records rolling health stats (success rate, avg latency, last
     check, current state) per source, exposed via GET /api/sources/health.
"""

import asyncio
import random
import time
from collections import deque
from dataclasses import dataclass, field


RETRYABLE_STATUS = {408, 425, 429, 500, 502, 503, 504}


@dataclass
class SourceHealth:
    name: str
    calls: int = 0
    successes: int = 0
    failures: int = 0
    consecutive_failures: int = 0
    last_latency_ms: float = 0.0
    last_checked: float = 0.0
    last_error: str | None = None
    recent: deque = field(default_factory=lambda: deque(maxlen=20))
    circuit_open_until: float = 0.0

    @property
    def reliability(self) -> int:
        if self.calls == 0:
            return 100
        return round((self.successes / self.calls) * 100)

    @property
    def status(self) -> str:
        if time.time() < self.circuit_open_until:
            return "degraded"
        if self.calls == 0:
            return "unknown"
        return "healthy" if self.reliability >= 60 else "degraded"

    def to_dict(self):
        return {
            "source": self.name,
            "status": self.status,
            "reliability": self.reliability,
            "calls": self.calls,
            "successes": self.successes,
            "failures": self.failures,
            "avg_latency_ms": round(
                sum(self.recent) / len(self.recent), 1
            ) if self.recent else 0,
            "last_latency_ms": round(self.last_latency_ms, 1),
            "last_checked": self.last_checked,
            "last_error": self.last_error,
            "circuit_open": time.time() < self.circuit_open_until,
        }


class HealthRegistry:
    """Process-wide registry of connector health. In-memory; good enough
    for a single-instance hackathon deployment. Swap for Mongo-backed
    storage if running multiple workers."""

    def __init__(self):
        self._sources: dict[str, SourceHealth] = {}
        self._lock = asyncio.Lock()

    def _get(self, name: str) -> SourceHealth:
        if name not in self._sources:
            self._sources[name] = SourceHealth(name=name)
        return self._sources[name]

    async def record(self, name: str, ok: bool, latency_ms: float, error: str | None = None):
        async with self._lock:
            h = self._get(name)
            h.calls += 1
            h.last_latency_ms = latency_ms
            h.last_checked = time.time()
            h.recent.append(latency_ms)

            if ok:
                h.successes += 1
                h.consecutive_failures = 0
                h.last_error = None
            else:
                h.failures += 1
                h.consecutive_failures += 1
                h.last_error = error

                # Trip circuit breaker after 3 consecutive failures for 60s
                if h.consecutive_failures >= 3:
                    h.circuit_open_until = time.time() + 60

    def is_open(self, name: str) -> bool:
        h = self._get(name)
        return time.time() < h.circuit_open_until

    def snapshot(self):
        return [h.to_dict() for h in self._sources.values()]


registry = HealthRegistry()


async def call_with_resilience(source_name: str, coro_fn, *args, max_attempts=3, **kwargs):
    """Runs `coro_fn(*args, **kwargs)` (an async connector lookup) with
    retry + backoff + circuit breaker + health recording. `coro_fn` must
    return a ConnectorResult-like object with `.success` and optionally
    `.error` / `.status_code`."""

    if registry.is_open(source_name):
        from app.models.connector import ConnectorResult
        await registry.record(source_name, False, 0.0, "Circuit open (cooling down)")
        return ConnectorResult(
            source=source_name,
            success=False,
            error="Temporarily skipped: source failing repeatedly, cooling down.",
        )

    last_result = None
    last_error = None

    for attempt in range(1, max_attempts + 1):
        start = time.perf_counter()
        try:
            result = await coro_fn(*args, **kwargs)
            latency_ms = (time.perf_counter() - start) * 1000

            ok = bool(getattr(result, "success", False))
            await registry.record(
                source_name, ok, latency_ms,
                None if ok else getattr(result, "error", "unknown error"),
            )

            if ok:
                return result

            last_result = result
            last_error = getattr(result, "error", "unknown error")

            # Only retry if error text hints at something transient
            transient = any(
                token in str(last_error).lower()
                for token in ("timeout", "timed out", "connection", "429", "503", "502", "temporarily")
            )
            if not transient or attempt == max_attempts:
                return result

        except Exception as e:  # noqa: BLE001
            latency_ms = (time.perf_counter() - start) * 1000
            last_error = str(e)
            await registry.record(source_name, False, latency_ms, last_error)

            if attempt == max_attempts:
                from app.models.connector import ConnectorResult
                return ConnectorResult(source=source_name, success=False, error=last_error)

        # exponential backoff with jitter before next attempt
        await asyncio.sleep((2 ** (attempt - 1)) * 0.4 + random.uniform(0, 0.3))

    if last_result is not None:
        return last_result

    from app.models.connector import ConnectorResult
    return ConnectorResult(source=source_name, success=False, error=last_error or "Unknown failure")
