class RiskService:

    def calculate(self, sources, correlation):

        score = 0
        reasons = []

        # ----------------------------
        # VirusTotal
        # ----------------------------

        for source in sources:

            if source["source"] == "VirusTotal":

                data = source.get("data") or {}

                reputation = data.get("reputation", 0)

                if reputation < 0:
                    score += 35
                    reasons.append("Negative VirusTotal reputation")

                categories = data.get("categories", {})

                if categories:
                    score += 15
                    reasons.append("Security vendor classifications found")

        # ----------------------------
        # Entity Count
        # ----------------------------

        entities = len(correlation.get("entities", []))

        if entities > 10:
            score += 10
            reasons.append("Large number of correlated entities")

        # ----------------------------
        # Relationships
        # ----------------------------

        relationships = len(correlation.get("relationships", []))

        if relationships > 5:
            score += 15
            reasons.append("Multiple correlated relationships")

        # ----------------------------
        # Pivot Points
        # ----------------------------

        pivots = len(correlation.get("pivot_points", []))

        score += pivots * 2

        if score > 100:
            score = 100

        # ----------------------------

        if score >= 80:
            level = "Critical"

        elif score >= 60:
            level = "High"

        elif score >= 40:
            level = "Medium"

        else:
            level = "Low"

        return {
            "score": score,
            "level": level,
            "reasons": reasons
        }