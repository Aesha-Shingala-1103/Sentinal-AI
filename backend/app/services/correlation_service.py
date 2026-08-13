class CorrelationService:

    def build_graph(self, query: str, query_type: str, correlation: dict):

        nodes = []
        edges = []

        # Root node
        nodes.append({
            "id": query,
            "label": query,
            "type": query_type
        })

        # ---------------- Entities ----------------

        for entity in correlation.get("entities", []):

            nodes.append({
                "id": entity["id"],
                "label": entity["value"],
                "type": entity["type"],
                "sources": entity.get("sources", [])
            })

            if entity["id"] != query:

                edges.append({
                    "from": query,
                    "to": entity["id"],
                    "relation": "discovered",
                    "confidence": 100
                })

        # ---------------- Relationships ----------------

        for relation in correlation.get("relationships", []):

            edges.append({
                "from": relation["source"],
                "to": relation["target"],
                "relation": relation["relation"],
                "confidence": relation["confidence"]
            })

        return {
            "nodes": nodes,
            "edges": edges
        }