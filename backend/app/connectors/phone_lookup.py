"""Phone number intelligence connector.

Uses Google's libphonenumber metadata (via the `phonenumbers` package) to
resolve region, carrier, line type, and timezone for a number. This is
real, offline metadata (no scraping, no key required) -- the same dataset
Android/iOS use to validate and format numbers worldwide.
"""

import phonenumbers
from phonenumbers import carrier, geocoder, timezone

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class PhoneLookupConnector(BaseConnector):

    async def lookup(self, phone: str) -> ConnectorResult:

        try:
            parsed = phonenumbers.parse(phone, None)

            if not phonenumbers.is_valid_number(parsed):
                return ConnectorResult(
                    source="PhoneIntel",
                    success=False,
                    error="Not a valid, dialable phone number.",
                )

            number_type_map = {
                phonenumbers.PhoneNumberType.MOBILE: "mobile",
                phonenumbers.PhoneNumberType.FIXED_LINE: "fixed_line",
                phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "fixed_line_or_mobile",
                phonenumbers.PhoneNumberType.TOLL_FREE: "toll_free",
                phonenumbers.PhoneNumberType.PREMIUM_RATE: "premium_rate",
                phonenumbers.PhoneNumberType.VOIP: "voip",
                phonenumbers.PhoneNumberType.PERSONAL_NUMBER: "personal_number",
                phonenumbers.PhoneNumberType.PAGER: "pager",
                phonenumbers.PhoneNumberType.UAN: "uan",
                phonenumbers.PhoneNumberType.UNKNOWN: "unknown",
            }

            return ConnectorResult(
                source="PhoneIntel",
                success=True,
                data={
                    "e164": phonenumbers.format_number(
                        parsed, phonenumbers.PhoneNumberFormat.E164
                    ),
                    "international": phonenumbers.format_number(
                        parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL
                    ),
                    "country_code": parsed.country_code,
                    "region": geocoder.description_for_number(parsed, "en"),
                    "carrier": carrier.name_for_number(parsed, "en") or "Unknown / ported / VOIP",
                    "line_type": number_type_map.get(
                        phonenumbers.number_type(parsed), "unknown"
                    ),
                    "timezones": list(timezone.time_zones_for_number(parsed)),
                    "possible": phonenumbers.is_possible_number(parsed),
                    "valid": True,
                },
            )

        except phonenumbers.NumberParseException as e:
            return ConnectorResult(
                source="PhoneIntel",
                success=False,
                error=f"Could not parse number: {e}",
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="PhoneIntel",
                success=False,
                error=str(e),
            )
