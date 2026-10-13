<div align="center">

# ✦ Daypedia

### Every day has a story.

**Discover the festivals, awareness days, historic moments, and wonderfully niche observances that make every date interesting.**

[**🌐 Visit Daypedia**](https://daypedia.vercel.app) · [**🗓️ Explore the calendar**](https://daypedia.vercel.app/#explore) · [**💡 Suggest an improvement**](https://github.com/SuperNovaMG/Daypedia/issues/new)

<br />

![Daypedia](https://img.shields.io/badge/Daypedia-Every%20day%20has%20a%20story-8B5CF6?style=for-the-badge&labelColor=090D14)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111)
![Responsive](https://img.shields.io/badge/Design-Mobile--first-22D3EE?style=for-the-badge)
![License](https://img.shields.io/badge/License-Not%20specified-gray?style=for-the-badge)

</div>

---

## ✨ What is Daypedia?

Daypedia is a lightweight, mobile-friendly calendar of special days. From major festivals to awareness campaigns and delightfully obscure internet holidays, it helps you find a story behind the date.

Built with plain **HTML, CSS, and JavaScript**, Daypedia keeps the experience quick and approachable without a heavyweight framework.

## 🚀 Highlights

- **Today at a glance** — see the date, featured observances, and upcoming highlights.
- **Search & discover** — find days by name, category, or description.
- **Explore any date** — jump to a date and discover what's observed.
- **Browse categories** — festivals, awareness, national, international, food, and fun days.
- **English + Hinglish** — switch between language experiences.
- **Dark & light themes** — choose the vibe that works for you.
- **Share-worthy moments** — share a day with friends.
- **Responsive by design** — designed for phones first, with desktop layouts too.
- **No framework required** — easy to run, read, and contribute to.

## 🪄 The vibe

Daypedia's interface uses a dark, neon-inspired visual system with electric violet, soft cyan, bold typography, rounded cards, and subtle motion. The goal: a calendar that feels fresh and playful while keeping the information easy to scan.

## 🧰 Built with

| Technology | Role |
| --- | --- |
| HTML5 | Semantic page structure |
| CSS3 | Responsive layout, themes, cards, and motion |
| Vanilla JavaScript | Search, date handling, filters, theme and language controls |
| JSON | Observance data in `days.json` |
| Vercel | Production hosting and deployments |

## ⚡ Run locally

No package manager or build step is required.

1. Clone the repository:

   ```bash
   git clone https://github.com/SuperNovaMG/Daypedia.git
   cd Daypedia
   ```

2. Start a local static server. For example, if Python is installed:

   ```bash
   python -m http.server 8000
   ```

3. Open [http://localhost:8000](http://localhost:8000).

> You can also use VS Code's Live Server extension. Opening the HTML file directly may prevent JSON loading in some browsers, so a local server is recommended.

## 🗂️ Project structure

```text
Daypedia/
├── index.html       # Main page and semantic UI structure
├── styles.css       # Design system, themes, responsive styles
├── app.js           # Search, dates, filters, rendering and interactions
├── days.json        # Calendar and observance data
├── README.md        # Project overview and setup
└── CONTRIBUTING.md  # Contribution guidelines
```

## 🧩 Calendar data

Each entry in `days.json` uses a month-day key and includes display metadata plus English and Hinglish descriptions.

```json
{
  "d": "01-14",
  "name": "Makar Sankranti",
  "cat": "festival",
  "emoji": "🪁",
  "why_en": "A harvest festival celebrated in many parts of India.",
  "why_hi": "Bharat ke kai hisson mein manaya jane wala harvest festival.",
  "who_en": "A long-standing regional tradition.",
  "who_hi": "Ek purani regional parampara.",
  "fact_en": "Celebrations and names vary across regions.",
  "fact_hi": "Alag-alag regions mein iske naam aur celebrations alag hote hain."
}
```

**Data quality matters:** observances can be official, cultural, regional, or informal. Please verify dates and factual claims before submitting changes, and make the distinction clear when it matters.

## 🤝 Contributing

Ideas, bug reports, accessibility improvements, better translations, and carefully verified calendar entries are welcome.

1. Check existing issues before opening a new one.
2. Keep changes focused and mobile-friendly.
3. Preserve the lightweight HTML/CSS/JavaScript setup unless a larger change is discussed first.
4. For calendar data, include both `why_en` and `why_hi`, and both language variants for `who` and `fact`.
5. Test the page, search, date explorer, theme toggle, and language toggle before submitting.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the details.

## 🗺️ Roadmap

- [ ] Improve keyboard navigation and screen-reader support
- [ ] Add clearer source references for observance information
- [ ] Expand date and category filtering
- [ ] Polish share cards for social platforms
- [ ] Add automated checks for calendar-data consistency

Have an idea? [Open an issue](https://github.com/SuperNovaMG/Daypedia/issues/new).

## 🔐 Privacy & external services

Daypedia is a static front-end project. The current interface may load fonts and event imagery from third-party services, and the deployed site is hosted on Vercel. Those services may process standard request metadata according to their own policies. Review external dependencies before making privacy claims.

## 📄 License

No license file is currently included. Until a license is added, assume the source is **not licensed for reuse** beyond rights granted by applicable law. If you intend Daypedia to be open source, add a license that matches your goals.

---

<div align="center">

**Made for curious minds. 💜**

[Website](https://daypedia.vercel.app) · [Report a bug](https://github.com/SuperNovaMG/Daypedia/issues/new) · [Back to top ↑](#-daypedia)

</div>
