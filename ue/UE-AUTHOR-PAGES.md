# Use UE to Author Pages (Not Just Edit One Page)

You want **Universal Editor (UE) to be where you author pages** – create and edit pages, see your site, without having to use Document Authoring (DA) for that.

## If `editor.path` is already added

If you’ve already set **editor.path** in your DA org config but still see **only one page at a time** and **Home shows nothing**, use the checks below.

### 1. Verify the `editor.path` value

In **https://da.live/config#/pradeep-adobe/** (or your org), confirm:

- **Key:** exactly `editor.path`
- **Value format:** `CONTENT_PATH=UE_CANVAS_URL`
  - **Left side (content path):** usually `/` for the whole site, or the path that should open in UE (e.g. `/pradeep-adobe/da-block-poc1`). Must match how you browse content.
  - **Right side (UE URL):** full URL, no spaces. Example:
    - `https://experience.adobe.com/#/@pradeep-adobe/aem/editor/canvas/main--da-block-poc1--pradeep-adobe.ue.da.live`
  - Hostname must be: **`main--YOUR_SITE--YOUR_ORG.ue.da.live`** (e.g. site = `da-block-poc1`, org = `pradeep-adobe`).

If the path or hostname is wrong, fix and save.

### 2. Open from the DA library (not only from Sidekick)

With **editor.path** set, opening a **document from the DA library** should open it in UE:

1. Go to **https://da.live** and open your org/site.
2. Open a document/page from the library (e.g. index or any sheet).
3. You should be taken to **UE** for that page instead of the DA spreadsheet view.

If that works, **editor.path** is correct. The “one page at a time” experience may be how da.live UE works: you pick a document in DA and it opens in UE; UE itself may not show a full site tree in the Home screen.

### 3. Switching pages inside UE

When you’re already in UE:

- **Location bar:** Press **`l`** (letter L), type the path (e.g. `/`, `/my-page`), press Enter to open that page in UE.
- **Recents:** On the UE start/Home screen, check if **Recents** shows pages you opened; you can click one to go back.

### 4. If Home still shows nothing

The **Home** button in UE may go to the generic Experience Cloud / UE start screen. On da.live, that screen might not list your site’s pages; the list of documents may live in **DA** (library), and **editor.path** only controls “open this in UE when I pick it in DA.”

So the flow can be: **DA = list of pages**, **UE = edit the page you opened**. If that’s the case, it’s a current limitation of how da.live UE works, not something fixable in this repo.

### 5. Create new pages

- **From DA:** Create a new document/sheet in the DA library; with **editor.path** set, opening it should open in UE for authoring.
- **From UE:** If UE on da.live supports “new page” (e.g. from a toolbar or context menu), use that; otherwise new pages are created in DA and then edited in UE.

---

## Reference: correct `editor.path` for this project

For org **pradeep-adobe** and site **da-block-poc1**:

| Key          | Value |
|-------------|--------|
| `editor.path` | `/=https://experience.adobe.com/#/@pradeep-adobe/aem/editor/canvas/main--da-block-poc1--pradeep-adobe.ue.da.live` |

If your org/site differ, keep the form:

`/=https://experience.adobe.com/#/@YOUR_DX_HANDLE/aem/editor/canvas/main--YOUR_SITE--YOUR_ORG.ue.da.live`

## References

- [Setup Universal Editor (da.live)](https://docs.da.live/administrators/guides/setup-universal-editor)
- [Enable your project for UE](https://docs.da.live/developers/reference/universal-editor)
