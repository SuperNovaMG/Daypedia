# Contributing to Daypedia 💜

Thanks for helping make Daypedia more useful, accessible, and fun.

## Before you start

- Search existing issues and pull requests to avoid duplicate work.
- For larger UI or architecture changes, open an issue first so the direction can be discussed.
- Keep the current lightweight stack: HTML, CSS, vanilla JavaScript, and JSON.

## Local setup

```bash
git clone https://github.com/SuperNovaMG/Daypedia.git
cd Daypedia
python -m http.server 8000
```

Open http://localhost:8000 in your browser. Any static server is fine.

## Pull request checklist

- [ ] The change has a clear, focused purpose.
- [ ] Desktop and mobile layouts remain usable.
- [ ] Search and date exploration still work when relevant.
- [ ] Dark and light themes have readable contrast.
- [ ] Language toggle labels remain correct.
- [ ] No secrets, API keys, or personal data are included.
- [ ] Calendar facts and dates are checked against reliable sources.

## Adding or editing calendar entries

Entries live in `days.json`. Keep the existing schema:

- `d`: month-day string in `MM-DD` format
- `name`: display name
- `cat`: category key
- `emoji`: optional visual marker
- `why_en` / `why_hi`: why the day is observed
- `who_en` / `who_hi`: organizer, origin, or context
- `fact_en` / `fact_hi`: a concise, verifiable fact

Guidelines:

1. Use accurate, neutral wording.
2. Distinguish official observances from informal or internet-created days.
3. Verify dates that vary by year, region, or lunar calendar, and document that nuance in the description.
4. Avoid copying long passages from sources.
5. Keep English and Hinglish versions consistent.
6. Validate the JSON before submitting.

## UI and accessibility

- Preserve visible keyboard focus.
- Use semantic HTML and accessible names for controls.
- Keep text contrast readable in both themes.
- Respect `prefers-reduced-motion`.
- Avoid adding dependencies unless there is a clear benefit.

## Commit and pull request style

Use a concise commit message that explains the change, for example:

- `Fix light-theme card contrast`
- `Add verified observance entries`
- `Improve mobile date explorer`

In your pull request, explain what changed, why it helps, and how you tested it. Add screenshots for visual changes when possible.

Thanks for contributing! ✨
