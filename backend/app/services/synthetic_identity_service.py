"""Fake / synthetic identity signal detection.

Deliberately NOT a "this person is fake" verdict -- it's a transparent,
explainable list of signals commonly associated with throwaway/sock-puppet
accounts, each with its own weight and plain-English reason. An
investigator reads the signals and decides; the tool doesn't decide for
them. This is the legitimate version of "detect fake names": pattern
recognition on account characteristics, not an assertion about someone's
real-world identity or history.

Signals used (all derived from data other connectors already collected --
no new scraping):
  - Disposable/burner email domain
  - Username that looks auto-generated (high digit ratio, no dictionary-
    like structure, common bot-suffix patterns)
  - Near-zero cross-platform footprint despite the account being queried
    (thin digital history is a classic sock-puppet/new-account signal)
  - Recently created domain (WHOIS) -- relevant for domain-type investigations
  - Avatar image reused across many unrelated pages (stock photo / stolen
    photo indicator, from Vision Web Detection matches)
"""

import re


def _username_looks_generated(username: str) -> tuple[bool, str] | None:
    if not username:
        return None

    digit_ratio = sum(c.isdigit() for c in username) / max(len(username), 1)

    # e.g. "user38472913", "john_x9273746"
    if digit_ratio > 0.4 and len(username) >= 8:
        return True, "High proportion of digits in the handle, typical of auto-generated usernames."

    if re.search(r"\d{6,}$", username):
        return True, "Ends in a long numeric string, a common bulk-account-creation pattern."

    return False, ""


def assess(sources: list, correlation: dict, query: str, query_type: str) -> dict:

    signals = []
    score = 0  # 0-100, higher = more signals present (not "more fake")

    source_map = {s["source"]: s for s in sources if s.get("success")}

    # --- Disposable email domain ---
    if query_type == "email" and "@" in query:
        try:
            from disposable_email_domains import blocklist
            domain = query.split("@")[-1].lower().strip()
            if domain in blocklist:
                signals.append({
                    "signal": "disposable_email",
                    "weight": 30,
                    "detail": f"'{domain}' is a known disposable/temporary email provider.",
                })
                score += 30
        except Exception:  # noqa: BLE001
            pass

    # --- Username pattern ---
    username_candidate = query if query_type == "username" else query.split("@")[0] if "@" in query else None
    if username_candidate:
        result = _username_looks_generated(username_candidate)
        if result and result[0]:
            signals.append({
                "signal": "auto_generated_username",
                "weight": 20,
                "detail": result[1],
            })
            score += 20

    # --- Thin cross-platform footprint ---
    ue = source_map.get("UsernameEnum")
    if ue:
        found = ue["data"].get("profiles_found", 0)
        checked = ue["data"].get("sites_checked", 0)
        if checked > 0 and found == 0:
            signals.append({
                "signal": "no_public_footprint",
                "weight": 15,
                "detail": f"No public profile found on any of {checked} checked platforms -- "
                          f"could be a brand-new/throwaway account, or simply a private person.",
            })
            score += 15

    # --- Recently created domain ---
    whois = source_map.get("WHOIS")
    if whois:
        creation = whois["data"].get("creation_date")
        if creation:
            try:
                from datetime import datetime, timezone
                # creation_date may come back as a stringified list
                creation_str = creation.strip("[]'\" ") if isinstance(creation, str) else str(creation)
                for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
                    try:
                        parsed = datetime.strptime(creation_str[:19], fmt).replace(tzinfo=timezone.utc)
                        age_days = (datetime.now(timezone.utc) - parsed).days
                        if age_days < 90:
                            signals.append({
                                "signal": "recently_registered_domain",
                                "weight": 25,
                                "detail": f"Domain was registered only {age_days} days ago -- "
                                          f"common for short-lived phishing/scam infrastructure.",
                            })
                            score += 25
                        break
                    except ValueError:
                        continue
            except Exception:  # noqa: BLE001
                pass

    # --- Reused avatar image across unrelated pages ---
    # (populated separately by image_correlation_service; caller merges it in)

    score = min(score, 100)

    if score >= 60:
        level = "High"
    elif score >= 30:
        level = "Moderate"
    elif score > 0:
        level = "Low"
    else:
        level = "None"

    return {
        "score": score,
        "level": level,
        "signals": signals,
        "disclaimer": (
            "These are pattern-based signals, not a determination about any "
            "real person. Many legitimate accounts trigger one or more of "
            "these (privacy-conscious people, new accounts, VOIP/disposable "
            "email by choice). Treat as a prompt to look closer, not a verdict."
        ),
    }
