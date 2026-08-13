import asyncio

from app.connectors.rdap import RDAPConnector
from app.connectors.virustotal import VirusTotalConnector
from app.connectors.github import GitHubConnector
from app.connectors.gravatar import GravatarConnector
from app.connectors.crtsh import CrtShConnector
from app.connectors.holehe_connector import HoleheConnector
from app.connectors.wayback import WaybackConnector
from app.connectors.dns_records import DNSConnector
from app.connectors.whois_fallback import WhoisConnector
from app.connectors.username_enum import UsernameEnumConnector
from app.connectors.hibp_breach import HIBPConnector
from app.connectors.phone_lookup import PhoneLookupConnector
from app.connectors.wallet_btc import BitcoinWalletConnector
from app.connectors.wallet_eth import EthereumWalletConnector
from app.connectors.ip_geo import IPGeoConnector

from app.services.entity_correlation import EntityCorrelationEngine
from app.services.correlation_service import CorrelationService
from app.services.timeline_service import TimelineService
from app.services.ai_summary_service import AISummaryService
from app.services.profile_service import ProfileService
from app.services.risk_service import RiskService
from app.services.image_correlation_service import correlate_images
from app.services.synthetic_identity_service import assess as assess_synthetic_identity
from app.services.case_linking_service import find_related_cases

from app.utils.resilience import call_with_resilience


