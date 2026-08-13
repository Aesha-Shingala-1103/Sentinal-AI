from datetime import datetime


class TimelineService:

    def build_timeline(self, query: str, query_type: str, sources: list):

        timeline = []

        for source in sources:

            if not source.get("success"):
                continue

            source_name = source["source"]
            data = source.get("data") or {}

            # ----------------------------
            # VirusTotal Dates
            # ----------------------------

            if source_name == "VirusTotal":

                creation = data.get("creation_date")
                modification = data.get("last_modification_date")

                if creation:
                    timeline.append({
                        "date": datetime.utcfromtimestamp(creation).strftime("%Y-%m-%d %H:%M:%S UTC"),
                        "title": "Domain Created",
                        "source": "VirusTotal"
                    })

                if modification:
                    timeline.append({
                        "date": datetime.utcfromtimestamp(modification).strftime("%Y-%m-%d %H:%M:%S UTC"),
                        "title": "Last Modified",
                        "source": "VirusTotal"
                    })

            elif source["source"] == "Holehe":

                for account in source["data"]:

                    if account.get("exists"):

                        timeline.append({
                            "date": "Present",
                            "title": "Account Found",
                            "description": account.get("name")
                        })
            
            elif source["source"] == "Wayback":

                data = source["data"]

                if data.get("timestamp"):

                    timeline.append({
                        "date": data["timestamp"],
                        "title": "Archived Snapshot",
                        "description": data["url"]
                    })

        timeline.sort(key=lambda x: x["date"])

        return timeline