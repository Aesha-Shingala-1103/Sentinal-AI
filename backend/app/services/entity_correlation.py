from collections import defaultdict


class EntityCorrelationEngine:

    def correlate(self, connector_results, query=None, query_type=None):

        entities = {}
        relationships = []
        pivot_scores = defaultdict(int)

        # ---------------------------------------------------------

        def add_entity(value, entity_type, source):

            if not value:
                return

            value = str(value).strip()

            if not value:
                return

            key = f"{entity_type}:{value.lower()}"

            if key not in entities:

                entities[key] = {
                    "id": key,
                    "type": entity_type,
                    "value": value,
                    "sources": set(),
                }

            entities[key]["sources"].add(source)

        # ---------------------------------------------------------
        # Add the searched query itself
        # ---------------------------------------------------------

        if query and query_type:
            add_entity(query, query_type, "Input")

        # ---------------------------------------------------------
        # Extract entities from connectors
        # ---------------------------------------------------------

        for result in connector_results:

            if not result.get("success"):
                continue

            source = result["source"]
            data = result.get("data") or {}

            if not isinstance(data, dict) and not isinstance(data, list):
                continue

            # =====================================================
            # RDAP
            # =====================================================

            if source == "RDAP":

                add_entity(data.get("ldhName"), "domain", source)

                add_entity(data.get("registrar"), "registrar", source)

                for ns in data.get("nameservers", []):
                    add_entity(ns, "nameserver", source)

                for entity in data.get("entities", []):

                    if isinstance(entity, dict):
                        add_entity(
                            entity.get("handle"),
                            "organization",
                            source,
                        )

            # =====================================================
            # VirusTotal
            # =====================================================

            elif source == "VirusTotal":

                reputation = data.get("reputation")

                if reputation is not None:
                    add_entity(
                        f"Reputation {reputation}",
                        "reputation",
                        source,
                    )

                for _, category in data.get("categories", {}).items():

                    add_entity(
                        category,
                        "category",
                        source,
                    )

            # =====================================================
            # GitHub
            # =====================================================

            elif source == "GitHub":

                add_entity(data.get("login"), "username", source)
                add_entity(data.get("name"), "person", source)
                add_entity(data.get("company"), "organization", source)
                add_entity(data.get("blog"), "domain", source)

            # =====================================================
            # Gravatar
            # =====================================================

            elif source == "Gravatar":

                add_entity(data.get("display_name"), "person", source)
                add_entity(data.get("profile_url"), "profile", source)
                add_entity(data.get("avatar_url"), "avatar", source)

            # =====================================================
            # crt.sh
            # =====================================================

            elif source == "crt.sh":

                for cert in data.get("certificates", []):

                    add_entity(
                        cert.get("common_name"),
                        "domain",
                        source,
                    )

                    add_entity(
                        cert.get("issuer"),
                        "certificate_authority",
                        source,
                    )

            # =====================================================
            # Holehe
            # =====================================================

            elif source == "Holehe":

                if isinstance(data, list):

                    for account in data:

                        if not account.get("exists"):
                            continue

                        add_entity(
                            account.get("name"),
                            "service",
                            source,
                        )

                        username = account.get("username")

                        if username:
                            add_entity(
                                username,
                                "username",
                                source,
                            )

            # =====================================================
            # Wayback
            # =====================================================

            elif source == "Wayback":

                if data.get("url"):

                    add_entity(
                        data["url"],
                        "archive",
                        source,
                    )

            # =====================================================
            # DNS
            # =====================================================

            elif source == "DNS":

                for ns in data.get("ns", []):
                    add_entity(ns, "nameserver", source)

                for mx in data.get("mx", []):
                    add_entity(mx, "mail_server", source)

            # =====================================================
            # WHOIS
            # =====================================================

            elif source == "WHOIS":

                add_entity(data.get("registrar"), "registrar", source)
                add_entity(data.get("org"), "organization", source)
                add_entity(data.get("country"), "location", source)

                emails = data.get("emails")
                if isinstance(emails, list):
                    for e in emails:
                        add_entity(e, "email", source)
                elif emails:
                    add_entity(emails, "email", source)

            # =====================================================
            # Username Enumeration (Sherlock-style)
            # =====================================================

            elif source == "UsernameEnum":

                for match in data.get("matches", []):
                    add_entity(match.get("url"), "profile", source)
                    add_entity(match.get("platform"), "service", source)

            # =====================================================
            # HIBP (breach exposure)
            # =====================================================

            elif source == "HIBP":

                for breach in data.get("breaches", []):
                    add_entity(breach.get("name"), "breach", source)
                    add_entity(breach.get("domain"), "domain", source)

            # =====================================================
            # Phone Intelligence
            # =====================================================

            elif source == "PhoneIntel":

                add_entity(data.get("carrier"), "carrier", source)
                add_entity(data.get("region"), "location", source)

            # =====================================================
            # Bitcoin / Ethereum wallets
            # =====================================================

            elif source in ("Bitcoin", "Ethereum"):

                add_entity(data.get("address"), "wallet", source)

            # =====================================================
            # IP Geolocation
            # =====================================================

            elif source == "IPGeo":

                add_entity(data.get("ip"), "ip_address", source)
                add_entity(data.get("isp"), "organization", source)
                add_entity(data.get("country"), "location", source)

        # =====================================================
        # Correlation Rules
        # =====================================================

        entity_list = list(entities.values())

        for entity in entity_list:

            # Email ↔ Username

            if entity["type"] == "email":

                username = entity["value"].split("@")[0].lower()

                for other in entity_list:

                    if other["type"] != "username":
                        continue

                    score = 0

                    if username == other["value"].lower():
                        score = 95

                    elif username in other["value"].lower():
                        score = 80

                    if score:

                        relationships.append({

                            "source": entity["value"],
                            "target": other["value"],
                            "relation": "same_identity",
                            "confidence": score

                        })

                        pivot_scores[other["value"]] += (
                            score + len(other["sources"]) * 5
                        )

            # Username ↔ Discovered profile (Sherlock-style matches)

            elif entity["type"] == "username":

                for other in entity_list:

                    if other["type"] != "profile":
                        continue

                    if entity["value"].lower() in other["value"].lower():

                        relationships.append({
                            "source": entity["value"],
                            "target": other["value"],
                            "relation": "has_profile",
                            "confidence": 90,
                        })

                        pivot_scores[other["value"]] += 90 + len(other["sources"]) * 5

            # Organization ↔ Domain

            elif entity["type"] == "organization":

                for other in entity_list:

                    if other["type"] != "domain":
                        continue

                    confidence = min(
                        100,
                        60
                        + len(entity["sources"]) * 10
                        + len(other["sources"]) * 10,
                    )

                    relationships.append({

                        "source": entity["value"],
                        "target": other["value"],
                        "relation": "owns",
                        "confidence": confidence

                    })

        # =====================================================
        # Remove duplicates
        # =====================================================

        seen = set()
        unique = []

        for rel in relationships:

            key = (
                rel["source"],
                rel["target"],
                rel["relation"],
            )

            if key not in seen:
                seen.add(key)
                unique.append(rel)

        relationships = unique

        relationships.sort(
            key=lambda x: x["confidence"],
            reverse=True,
        )

        # =====================================================
        # Pivot Points
        # =====================================================

        pivots = sorted(

            [
                {
                    "value": key,
                    "score": value,
                }
                for key, value in pivot_scores.items()
            ],

            key=lambda x: x["score"],
            reverse=True,

        )

        # =====================================================

        return {

            "entities": [

                {
                    **entity,
                    "sources": list(entity["sources"]),
                }

                for entity in entity_list

            ],

            "relationships": relationships,

            "pivot_points": pivots,

        }