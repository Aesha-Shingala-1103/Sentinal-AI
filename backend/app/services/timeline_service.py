from datetime import datetime, timezone


def _parse_date(value):
    """Try to parse a date string into a sortable datetime. Return None if unparseable."""
    if not value:
        return None

    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc)
        except (ValueError, OSError):
            return None

    value = str(value).strip()

    # Wayback format: 20260816023332
    if value.isdigit() and len(value) == 14:
        try:
            return datetime.strptime(value, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
        except ValueError:
            return None

    # ISO-ish formats, including "1997-09-15 04:00:00+00:00" and "...Z"
    candidate = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(candidate)
    except ValueError:
        return None


def _display_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")


class TimelineService:

    def build_timeline(self, query: str, query_type: str, sources: list):

        raw_events = []

        def add_event(date_value, title, description, source, event_type, url=None):
            dt = _parse_date(date_value)
            if dt is None:
                # Do not invent dates -- skip events we can't place in time
                return
            raw_events.append({
                "date": _display_date(dt),
                "date_sort": dt.isoformat(),
                "title": title,
                "description": description,
                "source": source,
                "type": event_type,
                "url": url,
            })

        for source in sources:

            if not source.get("success"):
                continue

            source_name = source["source"]
            data = source.get("data") or {}

            # ----------------------------
            # RDAP
            # ----------------------------

            if source_name == "RDAP":
                domain = data.get("handle") or query

                add_event(
                    data.get("registration_date"),
                    "Domain Registered",
                    f"{domain} was registered",
                    "RDAP",
                    "domain_registration",
                )
                add_event(
                    data.get("expiration_date"),
                    "Domain Expiration",
                    f"{domain} registration expires",
                    "RDAP",
                    "domain_registration",
                )
                add_event(
                    data.get("last_changed_date"),
                    "Domain Record Updated",
                    f"{domain} RDAP record last changed",
                    "RDAP",
                    "domain_registration",
                )

            # ----------------------------
            # WHOIS
            # ----------------------------

            elif source_name == "WHOIS":

                def first_date(field):
                    v = data.get(field)
                    if isinstance(v, list):
                        return v[0] if v else None
                    return v

                add_event(
                    first_date("creation_date"),
                    "Domain Created",
                    f"{query} domain registration created",
                    "WHOIS",
                    "domain_registration",
                )
                add_event(
                    first_date("expiration_date"),
                    "Domain Expiration",
                    f"{query} domain registration expires",
                    "WHOIS",
                    "domain_registration",
                )
                add_event(
                    first_date("updated_date"),
                    "Domain Record Updated",
                    f"{query} WHOIS record last updated",
                    "WHOIS",
                    "domain_registration",
                )

            # ----------------------------
            # crt.sh
            # ----------------------------

            elif source_name == "crt.sh":

                seen_dates = set()
                for cert in data.get("certificates", [])[:10]:
                    logged_at = cert.get("logged_at")
                    if not logged_at or logged_at in seen_dates:
                        continue
                    seen_dates.add(logged_at)

                    common_name = cert.get("common_name") or query
                    add_event(
                        logged_at,
                        "Certificate Discovered",
                        f"Certificate logged for {common_name} (issuer: {cert.get('issuer') or 'unknown'})",
                        "crt.sh",
                        "certificate",
                    )

            # ----------------------------
            # GitHub
            # ----------------------------

            elif source_name == "GitHub":
                add_event(
                    data.get("created_at"),
                    "GitHub Account Created",
                    f"GitHub account '{data.get('login') or query}' was created",
                    "GitHub",
                    "account_discovery",
                    url=data.get("html_url"),
                )

            # ----------------------------
            # VirusTotal
            # ----------------------------

            elif source_name == "VirusTotal":

                add_event(
                    data.get("creation_date"),
                    "Domain Created",
                    f"{query} domain creation recorded by VirusTotal",
                    "VirusTotal",
                    "domain_registration",
                )
                add_event(
                    data.get("last_modification_date"),
                    "Domain Record Modified",
                    f"{query} record last modified",
                    "VirusTotal",
                    "reputation_change",
                )

            # ----------------------------
            # Holehe
            # ----------------------------

            elif source_name == "Holehe":
                # Holehe does not provide real dates -- account existence is
                # a present-tense fact, not a historical event. Do not invent
                # a timestamp for it; these belong in the profile, not the timeline.
                continue

            # ----------------------------
            # Wayback
            # ----------------------------

            elif source_name == "Wayback":
                if data.get("timestamp"):
                    add_event(
                        data["timestamp"],
                        "Archived Snapshot Found",
                        f"Web archive snapshot captured",
                        "Wayback",
                        "web_archive",
                        url=data.get("url"),
                    )

        # De-duplicate identical events (same date + title + source)
        seen = set()
        unique_events = []
        for event in raw_events:
            key = (event["date_sort"], event["title"], event["source"])
            if key not in seen:
                seen.add(key)
                unique_events.append(event)

        # Newest first, per handoff doc UI spec
        unique_events.sort(key=lambda x: x["date_sort"], reverse=True)

        return unique_events