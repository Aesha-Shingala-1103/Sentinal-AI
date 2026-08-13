"""Site definitions for username enumeration.

Each entry describes how to detect whether a username exists on a given
platform by requesting a profile URL and inspecting the response. This is
the same technique used by well-known open-source tools like Sherlock and
WhatsMyName: it only ever touches public profile pages, the same way a
browser would, and infers existence from HTTP status / page content --
no login, no scraping of private data, no ToS-violating automation of
protected endpoints.

Detection methods:
  - "status": profile exists if response status == 200, absent on 404
  - "status_negative": inverted -- 404 means it exists, 200 means it doesn't
    (some platforms return 200 with a "not found" body instead of a 404)
  - "text_absent": exists if status == 200 AND `error_text` is NOT in the body
"""

SITES = [
    {"name": "GitHub", "url": "https://github.com/{}", "method": "status"},
    {"name": "GitLab", "url": "https://gitlab.com/{}", "method": "status"},
    {"name": "Reddit", "url": "https://www.reddit.com/user/{}/about.json", "method": "status"},
    {"name": "Instagram", "url": "https://www.instagram.com/{}/", "method": "status"},
    {"name": "X (Twitter)", "url": "https://x.com/{}", "method": "status"},
    {"name": "TikTok", "url": "https://www.tiktok.com/@{}", "method": "status"},
    {"name": "YouTube", "url": "https://www.youtube.com/@{}", "method": "status"},
    {"name": "Twitch", "url": "https://www.twitch.tv/{}", "method": "status"},
    {"name": "Pinterest", "url": "https://www.pinterest.com/{}/", "method": "status"},
    {"name": "Medium", "url": "https://medium.com/@{}", "method": "status"},
    {"name": "DevTo", "url": "https://dev.to/{}", "method": "status"},
    {"name": "HackerNews", "url": "https://news.ycombinator.com/user?id={}", "method": "text_absent", "error_text": "No such user"},
    {"name": "Steam", "url": "https://steamcommunity.com/id/{}", "method": "text_absent", "error_text": "The specified profile could not be found"},
    {"name": "SoundCloud", "url": "https://soundcloud.com/{}", "method": "status"},
    {"name": "Telegram", "url": "https://t.me/{}", "method": "text_absent", "error_text": "If you have Telegram, you can contact"},
    {"name": "Keybase", "url": "https://keybase.io/{}", "method": "status"},
    {"name": "Docker Hub", "url": "https://hub.docker.com/u/{}", "method": "status"},
    {"name": "NPM", "url": "https://www.npmjs.com/~{}", "method": "status"},
    {"name": "PyPI", "url": "https://pypi.org/user/{}/", "method": "status"},
    {"name": "Product Hunt", "url": "https://www.producthunt.com/@{}", "method": "status"},
    {"name": "Facebook", "url": "https://www.facebook.com/{}", "method": "status"},
    {"name": "VK", "url": "https://vk.com/{}", "method": "text_absent", "error_text": "Page not found"},
    {"name": "Codepen", "url": "https://codepen.io/{}", "method": "status"},
    {"name": "Replit", "url": "https://replit.com/@{}", "method": "status"},
    {"name": "Behance", "url": "https://www.behance.net/{}", "method": "status"},
    {"name": "Dribbble", "url": "https://dribbble.com/{}", "method": "status"},
    {"name": "Spotify", "url": "https://open.spotify.com/user/{}", "method": "status"},
    {"name": "Kaggle", "url": "https://www.kaggle.com/{}", "method": "status"},
    {"name": "LeetCode", "url": "https://leetcode.com/{}/", "method": "status"},
    {"name": "HackerOne", "url": "https://hackerone.com/{}", "method": "status"},
]
