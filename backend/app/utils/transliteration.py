"""Local-language & transliteration handling (bonus objective).

Many South Asian usernames/handles are chosen in Latin script but are
transliterations of Hindi/Gujarati names (or vice versa). This generates
script variants of a query so username enumeration / search can fan out
across the way the same identity might actually appear online:

  "priya"  -> Devanagari: "प्रिय", Gujarati: "પ્રિય"
  "प्रिया" -> ITRANS/Latin: "priyaa"

Uses the `indic_transliteration` package (Sanscript), a real, actively
maintained transliteration engine -- not a hand-rolled guess table.
"""

from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

SCRIPT_MAP = {
    "devanagari": sanscript.DEVANAGARI,
    "gujarati": sanscript.GUJARATI,
}


def _looks_latin(text: str) -> bool:
    return all(ord(c) < 128 for c in text)


def generate_variants(query: str) -> dict:
    """Returns transliteration variants for a name/username query.

    If the input is Latin script, produces Devanagari + Gujarati variants
    (via the ITRANS romanization scheme, the common "Hinglish" convention).
    If the input is already in an Indic script, produces a romanized
    (Hinglish-style) variant instead.
    """

    variants = {}

    try:
        if _looks_latin(query):
            source_scheme = sanscript.ITRANS

            for label, target_scheme in SCRIPT_MAP.items():
                try:
                    variants[label] = transliterate(
                        query, source_scheme, target_scheme
                    )
                except Exception:  # noqa: BLE001
                    continue

        else:
            # Try Devanagari -> Latin, then Gujarati -> Latin
            for label, source_scheme in SCRIPT_MAP.items():
                try:
                    variants[f"{label}_to_latin"] = transliterate(
                        query, source_scheme, sanscript.ITRANS
                    )
                except Exception:  # noqa: BLE001
                    continue

    except Exception:  # noqa: BLE001
        pass

    return {
        "query": query,
        "variants": variants,
    }