class InvestigationService:

    def __init__(self):
        self.rdap = RDAPConnector()
        self.virustotal = VirusTotalConnector()
        self.github = GitHubConnector()
        self.gravatar = GravatarConnector()
        self.crtsh = CrtShConnector()
        self.holehe = HoleheConnector()
        self.wayback = WaybackConnector()
        self.dns = DNSConnector()
        self.whois = WhoisConnector()
        self.username_enum = UsernameEnumConnector()
        self.hibp = HIBPConnector()
        self.phone = PhoneLookupConnector()
        self.wallet_btc = BitcoinWalletConnector()
        self.wallet_eth = EthereumWalletConnector()
        self.ip_geo = IPGeoConnector()

        self.entity_engine = EntityCorrelationEngine()
        self.correlation = CorrelationService()
        self.timeline = TimelineService()
        self.ai = AISummaryService()
        self.profile = ProfileService()
        self.risk = RiskService()

    async def investigate(self, query: str, query_type: str, user_id: str | None = None):

        sources = []

        # =====================================================
        # DOMAIN
        # =====================================================

        if query_type == "domain":

            results = await asyncio.gather(
                call_with_resilience("RDAP", self.rdap.lookup, query),
                call_with_resilience("VirusTotal", self.virustotal.lookup, query),
                call_with_resilience("crt.sh", self.crtsh.lookup, query),
                call_with_resilience("Wayback", self.wayback.lookup, query),
                call_with_resilience("DNS", self.dns.lookup, query),
                call_with_resilience("WHOIS", self.whois.lookup, query),
                return_exceptions=True,
            )

        # =====================================================
        # USERNAME
        # =====================================================

        elif query_type == "username":

            results = await asyncio.gather(
                call_with_resilience("GitHub", self.github.lookup, query),
                call_with_resilience("UsernameEnum", self.username_enum.lookup, query),
                return_exceptions=True,
            )

        # =====================================================
        # EMAIL
        # =====================================================

        elif query_type == "email":

            local_part = query.split("@")[0]

            results = await asyncio.gather(
                call_with_resilience("Gravatar", self.gravatar.lookup, query),
                call_with_resilience("Holehe", self.holehe.lookup, query),
                call_with_resilience("HIBP", self.hibp.lookup, query),
                # Heuristic pivot: the local-part of an email is very often
                # reused as a handle elsewhere -- fan out into social
                # profile discovery too (objective: linked social profiles).
                call_with_resilience("UsernameEnum", self.username_enum.lookup, local_part),
                return_exceptions=True,
            )

        # =====================================================
        # PHONE
        # =====================================================

        elif query_type == "phone":

            results = await asyncio.gather(
                call_with_resilience("PhoneIntel", self.phone.lookup, query),
                return_exceptions=True,
            )

        # =====================================================
        # WALLET
        # =====================================================

        elif query_type == "wallet":

            if query.lower().startswith("0x"):
                results = await asyncio.gather(
                    call_with_resilience("Ethereum", self.wallet_eth.lookup, query),
                    return_exceptions=True,
                )
            else:
                results = await asyncio.gather(
                    call_with_resilience("Bitcoin", self.wallet_btc.lookup, query),
                    return_exceptions=True,
                )

        else:

            return {
                "success": False,
                "message": "Unsupported query type.",
                "query": query,
                "type": query_type,
                "sources": [],
                "profile": {},
                "risk": {},
                "correlation": {},
                "graph": {},
                "timeline": [],
                "summary": {},
                "image_correlation": {},
                "synthetic_identity": {},
                "related_cases": [],
            }

        # =====================================================
        # Convert connector responses
        # =====================================================

        for result in results:

            if isinstance(result, Exception):

                sources.append({
                    "source": "Unknown",
                    "success": False,
                    "error": str(result),
                    "data": {}
                })

            else:

                sources.append(result.model_dump())

        # =====================================================
        # IP Geolocation (follow-up on DNS A records for domain queries)
        # =====================================================

        if query_type == "domain":
            dns_source = next((s for s in sources if s["source"] == "DNS" and s["success"]), None)
            if dns_source and dns_source["data"].get("a"):
                first_ip = dns_source["data"]["a"][0]
                ip_result = await call_with_resilience("IPGeo", self.ip_geo.lookup, first_ip)
                sources.append(ip_result.model_dump())

        # =====================================================
        # Entity Correlation
        # =====================================================

        correlation = self.entity_engine.correlate(
            sources,
            query,
            query_type,
        )

        # =====================================================
        # Intelligence Profile
        # =====================================================

        profile = self.profile.build_profile(correlation)

        # =====================================================
        # Risk Analysis
        # =====================================================

        risk = self.risk.calculate(
            sources,
            correlation,
        )

        # =====================================================
        # Knowledge Graph
        # =====================================================

        graph = self.correlation.build_graph(
            query,
            query_type,
            correlation,
        )

        # =====================================================
        # Timeline
        # =====================================================

        timeline = self.timeline.build_timeline(
            query,
            query_type,
            sources,
        )

        # =====================================================
        # Image Correlation (reverse-image / same-photo detection)
        # =====================================================

        try:
            image_correlation = await correlate_images(sources)
        except Exception as e:  # noqa: BLE001
            image_correlation = {"enabled": False, "reason": str(e), "images": [], "matches": []}

        # =====================================================
        # Synthetic / fake-identity signal detection
        # =====================================================

        try:
            synthetic_identity = assess_synthetic_identity(sources, correlation, query, query_type)

            # Fold in the image-reuse signal if the image correlation step
            # found the same photo reused across multiple discovered profiles.
            if image_correlation.get("matches"):
                synthetic_identity["signals"].append({
                    "signal": "reused_profile_photo",
                    "weight": 20,
                    "detail": f"The same profile photo appears on "
                              f"{len(image_correlation['matches'])} discovered profile(s) -- "
                              f"could be one person's consistent avatar, or a stolen/stock photo "
                              f"reused across fake accounts.",
                })
                synthetic_identity["score"] = min(100, synthetic_identity["score"] + 20)

        except Exception as e:  # noqa: BLE001
            synthetic_identity = {"score": 0, "level": "Unknown", "signals": [], "error": str(e)}

        # =====================================================
        # Cross-case pattern linking (common links across your past cases)
        # =====================================================

        try:
            related_cases = await find_related_cases(
                correlation.get("entities", []), user_id, exclude_query=query
            )
        except Exception:  # noqa: BLE001
            related_cases = []

        # =====================================================
        # AI Summary
        # =====================================================

        summary = await self.ai.summarize(
            query,
            query_type,
            sources,
        )

        # =====================================================
        # Final Response
        # =====================================================

        return {
            "success": True,
            "query": query,
            "type": query_type,

            "sources": sources,

            "profile": profile,

            "risk": risk,

            "correlation": correlation,

            "graph": graph,

            "timeline": timeline,

            "image_correlation": image_correlation,

            "synthetic_identity": synthetic_identity,

            "related_cases": related_cases,

            "summary": summary,
        }
