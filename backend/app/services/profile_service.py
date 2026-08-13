class ProfileService:

    def build_profile(self, correlation):

        profile = {
            "persons": [],
            "emails": [],
            "usernames": [],
            "domains": [],
            "organizations": [],
            "services": [],
            "profiles": [],
            "risk": "Unknown"
        }

        for entity in correlation.get("entities", []):

            t = entity["type"]
            value = entity["value"]

            if t == "person":
                profile["persons"].append(value)

            elif t == "email":
                profile["emails"].append(value)

            elif t == "username":
                profile["usernames"].append(value)

            elif t == "domain":
                profile["domains"].append(value)

            elif t == "organization":
                profile["organizations"].append(value)

            elif t == "service":
                profile["services"].append(value)

            elif t == "profile":
                profile["profiles"].append(value)

        profile["persons"] = list(set(profile["persons"]))
        profile["emails"] = list(set(profile["emails"]))
        profile["usernames"] = list(set(profile["usernames"]))
        profile["domains"] = list(set(profile["domains"]))
        profile["organizations"] = list(set(profile["organizations"]))
        profile["services"] = list(set(profile["services"]))
        profile["profiles"] = list(set(profile["profiles"]))

        return profile