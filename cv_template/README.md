# VietCV F12 Import Workflow

1. Open a VietCV template and click `Use this template`.
2. Wait until the editor/CV iframe is visible.
3. Open DevTools Console and paste `tools/vietcv_f12_export_editor_snippet.js`.
4. Save the downloaded `vietcv-editor-rendered-*.json`.
5. Import it locally:

```powershell
node tools\import_vietcv_f12_export.js "C:\Users\Admin\Downloads\vietcv-editor-rendered-xxxxxxxxxxxx.json"
```

The importer creates:

- `vietcv_f12_templates/templates/<template-id>-<name>-local.html`
- `vietcv_f12_templates/<template-id>-config.json`
- updates `vietcv_f12_templates/index.html`

The generated HTML keeps VietCV's rendered DOM/CSS, makes text editable, and adds local color/font/language controls.
