# Dangar Island Community Hall Website 🌿⛴️

Official single-page community website for **Dangar Island Community Hall**, located on Dyarubbin (Hawkesbury River), NSW, Australia.

Live Website: **[https://dangarislandcommunityhall.web.app](https://dangarislandcommunityhall.web.app)**

---

## 🎨 Visual Identity & Poster Aesthetic

The design is inspired by the iconic hand-illustrated Dangar Island Community Hall poster:
- **Colour Palette**: Vintage Parchment Cream (`#FAF4E8`), River Sage Green (`#D5ECDC`), Ochre Sun (`#F5B838`), Terracotta Red (`#D95A38`), Hawkesbury Navy (`#1C3B4B`), and Deep Bush Green (`#2D604A`).
- **Illustrations**: Handcrafted SVGs of the Hawkesbury River wooden ferry, native Kookaburras perched on gum branches, Banksia blossoms, and the circular *Dangar Island • Dyarubbin* emblem.

---

## ✨ Features

1. **What's On at the Hall (Whiteboard Timetable)**:
   - Digitised schedule from the entrance whiteboard:
     - **Mondays**: 8:00 am Yoga with Anna • 7:30 pm Warblers Community Choir
     - **Wednesdays**: 7:00 pm Bridge Night
     - **Thursdays**: 9:00 am Exercise with Brae • 2:00 pm Table Tennis • 7:30 pm Evening Gathering
     - **Fridays**: 8:00 am Yoga with Anna • After School Kids Music with Pete
   - **Alternating Bin-Week Switcher**: Automatically switches between **Green Bin Week** (*Cinématèque Film Night*) and **Yellow Bin Week** (*Discussion Group*).
   - **Category Filters**: Filter by Yoga & Wellness, Music & Choir, Games & Sports, or Talks & Cinema.
   - **Whiteboard Snapshot**: Modal displaying the original photo of the whiteboard.

2. **Share Your Ideas (Events, Talks, Classes)**:
   - Three illustrated callout cards for proposing community music events/feasts, environmental & history talks, and creative/fitness classes.
   - Quick-action buttons that scroll down to the Contact Form and pre-populate the selected category.

3. **Friends of the Hall (Membership / Subscription Support Model)**:
   - Spotlight for the upcoming subscription support model: *"Become a 'Friend of the Hall' and financially support the island and its community going forward."*
   - Early expression of interest signup form so community members can get notified when memberships launch.

4. **Support Our Hall (Merchandise)**:
   - Direct store link: [dangarislandmerch.reallycoolstores.com](https://dangarislandmerch.reallycoolstores.com)
   - Visual showcase of island organic cotton tees, pullover hoodie, and ceramic morning mug.

5. **Contact Us Form**:
   - Gathers ideas, bookings, and messages with honeypot spam protection.
   - Dispatches securely to `dangarislandhall@gmail.com` with instant visual confirmation and direct `mailto:` fallback.

6. **Acknowledgement of Country**:
   - Honouring the Traditional Custodians of Dyarubbin (Hawkesbury River) — the Guringai and Darug peoples.

---

## 🚀 Local Development

No heavy build tools or dependencies are required. You can serve the static site using any local HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Or using Firebase CLI Emulator
npx -y firebase-tools@latest emulators:start --only hosting
```

Open `http://localhost:8080` (or `http://localhost:5000`) in your web browser.

---

## 🚢 Deployment to Firebase Hosting

To deploy updates to Firebase Hosting:

```bash
# 1. Login if needed
npx -y firebase-tools@latest login

# 2. Deploy hosting target
npx -y firebase-tools@latest deploy --only hosting --project dangarislandcommunityhall
```

---

## 📄 License

This repository is open-sourced under the [MIT License](LICENSE).
